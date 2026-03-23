# Meme Buddy Full-Stack Setup

This repo now includes a new production-style stack in:

- [frontend](/Users/priyan/Documents/New%20project/frontend)
- [backend-node](/Users/priyan/Documents/New%20project/backend-node)

The older Expo + Flask prototype is still present elsewhere in the repo and was not deleted.

## Stack

- Frontend: Next.js + Tailwind CSS + Recharts
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT

## Run locally

Recommended folder structure:

```text
frontend/
backend-node/
```

### 1. Backend

```bash
cd backend-node
npm install
cp .env.example .env
npm run dev
```

The backend will still start if MongoDB is offline, but `/api/*` routes will return `503` until the database is available.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### 3. Optional root helper scripts

There is a helper file at [package.fullstack.json](/Users/priyan/Documents/New%20project/package.fullstack.json) with simple root-level commands for the new stack if you want to copy them into your main root `package.json`.

## Run with Docker

```bash
docker compose -f docker-compose.fullstack.yml up
```

This starts:

- Next.js app on `http://localhost:3000`
- Express API on `http://localhost:5000`
- MongoDB on `mongodb://127.0.0.1:27017`

## Demo login

- Email: `demo@memebuddy.ai`
- Password: `Demo@12345`

## Features included

- Register / login with JWT
- Create trend event
- Join trend event by invite code
- Dashboard with analytics and prediction card
- Event detail with charts and leaderboard
- Discovery feed
- Profile stats
- Global leaderboard

## Notes

- Data is seeded automatically when the MongoDB database is empty.
- The prediction engine is simulation-based but structured like a real product service.
