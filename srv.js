var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var staticfolder = __dirname + '/static';
var vendfolder = __dirname + '/node_modules';

app.use('/vend', express.static(vendfolder));
app.use(express.static(staticfolder));

var data = {
  cnt: 0
};

app.get('/', function(req, res){
  res.sendFile('view.html', {root: staticfolder});
});

app.get('/admin', function(req, res){
  res.sendFile('admin.html', {root: staticfolder});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('_changedata', function(msg){
    console.log("change", msg);
    io.emit('changedata', msg);
  });
});
