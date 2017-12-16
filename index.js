var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'app')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));

io.on('connection', function(socket){
  socket.on('chat', function(data){
    io.sockets.in(data.room).emit('chat', data.msg);
  });
  socket.on('join', function(room) {
    socket.join(room);
  });
});



app.get('/api/:name', function(req, res){	
	var name = req.params.name;
	fs.exists('data/' + name + '.json', function(exists) {
		if (exists) {
			fs.readFile('data/' + name + '.json', 'utf8', function (err, data) {
  				if (err) throw err;
  				res.json(JSON.parse(data));
			});
		}
	})
})

app.post('/api/:name', function(req, res){
	var data = req.body;
	var name = req.params.name;
	console.log('req',req.body);
	console.log('data',data);
	fs.writeFile('data/' + name + ".json", JSON.stringify(data), function(err, data) {
	    if(err) {
	        res.send(err);
	    }
	    res.json(data);
	});
})


http.listen(3000, "0.0.0.0", function(){
  console.log('listening on *:3000');
});

module.exports = app;