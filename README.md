# Chatroom Platform — Phase 1

Data model + REST API for topic-based, time-boxed chat rooms. No realtime yet — that's Phase 2.

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

## What's next

Phase 2 adds a Socket.IO layer for live messaging on top of this API. See `src/routes/` and `src/services/` —
the realtime layer will call the same `roomService` and write into the `messages` table these routes already read from.
