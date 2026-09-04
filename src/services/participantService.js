const crypto = require('crypto');
const { query } = require('../db');

function generateSessionToken() {
  return crypto.randomBytes(24).toString('hex');
}

async function joinRoom({ roomId, nickname }) {
  const room = await query(`SELECT max_participants FROM rooms WHERE id = $1`, [roomId]);
  if (room.rows.length === 0) {
    const err = new Error('Room not found');
    err.status = 404;
    throw err;
  }

  const existing = await query(
    `SELECT id FROM participants WHERE room_id = $1 AND nickname = $2`,
    [roomId, nickname]
  );
  if (existing.rows.length > 0) {
    const err = new Error('Nickname already taken in this room');
    err.status = 409;
    throw err;
  }

  const count = await query(
    `SELECT COUNT(*)::int AS count FROM participants WHERE room_id = $1`,
    [roomId]
  );
  if (count.rows[0].count >= room.rows[0].max_participants) {
    const err = new Error('Room is full');
    err.status = 409;
    throw err;
  }

  const sessionToken = generateSessionToken();
  const result = await query(
    `INSERT INTO participants (room_id, nickname, session_token)
     VALUES ($1, $2, $3)
     RETURNING id, room_id, nickname, session_token, joined_at`,
    [roomId, nickname, sessionToken]
  );
  return result.rows[0];
}

module.exports = { joinRoom, generateSessionToken };
