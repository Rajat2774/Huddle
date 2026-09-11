const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const db = require('../db');

const router = express.Router();

router.post('/google', async (req, res, next) => {
  const { credential } = req.body || {};
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return res.status(503).json({ error: 'Google login is not configured.' });
  }

  if (!credential || typeof credential !== 'string') {
    return res.status(400).json({ error: 'Google credential is required.' });
  }

  try {
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
      return res.status(401).json({ error: 'Google account could not be verified.' });
    }

    const user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      picture: payload.picture || null,
    };

    // Store/upsert user record in Postgres
    try {
      await db.query(
        `INSERT INTO users (id, email, name, picture, signed_in_at, last_active_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET
           email = EXCLUDED.email,
           name = EXCLUDED.name,
           picture = EXCLUDED.picture,
           last_active_at = NOW()`,
        [user.id, user.email, user.name, user.picture]
      );
    } catch (dbErr) {
      console.error('Failed to save user login to DB:', dbErr);
    }

    return res.json({ user });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;