import { setCookie, hasWhiteSpace, getCookie, delete_cookie, capitalize, getCurrentTime, giveElement, $ } from "./utilityFunc.js";

let thisUser = undefined
let secret_key = undefined
const socket = io({
    autoConnect: false
});

const nav = giveElement('nav', "w-screen fixed top-0 h-16 z-50 bg-slate-500 shadow-lg flex items-center justify-between p-2")
const logoutButton = giveElement('button', "ml-4 rounded-xl h-6 w-8")
const exitIcon = giveElement('img');
exitIcon.src = 'https://www.svgrepo.com/show/506720/logout.svg'
logoutButton.append(exitIcon)

const userNameElm = giveElement("span", "")
const onlineUsers = giveElement('span', 'text-lime-400')

nav.append(logoutButton, onlineUsers, userNameElm)


// have to change class string to array
const messageContainer = giveElement('div', 'messageContainer gap-3 py-2 my-[1.5rem] flex overflow-auto flex-1 flex-col [&>p]:px-3 [&>p]:py-2 [&>p]:pt-1 [&>p]:bg-slate-800 [&>p.left]:bg-slate-600 [&>p]:min-w-[6rem]')


// this box is container for input send message
const sendMessageBox = giveElement('div', 'sendMessageBox bg-slate-950 p-2 mb-6 gap-3 flex justify-center sticky bottom-0')
const inputElm = giveElement('textarea', 'rounded-md pl-3 px-1 bg-slate-100 w-full active:bg-white focus:bg-white hover:bg-white resize-none outline-none h-14 text-slate-800')
inputElm.placeholder = "Message"

const sendMessageButton = giveElement('button', 'sendMessageButton outline-lime-400 hover:bg-slate-700 bg-lime-600 transition-all')
const icon = giveElement('img', 'h-full w-full')
icon.src = "https://www.svgrepo.com/show/506555/send.svg"
sendMessageButton.append(icon)
sendMessageBox.append(inputElm, sendMessageButton)

//setting up delete facility 

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
    // setting this tab user name
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
    // set initially set focus to input box
    inputElm.focus()
});

function scrollTop() {
    messageContainer.scrollTop = messageContainer.scrollHeight
}

function createBubble({ position, message, time, senderName }) {
    const messageElm = giveElement('p', `relative flex flex-col ${position} mx-3 ${position === 'right' ? "self-end" : "self-start"}`)
    const timeElm = giveElement('span', "self-end text-gray-400 text-xs")
    const messageTxt = giveElement("span")
    timeElm.innerText = getCurrentTime(time)
    messageTxt.innerText = message

    if (senderName) {
        const nameElm = giveElement('span', "text-xs capitalize self-start text-xs text-gray-300")
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

// const recentLazyMessages = []; // Your array with 50 elements
// let startIndex = 0; // Starting index of the elements to be displayed
// const displayCount = 30; // Number of elements to display at a time


// function displayMessages() {
//     const endIndex = Math.min(startIndex + displayCount, recentLazyMessages.length);
//     for (let i = startIndex; i < endIndex; i++) {
//         const message = recentLazyMessages[i];
//         // Create a new element to display the message (e.g., <p>, <div>, etc.)
//         const messageElement = document.createElement('p');
//         messageElement.classList.add('text-lg')
//         messageElement.textContent = message.message;
//         messageContainer.appendChild(messageElement);
//     }
//     startIndex = endIndex;

//     // Check if there are more messages to display
//     if (startIndex < recentLazyMessages.length) {
//         // Register a scroll event listener on the messageContainer
//         messageContainer.addEventListener('scroll', handleScroll);
//     }
// }

// function handleScroll() {
//     const containerHeight = messageContainer.offsetHeight;
//     const scrollTop = messageContainer.scrollTop;
//     const scrollHeight = messageContainer.scrollHeight;

//     // Check if the user has scrolled to the bottom
//     if (containerHeight + scrollTop >= scrollHeight) {
//         // Remove the scroll event listener to avoid multiple triggers
//         messageContainer.removeEventListener('scroll', handleScroll);

//         // Display the next set of messages
//         displayMessages();
//     }
// }

// Initial display of messages


// displaying all the recent chats
socket.on('fetchRecentChats', (arrayOfChats) => {
    // recentLazyMessages.push(...arrayOfChats)
    // console.log(recentLazyMessages[0].message)
    // displayMessages();

    for (let i = 0; i < arrayOfChats.length; i++) {
        let array = arrayOfChats[i];
        if (array.userName == thisUser) {
            createBubble({ position: 'right', message: array?.message, time: array?.time })
        }
        if (array.userName != thisUser) {
            createBubble({ position: 'left', message: array?.message, time: array?.time, senderName: array?.userName })
            scrollTop()
        }
    }
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
        if (inputValue != '' & hasWhiteSpace(inputValue)) {
            socket.connect()
            return
        }
    })
}



