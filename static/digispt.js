var socket = io();
var data = {
  activeView: "title",
  title: { headline: "Ueberschrift", subtitle: "Unterueberschrift", addinfo: "" },
  speakerlist: { list: [] }
};

angular.module('digispt', ['ngSanitize'])
.controller('ViewController', function($scope) {
  var d = this;
  d.data = data;

  this.active = function(viewname) {
    return viewname == d.data.activeView;
  };

  socket.on('changedata', function(data){
      d.data = JSON.parse(data);
      d.data.title.addinfo = d.data.title.addinfo.replace(/\n/g, "<br />");

      console.log('change', d.data);
      $scope.$apply();
  });

})
.controller('AdminController', function($scope, $sanitize) {
  var d = this;
  d.data = data;
  this.active = function(viewname) {
    return viewname == d.data.activeView;
  };
  this.send = function () {
    socket.emit("_changedata", JSON.stringify(d.data));
  }
});
