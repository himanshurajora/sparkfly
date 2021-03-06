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
        score: '',
    }
}

const Ships = [];
// The socket io server to handle events realted to my game sparkfly - spaceship fights
io.on('connection', (socket) => {
    console.log('a user connected');

    // socket enter event to handle the ship enter the game
    // ship will provide it's initial data to the server and the server will return the ship's id
    socket.on('enter', (data) => {
        data.score = 0;
        console.log('enter event', data);
        const Ship = {
            id: socket.id,
            data: data
        }
        Ships.push(Ship);
        console.log('Ships', Ships);
        socket.emit('id', {
            id: socket.id,
            ships: Ships
        });
        // broadcast the new ship to all other ships
        socket.broadcast.emit('enter', Ship);
    });

    // socket update event to handle the ship update
    // ship will provide it's id and data to the server and the server will broadcast the ship's data to all other ships
    socket.on('move', (__Ship) => {
        const Ship = __Ship
        Ships.forEach((ship) => {
            if (ship.id === Ship.id) {
                ship.data = Ship.data;
            }
        });
        socket.broadcast.emit('move', Ship);
    });


    // handle the ship leave event
    // ship will provide it's id to the server and the server will broadcast that the ship left the game
    // THis is gonna be a disconnect event
    socket.on('disconnect', () => {
        console.log('user disconnected');
        // remove the ship from the ships array using the socket id
        Ships.forEach((ship, index) => {
            if (ship.id === socket.id) {
                Ships.splice(index, 1);
            }
        });

        // broadcast the ship left to all other ships
        console.log('Ships', socket.id)
        socket.broadcast.emit('left', socket.id);
    });


    // Bullet Machanism 
    socket.on('bullet', (data) => {
        socket.broadcast.emit('bullet', data);
    })
});

// Just A Sample API
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the game'
    })
});

http.listen(process.env.port | 5000, () => {
    console.log('listening... on', process.env.port | 5000);
});