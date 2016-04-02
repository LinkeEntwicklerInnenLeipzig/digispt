var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var babel = require("babel-core");

var staticfolder = __dirname + '/static';
var vendfolder = __dirname + '/node_modules';

// Generate ES5
var generate_es5 = function(filename) {
  var options = {presets: ["es2015"]}
      code = babel.transformFileSync(
              staticfolder + '/' + filename + '.es6.js',
              options
             ).code;
  fs.writeFileSync(staticfolder + '/' + filename + '.js', code);
}
generate_es5('digispt');

// Static Data
app.use('/vend', express.static(vendfolder));
app.use(express.static(staticfolder));

app.get('/', function(req, res){
  res.sendFile('view.html', {root: staticfolder});
});

app.get('/admin', function(req, res){
  res.sendFile('admin.html', {root: staticfolder});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

// Connections
var data = { last: "{}" };
data.last = JSON.parse(fs.readFileSync(__dirname + '/data.default.json'));
var datafile = __dirname + '/data.json'
try {
  data.last = JSON.parse(fs.readFileSync(datafile));
} catch (ex) { }

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('_changedata', function(msg){
    console.log("change", msg);
    io.emit('changedata', msg);
    data.last = JSON.parse(msg);
    fs.writeFileSync(datafile, JSON.stringify(data.last));
  });
  io.emit('init', JSON.stringify(data.last));
  io.emit('changedata', JSON.stringify(data.last));
});
