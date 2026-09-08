const path = require('path');
const express = require('express');
const roomsRouter = require('./routes/rooms');
const joinRouter = require('./routes/join');
const messagesRouter = require('./routes/messages');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/rooms', roomsRouter);
app.use('/rooms/:id/join', joinRouter);
app.use('/rooms/:id/messages', messagesRouter);

app.use(errorHandler);

module.exports = app;
