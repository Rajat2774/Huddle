const { query } = require('../db');
const { scheduleRoomEnd } = require('./roomTimers');

function registerRealtimeHandlers(io) {
  io.on('connection', (socket) => {
    socket.on('join_room', async ({ roomId, sessionToken }, ack) => {
      try {
        const participant = await getValidParticipant(roomId, sessionToken);
        if (!participant) {
          return ack?.({ error: 'Invalid room or session token' });
        }

        const room = await getRoom(roomId);
        if (!room || new Date() > new Date(room.active_ends_at)) {
          return ack?.({ error: 'This room has ended' });
        }

        socket.data.roomId = roomId;
        socket.data.nickname = participant.nickname;
        socket.join(roomId);

        scheduleRoomEnd(io, room);
        ack?.({ ok: true, nickname: participant.nickname });
      } catch (err) {
        console.error('join_room error', err);
        ack?.({ error: 'Failed to join room' });
      }
    });

    socket.on('send_message', async ({ body }, ack) => {
      try {
        const { roomId, nickname } = socket.data;
        if (!roomId || !nickname) {
          return ack?.({ error: 'Join a room before sending messages' });
        }
        if (!body || !body.trim()) {
          return ack?.({ error: 'Message body is required' });
        }

        const room = await getRoom(roomId);
        if (!room || new Date() > new Date(room.active_ends_at)) {
          return ack?.({ error: 'This room has ended' });
        }

        const message = await saveMessage(roomId, nickname, body.trim());
        io.to(roomId).emit('new_message', message);
        ack?.({ ok: true });
      } catch (err) {
        console.error('send_message error', err);
        ack?.({ error: 'Failed to send message' });
      }
    });

    socket.on('leave_room', async ({ sessionToken }, ack) => {
      try {
        const roomId = socket.data.roomId;
        if (roomId && sessionToken) {
          const { leaveRoom } = require('../services/participantService');
          const participant = await leaveRoom({ roomId, sessionToken });
          if (participant) {
            io.to(roomId).emit('user_left', { nickname: participant.nickname });
          }
          socket.leave(roomId);
          socket.data = {};
        }
        ack?.({ ok: true });
      } catch (err) {
        console.error('leave_room error', err);
        ack?.({ error: 'Failed to leave room' });
      }
    });

    socket.on('disconnect', () => {
      // Socket disconnection (tab close / refresh / connection drop)
      // does not remove participant from room. Explicit leave is required.
    });
  });
}

async function getValidParticipant(roomId, sessionToken) {
  const result = await query(
    `SELECT nickname FROM participants WHERE room_id = $1 AND session_token = $2`,
    [roomId, sessionToken]
  );
  return result.rows[0] || null;
}

async function getRoom(roomId) {
  const result = await query(`SELECT id, active_ends_at FROM rooms WHERE id = $1`, [roomId]);
  return result.rows[0] || null;
}

async function saveMessage(roomId, nickname, body) {
  const result = await query(
    `INSERT INTO messages (room_id, nickname, body)
     VALUES ($1, $2, $3)
     RETURNING id, nickname, body, created_at`,
    [roomId, nickname, body]
  );
  return result.rows[0];
}

module.exports = { registerRealtimeHandlers };
