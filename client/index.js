const socket = io({
  autoConnect: false
});

const button = document.getElementById('loginEnterButton')

console.log(button)

button.addEventListener('click', (event) => {
  socket.connect();
});