var app = angular.module("shortlyApp", ['ngRoute'])
.config(function($routeProvider, $httpProvider){
  $httpProvider.interceptors.push('HttpAuthInteceptor');

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
    return true;
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
.service('HttpAuthInteceptor', function(UserService){
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
    //console.log("Request: ", req.method, req.url, req.data);
    return req;
  };
  this.response = function(res){
    console.dir(res);
    return res;
  };
  this.requestError = function(req){
    return req;
  };
  this.responseError = function(res){
    return res;
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

});
