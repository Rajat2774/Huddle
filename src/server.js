require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { registerRealtimeHandlers } = require('./realtime');
const { scheduleAllActiveRooms, startRoomCleanupJob } = require('./realtime/roomTimers');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.set('io', io);

registerRealtimeHandlers(io);

server.listen(PORT, () => {
  console.log(`Chatroom API + realtime server listening on port ${PORT}`);
  scheduleAllActiveRooms(io).catch((err) => console.error('Failed to schedule room timers', err));
  startRoomCleanupJob();
});
