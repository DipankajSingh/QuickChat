const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(require('cors')())
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// connecting to mongoDb
const mongoClient = new MongoClient("mongodb+srv://dipankajg1:motu_patalu@quickchat.stzv5i8.mongodb.net/?retryWrites=true&w=majority");

// function to get recent messages
async function getMessages(room) {
    // sapreting room and user name 
    const roomName = room.split(" ")[0]
    await mongoClient.connect();
    const db = mongoClient.db('quickchat');
    const userChats = db.collection('usersChat');
    // fetching the recent messages
    const recentMessages = await userChats.findOneAndUpdate({ "roomKey": roomName }, { $setOnInsert: { "roomKey": roomName, "chats": [] } }, { upsert: true })
    return recentMessages.value.chats
}

async function pushMessage(message, userName, roomKey, messageId, time) {
    const messageFrame = { userName, message, messageId, time: time }

    roomKey = roomKey.split(' ')[0]
    await mongoClient.connect();
    const db = mongoClient.db('quickchat');
    const userChats = db.collection('usersChat');
    const oldMessage = await userChats.findOne({ "roomKey": roomKey.split(' ')[0] })
    let returnVal = await userChats.updateOne({ "roomKey": roomKey }, {
        $set: { "chats": [...oldMessage.chats, messageFrame] }
    }, { upsert: true })
    return returnVal
}


io.on('connection', (socket) => {
    // Join a room
    socket.on('joinRoom', async (room) => {
        // create room if not exists already
        const roomName = room.split(" ")[0]
        const userName = room.split(" ")[1]
        socket.join(roomName);
        const recentMessages = await getMessages(room)
        io.to(roomName).emit('fetchRecentChats', recentMessages)
        // console.log(recentMessages.chats.time)
    });
    // Handle chat message
    socket.on('chatMessage', async (data) => {
        // Broadcast the message to all clients in the same room
        io.to(data.room.split(' ')[0].toLowerCase()).except(socket.id).emit('chatMessage', data);
        await pushMessage(data.message, data.userName, data.room, data.messageId, data.time)
    });
});
server.listen(3000, () => {
    console.log('server started on port 3000');
});