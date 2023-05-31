const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(require('cors')())

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


io.on('connection', (socket) => {
    // Join a room
    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`Client ${socket.id} joined room ${room}`);
    });

    // Handle chat message
    socket.on('chatMessage', (data) => {
        // Broadcast the message to all clients in the same room
        io.to(data.room).except(socket.id).emit('chatMessage', data.message);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Client ${socket.id} disconnected`);
    });
});


server.listen(3000, () => {
    console.log('listening on *:3000');
});