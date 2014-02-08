var app = angular.module("shortlyApp", ['ngRoute'])
.config(function($routeProvider, $httpProvider){
  $httpProvider.interceptors.push('AuthService');

  $routeProvider
  .when('/', {
    controller: 'linksController',
    templateUrl: 'client/views/linksView.html'
  })
  .when('/create', {
    controller: 'createController',
    templateUrl: 'client/views/createView.html'
  })
  .when('/login', {
    controller: 'loginController',
    templateUrl: 'client/views/loginView.html'
  });

})

//User Service
.service('UserService', function(){
  var currentUser = null;
  this.setUser = function(u){
    currentUser = u;
  };
  this.currentUser = function(){
    return currentUser;
  };

  this.login = function(u){

  };
})
//Link Service
.service("LinkService", function($http){
  this.getLinks = function(){
    return $http({
      method: 'GET',
      url: '/links'
    });
  };

  this.createLink = function(url) {
    return $http({
      method: 'POST',
      url: '/links',
      data: {url: url}
    });
  };
})

//Authentication Service
.service('AuthService', function(UserService, $location){
  var encodeData = function (data) {
     var ret = [];
     for (var d in data)
        ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
     return ret.join("&");
  };

  this.request = function(req){
    if(UserService.currentUser()){
      req.url += "?" + encodeData({token: Math.random()}); 
    }
    return req;
  };
  this.response = function(res){

    return res;
  };
  this.requestError = function(req){
    return req;
  };
  this.responseError = function(res){
    if (res.status == 401) {
      console.dir("REJECTED");
      $location.path("/login");
    }
    return res;
  };

  this.login = function(){
    $http({
      method: 'POST',
      url: '/login',
      data: u
    }).success(function(data){
      currentUser = data;
      $location.path('/');
    }).error(function (err) {
      console.log("error logging in: ", err);
    });
  };
})

.controller('linksController', function($scope, LinkService){
  $scope.sortBy = 'visits';
  $scope.reverse = true;
  $scope.cats = ['title','visits'];


  LinkService.getLinks().success(function(data, statusCode){
    $scope.links = data;

    console.log("Success", data);
  })
  .error(function(err){
    console.log(err);
  });

})

.controller('createController', function($scope, LinkService){
  $scope.added = [];

  $scope.createLink = function(){
    LinkService.createLink($scope.newLink.url).success(function(data, statusCode){
      console.log("Created SUccessfully: ", data);
      $scope.added.push(data);
    }).error(function(err){
      console.log("There was an error!", err);
    });
  };

})

.controller('loginController', function($scope, UserService){

  $scope.login = function () {
    
  }

});
