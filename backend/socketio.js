var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);
var port = 8080;

/* GET home page. */
app.get('/', function(req, res, next) {
    res.sendFile('index.html', {root: "../views/"});
});

io.on('connection', function(socket){
    socket.on('connected', function() {
        io.emit('connected');
        console.log('a user connected');
    });

    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
        console.log('Chat message: ' + msg.body);
    });

    // When they disconnect, display message
    socket.on('disconnect', function(){
        io.emit('disconnect');
        console.log('user disconnected');
    });
});

http.listen(port, function() {
    console.log('listening on *:' + port);
});

module.exports = io;