var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http, {
    cors: {
        origin: '*',
        method: ['GET', 'POST']
    }
});

const users = [];
// The socket io server to handle events realted to my game sparkfly - spaceship fights
io.on('connection', (socket) => {

    // push the new user to the users array
    users.push(socket.id);
    // Ran when a socket connected
    console.log("Net Connection: ", socket.id)
    socket.broadcast.emit('newConnection', {
        id: socket.id
    })
    socket.on('hello', (data) => {
        // send id to that socket
        socket.emit('id', {
            id: socket.id,
            users: users
        })
    })
    // on space ship move
    socket.on('move', (data) => {
        socket.broadcast.emit('move', {
            id: socket.id,
            data: data
        })
    })
    // on user disconnect
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});



http.listen(5000, () => {
    console.log('listening on *:5000');
});