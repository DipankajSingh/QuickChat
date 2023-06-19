const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(require('cors')());

const rooms = {};

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Connect to MongoDB
async function connectToMongoDB() {
    try {
        const mongoClient = new MongoClient("mongodb+srv://dipankajg1:motu_patalu@quickchat.stzv5i8.mongodb.net/?retryWrites=true&w=majority");
        await mongoClient.connect();
        console.log('Connected to MongoDB');
        return mongoClient;
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        throw err;
    }
}

// Function to get recent messages
async function getMessages(room, db) {
    const roomName = room.split(" ")[0];
    const userChats = db.collection('usersChat');
    const recentMessages = await userChats.findOneAndUpdate(
        { roomKey: roomName },
        { $setOnInsert: { roomKey: roomName, chats: [] } },
        { upsert: true, returnOriginal: false }
    );
    return recentMessages.value ? recentMessages.value.chats : [];
}

// Function to push a new chat message
async function pushMessage(message, userName, roomKey, messageId, time, db) {
    try {
        const messageFrame = { userName, message, messageId, time };
        roomKey = roomKey.split(' ')[0];
        const userChats = db.collection('usersChat');
        const oldMessage = await userChats.findOne({ roomKey: roomKey });
        const returnVal = await userChats.updateOne(
            { roomKey: roomKey },
            { $set: { chats: [...oldMessage.chats, messageFrame] } },
            { upsert: true }
        );
        return returnVal;
    } catch (err) {
        console.error('Failed to push message:', err);
        throw err;
    }
}

io.on('connection', (socket) => {
    // Join a room
    socket.on('joinRoom', async (room) => {
        const roomName = room.split(" ")[0];
        if (!rooms.hasOwnProperty(roomName)) {
            rooms[roomName] = [socket.id]; // Create a new room array if it doesn't exist
        } else {
            rooms[roomName].push(socket.id);
        }
        socket.join(roomName);
        [].push()
        // Retrieve the MongoDB client from the global scope
        const db = mongoClient.db('quickchat');

        const recentMessages = await getMessages(room, db);

        io.to(roomName).except(() => { if (rooms[roomName].length !== 0) return rooms[roomName][0] }).emit('fetchRecentChats', recentMessages);
        console.log(rooms);
    });

    socket.on('disconnect', () => {
        Object.keys(rooms).forEach((room) => {
            const index = rooms[room].indexOf(socket.id);
            if (index !== -1) {
                rooms[room].splice(index, 1);
            }
        });
        console.log(rooms);
    });

    // Handle chat message
    socket.on('chatMessage', async (data) => {
        // Broadcast the message to all clients in the same room, excluding the sender
        socket.to(data.room.split(' ')[0].toLowerCase()).emit('chatMessage', data);

        // Retrieve the MongoDB client from the global scope
        const db = mongoClient.db('quickchat');

        await pushMessage(data.message, data.userName, data.room, data.messageId, data.time, db);
    });
});

// Start the server and connect to MongoDB
const PORT = 3000;
const mongoClientPromise = connectToMongoDB();

mongoClientPromise.then((mongoClient) => {
    // Store the MongoDB client in the global scope for later use
    global.mongoClient = mongoClient;

    server.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
    });
}).catch((err) => {
    console.error('Failed to start the server:', err);
});
