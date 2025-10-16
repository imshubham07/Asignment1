# Cybernauts - Interactive User Relationship and Hobby Network

Full-stack app to manage users and friendships, visualized as a dynamic graph.

## Stack
- Backend: Node.js (Express + TypeScript) + Prisma ORM
- Database: PostgreSQL (tested with Neon)
- Frontend: React + TypeScript + Vite + React Flow

## Prerequisites
- Node.js 18+ and npm
- A PostgreSQL database URL (Neon works well)

## Quick Start
1) Backend - configure environment
- Create `backend/.env`:
```
PORT=4000
DATABASE_URL="<your_postgres_url>"
```

2) Install dependencies
```bash
cd "backend" && npm ci
cd "../frontend" && npm ci
```

3) Generate Prisma client and apply migrations
```bash
cd "../backend"
npx prisma generate
# If first time or switching from sqlite to postgres
rm -rf prisma/migrations
npx prisma migrate dev --name init --create-only
npx prisma migrate deploy
```

4) Run the servers (in two terminals)
- Backend:
```bash
cd "backend"
npm run dev
# API -> http://localhost:4000
```
- Frontend:
```bash
cd "frontend"
# optional override of API base
VITE_API_URL="http://localhost:4000" npm run dev -- --host --port 5173
# App -> http://localhost:5173
```

## Usage
- Open the app at `http://localhost:5173`
- Create users in the right panel (username, age, hobbies)
- Connect users by:
  - Selecting a user in the right panel, choose another user in the dropdown, click "Connect"
  - OR drag from one node handle to another node in the graph
- Drag a hobby from the left sidebar onto a node to add it
- Unlink in the right panel; delete is only allowed if the user has no friends

## API Summary
- GET `/api/users` - list users
- POST `/api/users` - create user
- PUT `/api/users/:id` - update user
- DELETE `/api/users/:id` - delete user (must be unlinked first)
- POST `/api/users/:id/link` - create friendship
- DELETE `/api/users/:id/unlink` - remove friendship
- GET `/api/graph` - graph data: `{ nodes, edges }`

Example create + link
```bash
BASE=http://localhost:4000
curl -sS -X POST "$BASE/api/users" -H 'Content-Type: application/json' \
  --data-binary '{"username":"Alice","age":25,"hobbies":["reading","music"]}'
```

## Popularity Score
`popularityScore = numberOfUniqueFriends + (totalSharedHobbiesWithFriends * 0.5)`
- Node type: HighScoreNode if score > 5, otherwise LowScoreNode

## Testing
```bash
cd "backend"
npm test
```

## Troubleshooting
- Prisma provider switch (sqlite -> postgres): remove `backend/prisma/migrations` then run `npx prisma migrate dev --name init --create-only && npx prisma migrate deploy`
- Frontend cannot reach API: ensure backend is running at `VITE_API_URL` (default `http://localhost:4000`)
- Build error about `ImportMeta`: ensure `frontend/src/vite-env.d.ts` contains `/// <reference types="vite/client" />`

## Project Structure
```
backend/
  src/
    routes/, services/, tests/
  prisma/
frontend/
  src/
    components/, state/
```
