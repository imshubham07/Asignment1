# Backend (Express + TypeScript + Prisma + PostgreSQL)

Setup

1) Create `.env` in this folder:

```
PORT=4000
DATABASE_URL="<your_postgres_url>"
```

2) Install deps and generate client:

```
npm ci
npx prisma generate
# If switching providers from sqlite → postgres:
rm -rf prisma/migrations
npx prisma migrate dev --name init --create-only
npx prisma migrate deploy
```

Dev

```
npm run dev
```

Tests

```
npm test
```

API base: `http://localhost:4000`


