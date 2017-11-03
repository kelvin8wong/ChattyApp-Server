const express = require('express');
const ws = require('ws');
const uuidv4 = require('uuid/v4');

// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new ws.Server({ server });

//Broacast function
function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === ws.OPEN) {
      client.send(data);
    }
  });
}

let connectCounter = 0;
// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (socket) => {
  // update the number of connected users
  connectCounter++;
  console.log('Client connected');
  broadcast(JSON.stringify({type:"userCount", userCount: connectCounter}));

  // send message to clinets
  socket.on('message', (message) => {
    const newMessage = JSON.parse(message);
    if (newMessage.type === "postMessage" ) {
      console.log(`User ${newMessage.username} said ${newMessage.content}`);
      newMessage.type = "incomingMessage";
      newMessage.id = uuidv4();
    } else if (newMessage.type === "postNotification") {
      newMessage.type = "incomingNotification";
    }
    broadcast(JSON.stringify(newMessage));
  })

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  socket.on('close', () => {
    console.log('Client disconnected');
    connectCounter--;
    broadcast(JSON.stringify({type:"userCount", userCount: connectCounter}))
  })
});