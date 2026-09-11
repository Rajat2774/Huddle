const path = require('path');
const express = require('express');
const roomsRouter = require('./routes/rooms');
const cors = require('cors')
const joinRouter = require('./routes/join');
const leaveRouter = require('./routes/leave');
const messagesRouter = require('./routes/messages');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json());

const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));
app.use(cors({
  origin: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/auth', authRouter);
app.use('/api/admin', adminRouter);

app.use('/rooms', roomsRouter);
app.use('/rooms/:id/join', joinRouter);
app.use('/rooms/:id/leave', leaveRouter);
app.use('/rooms/:id/messages', messagesRouter);

// SPA client fallback for React Router navigation
app.get('*', (req, res, next) => {
  if (req.accepts('html')) {
    res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
      if (err) next();
    });
  } else {
    next();
  }
});

app.use(errorHandler);

module.exports = app;
