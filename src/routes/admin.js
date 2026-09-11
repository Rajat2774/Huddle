const express = require('express');
const db = require('../db');

const router = express.Router();

// Middleware to verify admin passcode key
const verifyAdminKey = (req, res, next) => {
  // Allow CORS preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return next();
  }

  const rawAdminKey = process.env.ADMIN_KEY;
  if (!rawAdminKey) {
    return res.status(403).json({ error: 'Admin access key is not configured on server.' });
  }

  const adminKey = String(rawAdminKey).replace(/^["']|["']$/g, '').trim();
  const rawProvidedKey = req.headers['x-admin-key'] || req.query.key || '';
  const providedKey = String(rawProvidedKey).replace(/^["']|["']$/g, '').trim();

  if (!providedKey || providedKey !== adminKey) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing admin passcode.' });
  }

  next();
};

router.use(verifyAdminKey);

// GET /admin/stats - returns user statistics and room metrics
router.get('/stats', async (req, res, next) => {
  try {
    const usersCountResult = await db.query('SELECT COUNT(*)::int AS count FROM users');
    const totalUsers = usersCountResult.rows[0]?.count || 0;

    const signedInUsersCountResult = await db.query(
      'SELECT COUNT(*)::int AS count FROM users WHERE is_signed_in = true'
    );
    const signedInUsers = signedInUsersCountResult.rows[0]?.count || 0;

    const usersResult = await db.query(
      'SELECT id, email, name, picture, is_signed_in, signed_in_at, last_active_at FROM users ORDER BY is_signed_in DESC, last_active_at DESC LIMIT 100'
    );

    const roomsCountResult = await db.query('SELECT COUNT(*)::int AS count FROM rooms');
    const totalRooms = roomsCountResult.rows[0]?.count || 0;

    const activeRoomsResult = await db.query(
      'SELECT COUNT(*)::int AS count FROM rooms WHERE active_ends_at > NOW()'
    );
    const activeRooms = activeRoomsResult.rows[0]?.count || 0;

    const messagesCountResult = await db.query('SELECT COUNT(*)::int AS count FROM messages');
    const totalMessages = messagesCountResult.rows[0]?.count || 0;

    return res.json({
      totalUsers,
      signedInUsers,
      users: usersResult.rows,
      totalRooms,
      activeRooms,
      totalMessages,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

