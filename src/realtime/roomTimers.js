const { query } = require('../db');

const scheduledRooms = new Map(); // roomId -> timeout handle
const ROOM_CLEANUP_INTERVAL_MS = 60 * 1000;
let cleanupInterval;

function scheduleRoomEnd(io, room) {
  if (scheduledRooms.has(room.id)) return;

  const msUntilEnd = new Date(room.active_ends_at).getTime() - Date.now();
  if (msUntilEnd <= 0) return; // already ended, nothing to schedule

  const timeout = setTimeout(() => {
    io.to(room.id).emit('room_ended', { roomId: room.id });
    scheduledRooms.delete(room.id);
  }, msUntilEnd);

  scheduledRooms.set(room.id, timeout);
}

// Covers server restarts: any room still active in the DB gets its timer re-armed on boot.
async function scheduleAllActiveRooms(io) {
  const result = await query(`SELECT id, active_ends_at FROM rooms WHERE active_ends_at > now()`);
  result.rows.forEach((room) => scheduleRoomEnd(io, room));
}

async function cleanupExpiredRooms() {
  const result = await query(`DELETE FROM rooms WHERE archive_ends_at < now() RETURNING id`);
  if (result.rowCount > 0) {
    console.log(`Removed ${result.rowCount} expired room(s)`);
  }
  return result.rowCount;
}

function startRoomCleanupJob() {
  if (cleanupInterval) return;

  const runCleanup = () => {
    cleanupExpiredRooms().catch((err) => {
      console.error('Failed to clean up expired rooms', err);
    });
  };

  runCleanup();
  cleanupInterval = setInterval(runCleanup, ROOM_CLEANUP_INTERVAL_MS);
}

module.exports = { scheduleRoomEnd, scheduleAllActiveRooms, cleanupExpiredRooms, startRoomCleanupJob };
