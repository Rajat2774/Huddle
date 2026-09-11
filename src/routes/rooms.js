const express = require('express');
const router = express.Router();
const roomService = require('../services/roomService');

router.post('/', async (req, res, next) => {
  try {
    const { topic, creatorNickname, creatorUserId, durationMinutes, maxParticipants } = req.body;
    if (!topic || !creatorNickname || !durationMinutes) {
      const err = new Error('topic, creatorNickname, and durationMinutes are required');
      err.status = 400;
      throw err;
    }
    const room = await roomService.createRoom({ topic, creatorNickname, creatorUserId, durationMinutes, maxParticipants });
    res.status(201).json(room);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const rooms = await roomService.listActiveRooms(req.query.sort);
    res.json(rooms);
  } catch (err) {
    next(err);
  }
});

router.get('/user/:userId', async (req, res, next) => {
  try {
    const rooms = await roomService.listUserRooms(req.params.userId);
    res.json(rooms);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const room = await roomService.getRoomById(req.params.id);
    if (!room) {
      const err = new Error('Room not found');
      err.status = 404;
      throw err;
    }
    res.json(room);
  } catch (err) {
    next(err);
  }
});


router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await roomService.deleteRoom(req.params.id);
    if (!deleted) {
      const err = new Error('Room not found');
      err.status = 404;
      throw err;
    }
    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
