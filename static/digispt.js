var socket = io();
var data = {title:{}, speakerlist: {}};

angular.module('digispt', ['ngSanitize', 'angular-mousetrap'])
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
.controller('AdminController', function($scope, $sanitize, Mousetrap) {
  var d = this;
  d.data = data;
  this.active = function(viewname) {
    return viewname == d.data.activeView;
  };
  this.fixspeakerlist = function() {
    console.log("fixsp", d.data.speakerlist.list);
    if (d.data.speakerlist.list == undefined) {
      d.data.speakerlist.list = [];
    }
    var l = d.data.speakerlist.list;
    if (l.length == 0) { l.push({name:""}); }
    if (l[l.length - 1].name != "") l.push({name:""});
    console.log(d.data.speakerlist.list);
    for (var idx = l.length - 2; idx >= 0; idx--) {
      if (l[idx].name == "") l.splice(idx, 1);
    }
  }
  this.send = function () {
    socket.emit("_changedata", JSON.stringify(d.data));
  }
  Mousetrap.bind('alt+o', function() {d.send();});

  socket.on('init', function(data){
      d.data = JSON.parse(data);
      d.fixspeakerlist();
      $scope.$apply();
  });

  this.fixspeakerlist();
});
