var socket = io();
var data = {title:{}, speakerlist: {}, timetable: {}};
var padleft = function (text, fill, amount) {
  while (text.length < amount) {
    text = fill + text;
  }
  return text;
},
fixlist_fun = function(_data, listname, empty_generator, empty_check) {
  var generate_empty = function() {
    var o = empty_generator();
    o.id = Math.random();
    return o;
  };
  return function() {
    var data = _data();
    if (data[listname] === undefined) { data[listname] = []; }
    var l = data[listname];
    if (l.length == 0 || !empty_check(l[l.length - 1])) {
      l.push(generate_empty());
    }
    for (let idx = l.length - 2; idx >= 0; idx--) {
      if (empty_check(l[idx])) { l.splice(idx, 1); }
    }
  };
};

angular.module('digispt', ['ngSanitize', 'angular-mousetrap', 'dndLists'])
.controller('ViewController', function($scope) {
  var d = this;
  d.data = data;

  this.active = (viewname) => (viewname == d.data.activeView);
  this.nl2br = (str) => str.replace(/\n/g, "<br />");

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
  this.active = (viewname) => (viewname == d.data.activeView)

  this.fixspeakerlist = fixlist_fun(
    () => d.data.speakerlist, 'list',
    () => ({name: ""}),
    (o)=> o.name == "");

  this.fixtimetablelist = fixlist_fun(
    () => d.data.timetable, 'list',
    () => ({name: "", time: ""}),
    (o)=> o.name == "" && o.time == "" );

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

  this.send = () => socket.emit("_changedata", JSON.stringify(d.data));

  Mousetrap.bind('alt+o', () => d.send());

  socket.on('init', function(data){
      d.data = JSON.parse(data);
      d.fixspeakerlist();
      d.fixtimetablelist();
      $scope.$apply();
      socket.removeAllListeners('init');
  });

  this.setpreview = () => $('#preview iframe').attr('src', '/?data=' + encodeURI(JSON.stringify(d.data)));

  this.fixspeakerlist();
  this.fixtimetablelist();
  $(window).trigger('resize');
});
