# Chatroom Platform — Phase 1 + Phase 2

Phase 1: data model + REST API. Phase 2 adds live chat over Socket.IO, plus a minimal browser
test client at `public/index.html` — no need to build your own frontend yet.

## Setup

```bash
npm install
cp .env.example .env      # adjust DATABASE_URL if needed
docker compose up -d      # starts Postgres on localhost:5432
npm run migrate           # creates the tables
npm run dev                # starts the API on http://localhost:3000
```

## Try it out

```bash
# Health check
curl http://localhost:3000/health

# Create a room
curl -X POST http://localhost:3000/rooms \
  -H "Content-Type: application/json" \
  -d '{"topic":"India vs Australia live","creatorNickname":"rahul","durationMinutes":60}'

# List active rooms
curl http://localhost:3000/rooms

# Join a room (replace ROOM_ID)
curl -X POST http://localhost:3000/rooms/ROOM_ID/join \
  -H "Content-Type: application/json" \
  -d '{"nickname":"priya"}'

# Fetch message history (empty until Phase 2 adds live messages)
curl http://localhost:3000/rooms/ROOM_ID/messages
```

## Phase 2 — live chat

The server now also runs Socket.IO on the same port. Easiest way to see it working:

1. Run `npm run dev` as usual.
2. Open **http://localhost:3000** in two different browser tabs (or one normal + one incognito window).
3. In tab 1: create a room, then join it with a nickname.
4. In tab 2: paste the same Room ID, join with a *different* nickname.
5. Type a message in either tab — it should appear in both, live, no refresh.

### How it works
- `POST /rooms/:id/join` (REST, unchanged from Phase 1) still hands out a `session_token`.
- The browser then emits a `join_room` socket event with that `roomId` + `sessionToken`. The server checks
  the token is real and the room hasn't ended yet, before letting the socket into that room's broadcast group.
- `send_message` writes to Postgres first, then broadcasts `new_message` to everyone in the room — so refreshing
  the page and re-fetching `GET /rooms/:id/messages` always matches what's on screen.
- Messages sent after `active_ends_at` are rejected — try setting a 1-minute `durationMinutes` when creating a
  room to see this in action.

## What's next

Phase 3 adds proper capacity enforcement at join time, a live-updating "active rooms" browse page, and pushing a
`room_ended` event to open tabs the moment a room's timer runs out (right now clients only find out the next
time they try to send a message).
