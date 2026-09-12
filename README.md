# Huddle

Huddle is a real-time chat platform for topic-based rooms with timed sessions, Google authentication, admin tools, and live messaging over Socket.IO. It combines a Node.js/Express backend with a React + Vite frontend to create a lightweight social chat experience.

## Overview

Users can:

- Create time-boxed discussion rooms around a topic
- Join rooms with a nickname and session token
- Send live messages in real time
- Browse active rooms and room history
- Sign in via Google for a more complete user experience
- Access an admin dashboard for user and room management

## Tech Stack

- Backend: Node.js, Express, Socket.IO, PostgreSQL
- Frontend: React 19, Vite, React Router, Tailwind CSS
- Auth: Google One Tap / Google ID token verification
- Database: PostgreSQL via `pg`
- Infrastructure: Docker Compose for local Postgres setup

## Project Structure

```bash
.
├── src/
│   ├── app.js
│   ├── server.js
│   ├── db/
│   ├── middleware/
│   ├── realtime/
│   ├── routes/
│   └── services/
├── client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── package.json
├── vercel.json
├── .env
├── .gitignore
└── README.md
```

## Prerequisites

Before you start, make sure you have:

- Node.js 18+ and npm
- Docker Desktop or Docker Engine
- A Google Cloud project with OAuth credentials (optional for local auth testing, but recommended)

## Environment Variables

Create a root `.env` file with the following values:

```env
DATABASE_URL=postgresql://chatroom:chatroom@localhost:5432/chatroom
PORT=3000
GOOGLE_CLIENT_ID=your_google_client_id_here
ADMIN_KEY=your_secure_admin_key_here
```

The app also expects frontend environment variables for the client app:

Create `client/.env.local`:

```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

> If you do not provide a Google Client ID, the frontend will still run, but Google login features will be disabled or show an empty configuration state.

## Local Development Setup

### 1) Install dependencies

From the project root:

```bash
npm install
```

Then install the frontend dependencies:

```bash
cd client
npm install
cd ..
```

### 2) Start PostgreSQL with Docker

```bash
docker compose up -d
```

This starts the local PostgreSQL service on port `5432` using the values in `docker-compose.yml`.

### 3) Run database migrations

From the root:

```bash
npm run migrate
```

This creates the database tables required by the application.

### 4) Start the backend server

```bash
npm run dev
```

The API server will start on:

```text
http://localhost:3000
```

You can check that it is running with:

```bash
curl http://localhost:3000/health
```

### 5) Start the frontend

Open a second terminal and run:

```bash
cd client
npm run dev -- --host
```

The frontend will usually run at:

```text
http://localhost:5173
```

Open that URL in your browser to use the app.

## Common Development Commands

From the root:

```bash
npm run dev      # backend development server
npm run start    # production-style backend start
npm run migrate  # initialize database schema
```

From the client directory:

```bash
npm run dev      # Vite development server
npm run build    # production frontend build
npm run preview  # preview the built frontend locally
```

## API Overview

The backend exposes REST endpoints for room and chat functionality, including:

- `GET /health` – health check
- `GET /rooms` – list active rooms
- `POST /rooms` – create a room
- `POST /rooms/:id/join` – join a room and receive a session token
- `POST /rooms/:id/leave` – leave a room
- `GET /rooms/:id/messages` – fetch room messages
- `POST /auth/google` – verify Google ID token and sign in user
- `POST /auth/logout` – mark user as signed out

The app also uses Socket.IO for real-time message delivery inside rooms.

## Notes

- The backend and frontend are intentionally separated so the React app can be deployed independently from the API.
- The app is configured to work well with a Vercel frontend and a separate backend deployment such as Render or another Node.js hosting provider.
- For production deployments, set your environment variables securely in your hosting provider instead of storing them in source control.

## Troubleshooting

### Postgres connection issues

If the database refuses connections:

```bash
docker compose ps
docker compose logs postgres
```

Then verify that your `DATABASE_URL` matches the running container configuration.

### Frontend cannot reach the backend

Check that `VITE_API_URL` is set correctly in `client/.env.local` and matches your backend URL.

### Google login not working

Ensure:

- `GOOGLE_CLIENT_ID` is set in the root `.env`
- `VITE_GOOGLE_CLIENT_ID` is set in `client/.env.local`
- The OAuth client ID in Google Cloud matches the correct origin and domain

## License

This project is for educational and local development use unless otherwise stated by the repository owner.

