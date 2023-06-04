const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { MongoClient } = require('mongodb');

// connecting to mongoDb
const mongoClient = new MongoClient("mongodb+srv://dipankajg1:motu_patalu@quickchat.stzv5i8.mongodb.net/?retryWrites=true&w=majority");

// function to get recent messages
async function getMessages(room) {
    // sapreting room and user name 
    const roomName = room.split(" ")[0]
    const userName = room.split(" ")[1]

    await mongoClient.connect();
    const db = mongoClient.db('quickchat');
    const userChats = db.collection('usersChat');
    // fetching the recent messages
    const recentMessages = await userChats.findOneAndUpdate({
        "roomKey": roomName
    },
        { $setOnInsert: { "roomKey": roomName, "chats": [] } },
        { upsert: true })
    return recentMessages.value.chats

}

async function pushMessage(message, userName, roomKey) {
    const messageFrame = { userName, message }
    roomKey = roomKey.split(' ')[0]
    await mongoClient.connect();
    const db = mongoClient.db('quickchat');
    const userChats = db.collection('usersChat');
    const oldMessage = await userChats.findOne({ "roomKey": roomKey.split(' ')[0] })
    let returnVal = await userChats.updateOne({
        "roomKey": roomKey
    }, {
        $set: {
            "chats": [...oldMessage.chats, messageFrame]
        }
    },
        { upsert: true })
    return returnVal
}

const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(require('cors')())

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});



io.on('connection', (socket) => {

    // Join a room
    socket.on('joinRoom', async (room = "room dipankaj") => {
        // create room if not exists already
        const roomName = room.split(" ")[0]
        const userName = room.split(" ")[1]
        socket.join(roomName);

        const recentMessages = await getMessages(room)
        console.log(recentMessages)
        console.log(`Client ${userName} joined ${roomName}`);

        io.to(roomName).emit('fetchRecentChats', recentMessages)

    });

    // Handle chat message
    socket.on('chatMessage', async (data) => {
        // Broadcast the message to all clients in the same room
        io.to(data.room).except(socket.id).emit('chatMessage', data.message);
        await pushMessage(data.message, data.userName, data.room)
        console.log(data.message, data.userName, data.room)
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Client ${socket.id} disconnected`);
    });
});


server.listen(3000, () => {
    console.log('listening on *:3000');
});