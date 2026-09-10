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

async function listActiveRooms(sort = 'ending_soon') {
  if (sort === 'active') {
    const result = await query(
      `SELECT r.*, COUNT(DISTINCT p.id)::int AS participant_count,
              COUNT(m.id) FILTER (WHERE m.created_at > now() - interval '5 minutes')::int AS recent_message_count
       FROM rooms r
       LEFT JOIN participants p ON p.room_id = r.id
       LEFT JOIN messages m ON m.room_id = r.id
       WHERE r.active_ends_at > now()
       GROUP BY r.id
       ORDER BY recent_message_count DESC, r.active_ends_at ASC`
    );
    return result.rows.map((room) => ({ ...room, status: deriveStatus(room) }));
  }

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

async function deleteRoom(roomId) {
  const result = await query(`DELETE FROM rooms WHERE id = $1 RETURNING id`, [roomId]);
  return result.rows.length > 0;
}

module.exports = { createRoom, listActiveRooms, getRoomById, deriveStatus, deleteRoom };
