/*jshint esversion: 6 */

var socket = io();
var data = {title:{}, speakerlist: {}, timetable: {}};
var fixlist_fun = function(_data, listname, empty_generator, empty_check) {
  var generate_empty = () => _.assign(empty_generator(), {id: Math.random()});
  return function() {
    var data = _data();
    if (data[listname] === undefined) { data[listname] = []; }
    let l = _.reject(data[listname], empty_check);
    l.push(generate_empty());
    data[listname] = l;
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
  this.active = (viewname) => (viewname == d.data.activeView);

  this.fixspeakerlist = fixlist_fun(
    () => d.data.speakerlist, 'list',
    () => ({name: ""}),
    (o)=> o.name === "");

  this.fixtimetablelist = fixlist_fun(
    () => d.data.timetable, 'list',
    () => ({name: "", time: ""}),
    (o)=> o.name === "" && o.time === "" );

  this.sorttimetablelist = function() {
    d.data.timetable.list = _.sortBy(d.data.timetable.list, (o) => _.padStart(o.time, 5, '0'));
    d.fixtimetablelist();
  };

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
