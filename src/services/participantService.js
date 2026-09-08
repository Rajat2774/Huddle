const crypto = require('crypto');
const { pool } = require('../db');

function generateSessionToken() {
  return crypto.randomBytes(24).toString('hex');
}

async function joinRoom({ roomId, nickname }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Lock the room row so two concurrent joins can't both pass the capacity check
    // before either has inserted a participant.
    const room = await client.query(
      `SELECT max_participants FROM rooms WHERE id = $1 FOR UPDATE`,
      [roomId]
    );
    if (room.rows.length === 0) {
      const err = new Error('Room not found');
      err.status = 404;
      throw err;
    }

    const existing = await client.query(
      `SELECT id FROM participants WHERE room_id = $1 AND nickname = $2`,
      [roomId, nickname]
    );
    if (existing.rows.length > 0) {
      const err = new Error('Nickname already taken in this room');
      err.status = 409;
      throw err;
    }

    const count = await client.query(
      `SELECT COUNT(*)::int AS count FROM participants WHERE room_id = $1`,
      [roomId]
    );
    if (count.rows[0].count >= room.rows[0].max_participants) {
      const err = new Error('Room is full');
      err.status = 409;
      throw err;
    }

    const sessionToken = generateSessionToken();
    const result = await client.query(
      `INSERT INTO participants (room_id, nickname, session_token)
       VALUES ($1, $2, $3)
       RETURNING id, room_id, nickname, session_token, joined_at`,
      [roomId, nickname, sessionToken]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { joinRoom, generateSessionToken };
