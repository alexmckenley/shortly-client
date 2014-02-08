var app = angular.module("shortlyApp", ['ngRoute'])
.config(function($routeProvider){

  $routeProvider
  .when('/', {
    controller: 'linksController',
    templateUrl: 'client/views/linksView.html'
  })
  .when('/create', {
    controller: 'createController',
    templateUrl: 'client/views/createView.html'
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
      data: JSON.stringify({url: url})
    });
  };
})
//Authentication Service
.service('AuthService', function($http, UserService){

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

});
