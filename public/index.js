import { promptDailog } from "./alertModal.js";
import { setCookie, hasWhiteSpace, getCookie, delete_cookie, capitalize, getCurrentTime, giveElement, $ } from "./utilityFunc.js";

let thisUser = undefined
let thisRoom = undefined
let secret_key = undefined
const socket = io({
    autoConnect: false
});

const nav = giveElement('nav', "w-screen fixed top-0 z-10 h-12 bg-slate-400 shadow-lg flex items-center justify-between p-2")
const logoutButton = giveElement('button', "ml-4 mb-2 exitIcon rounded-xl h-6 w-8")
const exitIcon = giveElement('img');
exitIcon.src = 'https://www.svgrepo.com/show/506720/logout.svg'
logoutButton.append(exitIcon)

const userNameElm = giveElement("span", "mr-4 text-green-900 font-bold")
const onlineUsers = giveElement('span', 'text-white capitalize')

nav.append(logoutButton, onlineUsers, userNameElm)


// have to change class string to array
const messageContainer = giveElement('div', 'messageContainer gap-3 pt-14 mb-[1rem] flex overflow-auto flex-1 flex-col [&>p]:px-3 [&>p]:py-2 [&>p]:pt-1 [&>p]:bg-slate-800 [&>p.left]:bg-slate-600 [&>p]:min-w-[6rem]')

// this box is container for input send message
const sendMessageBox = giveElement('div', 'sendMessageBox px-4 mb-2 gap-3 flex justify-center sticky bottom-0')
const inputElm = giveElement('textarea', 'rounded-md p-2 bg-slate-100 active:outline outline-lime-600 w-full active:bg-white focus:bg-white hover:bg-white resize-none h-12 text-slate-800')
inputElm.placeholder = "Message"

const sendMessageButton = giveElement('button', 'sendMessageButton hover:bg-green-600 active:bg-green-600 focus:bg-green-600 bg-green-500 transition-all')
const icon = giveElement('img', 'h-full w-full')
icon.src = "https://www.svgrepo.com/show/506555/send.svg"
sendMessageButton.append(icon)
sendMessageBox.append(inputElm, sendMessageButton)


// this event listener will remove cookie from storage by setting its expiration date to past
logoutButton.addEventListener('click', () => {
    delete_cookie("current_user_name")
    while (document.body.hasChildNodes()) {
        document.body.removeChild(document.body.firstChild)
    }
    window.location.reload(true)
})
// connect to socketIO if cookie exists
if (getCookie('current_user_name') != "") {
    socket.connect();
}
// connecting to server
socket.on('connect', () => {
    let room = document.getElementById('keyInputElm').value;
    if (getCookie('current_user_name') != "") {
        room = getCookie('current_user_name')
        secret_key = getCookie('current_user_name')
    }
    // check if cookie not stored, if not set it
    if (getCookie('current_user_name') == '') {
        setCookie('current_user_name', document.getElementById('keyInputElm').value.toLowerCase(), 400)
    }
    // dont change this secret key var else everything crash
    secret_key = room.toLowerCase()
    socket.emit('joinRoom', room.toLowerCase()); 6
    thisRoom = room.split(' ')[0]
    // setting thisUser name
    thisUser = room.split(' ')[1]
    userNameElm.innerText = `👤 ${capitalize(thisUser)}`
    // removing login and appending chat page
    document.getElementById('login').remove()
    document.body.append(nav, messageContainer, sendMessageBox)
    // set an event listener to send message button to handle message sending
    try {
        sendMessageButton.addEventListener('click', handleMessage)
    } catch (error) {
        console.log(error, 'this error was occured on send button')
    }
});

function scrollTop() {
    // messageContainer.scrollIntoView()
    // messageContainer.scrollTop = (messageContainer.scrollHeight)
    messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "instant",
    });
}

function createBubble({ position, message, time, senderName }) {
    const messageElm = giveElement('p', `relative flex flex-col ${position} mx-3 ${position === 'right' ? "self-end" : "self-start"}`)
    const timeElm = giveElement('span', "self-end text-gray-400 text-xs")
    const messageTxt = giveElement("span")
    timeElm.innerText = getCurrentTime(time)
    messageTxt.innerText = message

    if (senderName) {
        const nameElm = giveElement('span', "text-xs capitalize self-start text-xs text-lime-500")
        nameElm.innerText = senderName
        messageElm.append(nameElm, messageTxt, timeElm)
    } else {
        messageElm.append(messageTxt, timeElm)
    }
    // appending to main message container
    messageContainer.append(messageElm)
}

// handle message send event
function handleMessage() {
    if (thisUser.toLowerCase()!="dipankaj" && thisRoom.toLowerCase()=="@humdard") {
        promptDailog("You Are Restricted To Send Messages In This Room!","red")
        return
    }
    if (inputElm.value.trim() == "" || inputElm.value == '') return
    const messageData = {
        room: secret_key.toLowerCase(),
        userName: thisUser.toLowerCase(),
        message: inputElm.value,
        time: Date.now()
    };
    //sending message to server
    socket.emit('chatMessage', messageData);
    createBubble({ position: "right", message: messageData.message, time: messageData.time })
    scrollTop()
    inputElm.value = ""
    inputElm.focus()
}

// handle message recieve event 
socket.on('chatMessage', (data) => {
    createBubble({ position: 'left', message: data?.message, time: data?.time, senderName: data.userName })
    scrollTop()
});

socket.on('disconnect', () => {
    onlineUsers.textContent = "disconnect! reload please"
})
socket.on('fetchRecentChats', (arrayOfChats) => {

    for (let i = 0; i < arrayOfChats.length; i++) {
        let array = arrayOfChats[i];
        if (array.userName == thisUser) {
            createBubble({ position: 'right', message: array?.message, time: array?.time })
        }
        if (array.userName != thisUser) {
            createBubble({ position: 'left', message: array?.message, time: array?.time, senderName: array?.userName })
        }
    }
    scrollTop()

})
// handle online status
socket.on('userOnline', (userName) => {
    // Update the online status of the user in the UI
    console.log("im online", userName)
    onlineUsers.textContent = userName + " is online"
});


// checks if already logged in [with checking cookies]
if (getCookie('current_user_name') == "") {
    document.getElementById('loginEnterButton').addEventListener('click', () => {
        let inputValue = document.getElementById('keyInputElm').value;
        // return if input has no value inside and atleast one space in it
        if (inputValue.value != '' & hasWhiteSpace(inputValue)) {
            socket.connect()
            return
        }
    })
}

