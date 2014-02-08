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
.controller('linksController', function($scope, $http){
  $scope.sortBy = 'visits';
  $scope.reverse = true;
  $scope.cats = ['title','visits'];


  $http({
    method: 'GET',
    url: '/links'
  }).success(function(data, statusCode){
    $scope.links = data;

    console.log("Success", data);
  })
  .error(function(err){
    console.log(err);
  });

})
.controller('createController', function($scope, $http){
  $scope.added = [];

  $scope.createLink = function(){
    $http({
      method: 'POST',
      url: '/links',
      data: JSON.stringify($scope.newLink)
    }).success(function(data, statusCode){
      console.log("Created SUccessfully: ", data);
      $scope.added.push(data);
    }).error(function(err){
      console.log("There was an error!", err);
    });
  };

});
