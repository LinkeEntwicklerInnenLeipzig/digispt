var socket = io();
var data = {title:{}, speakerlist: {}, timetable: {}};
var padleft = function (text, fill, amount) {
  while (text.length < amount) {
    text = fill + text;
  }
  return text;
};

angular.module('digispt', ['ngSanitize', 'angular-mousetrap', 'dndLists'])
.controller('ViewController', function($scope) {
  var d = this;
  d.data = data;

  this.active = function(viewname) {
    return viewname == d.data.activeView;
  };

  this.nl2br = function(str) {
    return str.replace(/\n/g, "<br />");
  }

  this.urlParam = function(name){ // http://www.sitepoint.com/url-parameters-jquery/
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results === null || results === undefined) { return undefined; }
    return results[1] || 0;
  };
  d.overridedata = d.urlParam('data');

  if (d.overridedata) {
    d.data = JSON.parse(decodeURI(d.overridedata));
  }
  else {
    socket.on('changedata', function(data){
        d.data = JSON.parse(data);
        console.log('change', d.data);
        $scope.$apply();
    });
  }

})
.controller('AdminController', function($scope, $sanitize, Mousetrap) {
  var d = this;
  d.data = data;
  this.active = function(viewname) {
    return viewname == d.data.activeView;
  };
  this.fixspeakerlist = function() {
    if (d.data.speakerlist.list == undefined) {
      d.data.speakerlist.list = [];
    }
    var l = d.data.speakerlist.list;
    if (l.length == 0) { l.push({name:"", id: Math.random()}); }
    if (l[l.length - 1].name != "") l.push({name:"", id: Math.random()});
    console.log(d.data.speakerlist.list);
    for (var idx = l.length - 2; idx >= 0; idx--) {
      if (l[idx].name == "") l.splice(idx, 1);
    }
  }
  this.fixtimetablelist = function() {
    if (d.data.timetable.list == undefined) {
      d.data.timetable.list = [];
    }
    var l = d.data.timetable.list;
    if (l.length == 0) { l.push({name:"", time: "", id: Math.random()}); }
    if (l[l.length - 1].name != "" || l[l.length - 1].time != "") l.push({name:"", time: "", id: Math.random()});
    for (var idx = l.length - 2; idx >= 0; idx--) {
      if (l[idx].name == "" && l[idx].time == "") l.splice(idx, 1);
    }
  }
  this.sorttimetablelist = function() {
    d.data.timetable.list.sort(function(a,b){
      var _a = padleft(a.time, '0', 5),
          _b = padleft(b.time, '0', 5);
      if (_a < _b) { return -1; }
      if (_a > _b) { return 1; }
      return 0;
    });
    d.fixtimetablelist();
  }

  this.send = function () {
    socket.emit("_changedata", JSON.stringify(d.data));
  }
  Mousetrap.bind('alt+o', function() {d.send();});

  socket.on('init', function(data){
      d.data = JSON.parse(data);
      d.fixspeakerlist();
      d.fixtimetablelist();
      $scope.$apply();
      socket.removeAllListeners('init');
  });

  this.setpreview = function () {
    $('#preview iframe').attr('src', '/?data=' + encodeURI(JSON.stringify(d.data)));
  }

  this.fixspeakerlist();
  this.fixtimetablelist();
  $(window).trigger('resize');
});
