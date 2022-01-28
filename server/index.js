var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http, {
    cors: {
        origin: '*',
        method: ['GET', 'POST']
    }
});

const IShips = {
    id: '',
    data: {
        x: '',
        y: '',
        rotation: '',
        health: '',
    }
}

const Ships = [];
// The socket io server to handle events realted to my game sparkfly - spaceship fights
io.on('connection', (socket) => {
    console.log('a user connected');

    // socket enter event to handle the ship enter the game
    // ship will provide it's initial data to the server and the server will return the ship's id
    socket.on('enter', (data) => {
        console.log('enter event', data);
        const Ship = {
            id: socket.id,
            data: data
        }
        Ships.push(Ship);
        socket.emit('enter', Ship);
    });

    // socket update event to handle the ship update
    // ship will provide it's id and data to the server and the server will broadcast the ship's data to all other ships
    socket.on('update', (data) => {
        console.log('update event', data);
        const Ship = {
            id: socket.id,
            data: data
        }
        Ships.forEach((ship) => {
            if (ship.id === Ship.id) {
                ship.data = Ship.data;
            }
        });
        socket.broadcast.emit('update', Ship);
    });

});



http.listen(5000, () => {
    console.log('listening on *:5000');
});