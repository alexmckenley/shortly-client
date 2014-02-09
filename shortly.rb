require 'sinatra'
require "sinatra/reloader" if development?
require 'active_record'
require 'digest/sha1'
require 'pry'
require 'uri'
require 'open-uri'
require 'bcrypt'
# require 'nokogiri'

###########################################################
# Configuration
###########################################################

set :public_folder, File.dirname(__FILE__) + '/public'

configure :development, :production do
    ActiveRecord::Base.establish_connection(
       :adapter => 'sqlite3',
       :database =>  'db/dev.sqlite3.db'
     )
end

# Handle potential connection pool timeout issues
after do
    ActiveRecord::Base.connection.close
end

# turn off root element rendering in JSON
ActiveRecord::Base.include_root_in_json = false

###########################################################
# Models
###########################################################
# Models to Access the database through ActiveRecord.
# Define associations here if need be
# http://guides.rubyonrails.org/association_basics.html

class Link < ActiveRecord::Base
    has_many :clicks

    validates :url, presence: true

    before_save do |record|
        record.code = Digest::SHA1.hexdigest(url)[0,5]
    end
end

class Click < ActiveRecord::Base
    belongs_to :link, counter_cache: :visits
end

class User < ActiveRecord::Base
  has_many :sessions

  attr_accessor :password
  # EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
  validates :username, :presence => true, :uniqueness => true, :length => { :in => 3..20 }
  validates :email, :presence => true, :uniqueness => true #, :format => EMAIL_REGEX
  validates :encrypted_password, :presence => true
end

class Session < ActiveRecord::Base
  belongs_to :user

  before_save do |record|
      record.token = Digest::SHA1.hexdigest(record.user_id.to_s + Time.now.to_s)
  end

end

###########################################################
# Routes
###########################################################
before do
  unless request.path_info == "/" || request.path_info == "/login" || request.path_info == "/signup"
    if Session.find_by_token(params[:token])

    else
      halt 401, "Not authorized\n"
    end
  end
end


['/', '/create'].each do |route|
    get route do
        erb :index
    end
end

post '/login' do
  request.body.rewind
  request_payload = JSON.parse request.body.read

  user = User.find_by_username(request_payload["username"])
  puts "Found User: ", user.inspect
  if user == nil
    halt 419, "No such user exists\n"
  else
    oldHash = BCrypt::Password.new user.encrypted_password
    if(oldHash == request_payload["password"])
      user.sessions.create()
      user.sessions.last().token

    end
  end
end

post '/signup' do
  hash = BCrypt::Password.create params[:password]
  user = User.create(username: params[:username], email: params[:email], encrypted_password: hash.to_s)
  user.to_json
end

get '/links' do
    links = Link.order("created_at DESC")
    links.map { |link|
        link.as_json.merge(base_url: request.base_url)
    }.to_json
end

post '/links' do
    data = JSON.parse request.body.read
    uri = URI(data['url'])
    raise Sinatra::NotFound unless uri.absolute?
    link = Link.find_by_url(uri.to_s) ||
           Link.create( url: uri.to_s, title: get_url_title(uri) )
    link.as_json.merge(base_url: request.base_url).to_json
end

get '/:url' do
    link = Link.find_by_code params[:url]
    raise Sinatra::NotFound if link.nil?
    link.clicks.create!
    redirect link.url
end

###########################################################
# Utility
###########################################################

def read_url_head url
    head = ""
    url.open do |u|
        begin
            line = u.gets
            next  if line.nil?
            head += line
            break if line =~ /<\/head>/
        end until u.eof?
    end
    head + "</html>"
end

def get_url_title url
    # Nokogiri::HTML.parse( read_url_head url ).title
    result = read_url_head(url).match(/<title>(.*)<\/title>/)
    result.nil? ? "" : result[1]
end
