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
.controller('createController', function($scope){

});
