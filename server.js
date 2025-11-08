// server.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let sender = null;
let viewers = [];

wss.on('connection', ws => {
  ws.on('message', message => {
    const data = JSON.parse(message);

    if (data.type === 'sender') {
      sender = ws;
      console.log('📸 Sender connected');
    } else if (data.type === 'viewer') {
      viewers.push(ws);
      console.log('👀 Viewer connected');
    } else if (data.type === 'offer' && ws === sender) {
      viewers.forEach(v => v.send(JSON.stringify({ type: 'offer', offer: data.offer })));
    } else if (data.type === 'answer') {
      sender?.send(JSON.stringify({ type: 'answer', answer: data.answer }));
    } else if (data.type === 'candidate') {
      if (ws === sender) {
        viewers.forEach(v => v.send(JSON.stringify({ type: 'candidate', candidate: data.candidate })));
      } else {
        sender?.send(JSON.stringify({ type: 'candidate', candidate: data.candidate }));
      }
    }
  });

  ws.on('close', () => {
    if (ws === sender) sender = null;
    else viewers = viewers.filter(v => v !== ws);
  });
});

console.log("✅ WebSocket server running on ws://localhost:8080");
