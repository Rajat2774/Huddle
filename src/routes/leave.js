const express = require('express');
const router = express.Router({ mergeParams: true });
const participantService = require('../services/participantService');

router.post('/', async (req, res, next) => {
  try {
    const { sessionToken } = req.body;
    if (!sessionToken) {
      const err = new Error('sessionToken is required');
      err.status = 400;
      throw err;
    }
    const participant = await participantService.leaveRoom({
      roomId: req.params.id,
      sessionToken
    });

    if (participant) {
      const io = req.app.get('io');
      if (io) {
        io.to(req.params.id).emit('user_left', { nickname: participant.nickname });
      }
    }

    res.json({ ok: true, nickname: participant?.nickname });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
