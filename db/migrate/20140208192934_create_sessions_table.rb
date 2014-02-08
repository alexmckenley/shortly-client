class CreateSessionsTable < ActiveRecord::Migration

  def self.up
    create_table :sessions do |t|
        t.string :token
        t.integer :user_id
        t.timestamps
    end
  end

  def self.down
      drop_table :sessions
  end

end