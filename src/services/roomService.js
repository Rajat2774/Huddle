const { query } = require('../db');

const DEFAULT_MAX_PARTICIPANTS = 20;

function deriveStatus(room) {
  const now = new Date();
  if (now < new Date(room.active_ends_at)) return 'active';
  if (now < new Date(room.archive_ends_at)) return 'archived';
  return 'expired';
}

async function createRoom({ topic, creatorNickname, durationMinutes, maxParticipants }) {
  const startedAt = new Date();
  const activeEndsAt = new Date(startedAt.getTime() + durationMinutes * 60000);
  const archiveEndsAt = new Date(activeEndsAt.getTime() + 24 * 60 * 60000);

  const result = await query(
    `INSERT INTO rooms
       (topic, creator_nickname, max_participants, duration_minutes, started_at, active_ends_at, archive_ends_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      topic,
      creatorNickname,
      maxParticipants || DEFAULT_MAX_PARTICIPANTS,
      durationMinutes,
      startedAt,
      activeEndsAt,
      archiveEndsAt
    ]
  );

  const room = result.rows[0];
  return { ...room, status: deriveStatus(room) };
}

async function listActiveRooms() {
  const result = await query(
    `SELECT r.*, COUNT(p.id)::int AS participant_count
     FROM rooms r
     LEFT JOIN participants p ON p.room_id = r.id
     WHERE r.active_ends_at > now()
     GROUP BY r.id
     ORDER BY r.active_ends_at ASC`
  );
  return result.rows.map((room) => ({ ...room, status: deriveStatus(room) }));
}

async function getRoomById(roomId) {
  const result = await query(`SELECT * FROM rooms WHERE id = $1`, [roomId]);
  if (result.rows.length === 0) return null;
  const room = result.rows[0];
  return { ...room, status: deriveStatus(room) };
}

module.exports = { createRoom, listActiveRooms, getRoomById, deriveStatus };
