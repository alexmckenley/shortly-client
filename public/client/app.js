var app = angular.module("shortlyApp", []);
app.controller("mainController", ['$scope', function($scope){
  $scope.playing = false;
  $scope.audio = document.createElement('audio'); 
  $scope.audio.src = "/audio/npr.mp4";
  $scope.play = function(){
    $scope.audio.play();
    $scope.playing = true;
  };
  $scope.stop = function(){
    $scope.audio.pause();
    $scope.playing = false;
  };
  $scope.audio.addEventListener('ended', function() {
    $scope.$apply(function() {
      $scope.stop()
    });
  });
}]);

