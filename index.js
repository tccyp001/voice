var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
app.use("/public", express.static(path.join(__dirname, 'public')));

app.get('/player', function(req, res){
  res.sendFile(__dirname + '/player.html');
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/voice', function(req, res){
  res.sendFile(__dirname + '/voice.html');
});


io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});