const express = require('express');
const router = express.Router({ mergeParams: true });
const participantService = require('../services/participantService');

router.post('/', async (req, res, next) => {
  try {
    const { nickname } = req.body;
    if (!nickname) {
      const err = new Error('nickname is required');
      err.status = 400;
      throw err;
    }
    const participant = await participantService.joinRoom({ roomId: req.params.id, nickname });
    res.status(201).json(participant);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
