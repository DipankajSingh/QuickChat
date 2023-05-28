const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static('client'))


app.get('/', (req, res) => {
    res.sendFile(express.static,);
});

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('chat message', (msg) => {
        console.log(msg)
        io.to()
        io.except(...socket.rooms).emit('chat message', msg)
        console.log(typeof [...socket.rooms][0])
    })
});


server.listen(3000, () => {
    console.log('listening on *:3000');
});