const express = require('express');
const router = express.Router({ mergeParams: true });
const { query } = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, nickname, body, created_at
       FROM messages
       WHERE room_id = $1 AND is_hidden = false
       ORDER BY created_at ASC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
