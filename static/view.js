angular.module('view', [])
.controller('ViewController', function($scope) {
  var d = this;
  d.text = 'init';

  var socket = io();
  socket.on('changedata', function(data){
      console.log('change', data);
      d.data = JSON.parse(data);
      $scope.$apply();
  });

});
