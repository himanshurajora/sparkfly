var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http, {
    cors: {
        origin: '*',
        method: ['GET', 'POST']
    }
});

// The socket io server to handle events realted to my game sparkfly - spaceship fights
io.on('connection', (socket) => {
    // Ran when a socket connected
    console.log("Net Connection: ", socket.id)
    socket.on('hello', (data) => {
        console.log(data)
    })
    // on space ship move
    socket.on('move', (data) => {
        console.log(data)
        socket.broadcast.emit('move', data)
    })
    // on user disconnect
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});



http.listen(5000, () => {
    console.log('listening on *:5000');
});