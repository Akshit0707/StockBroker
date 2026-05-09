# Stock Trading App

A full-stack stock trading simulation app with a **frontend**, **backend**, **PostgreSQL**, **Redis**, and **Prisma**.

## Features

- Portfolio view
- Stocks listing and live-style prices
- Orders and trades
- JWT-based authentication
- PostgreSQL database
- Redis for pub/sub / realtime updates

## Project Structure

- `frontend/` - Next.js app
- `backend/` - Node.js/Express API
- `docker-compose.yml` - Local services like PostgreSQL and Redis

## Prerequisites

- Node.js 20+
- Docker
- npm

## Environment Variables

### Backend
Create `backend/.env`:

### Frontend
Create `frontend/.env.local` if needed:


## Setup

### 1. Start database services

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

## Useful Commands

### Backend

```bash
npm run dev
npx prisma studio
npx prisma generate
npx prisma db push
```

### Frontend

```bash
npm run dev
npm run build
npm run start
```

## Database Notes

- Prisma schema is in `backend/prisma/schema.prisma`
- Seed scripts are in `backend/scripts/`
- If tables were reset, reseed users, stocks, portfolio, and price history

## Troubleshooting

### Portfolio or stock prices show `0`
- Check that stocks are seeded
- Check that portfolio rows exist for the logged-in user
- Confirm API route returns `stock.currentPrice`
- Verify the frontend is using the correct API base URL

### 404 / 401 / 500 API errors
- Confirm backend is running on `http://localhost:5001`
- Confirm JWT token is being sent in the request
- Check backend logs for Prisma or DB errors

### Prisma schema mismatch
If the schema and database differ, run:

```bash
cd backend
npx prisma generate
npx prisma db push
```

## License

Private project.
