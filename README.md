# DealRoom KE

A Kenya-focused asset deal room MVP for land and vehicle transactions. The app helps a buyer or agency create a transaction room, capture seller/buyer details, track verification evidence, and flag duplicate asset rooms before money changes hands.

## What is included

- React + Vite frontend for the citizen deal room flow.
- Optional government dashboard at `/?mode=gov`.
- Express + TypeScript backend with demo JWT auth, role-based API access, audit logging, and fraud/risk scoring.
- Browser-storage fallback in the frontend when the backend is not running.

## Run locally

Install frontend dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
```

Create environment files:

```bash
copy .env.example .env
copy backend\.env.example backend\.env
```

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend from the repo root:

```bash
npm run dev
```

## Demo accounts

All demo accounts use password `demo123`.

```text
Citizen:      citizen@example.com
Police:       police@kps.go.ke
Lands:        lands@lands.go.ke
NTSA:         ntsa@ntsa.go.ke
KRA:          kra@kra.go.ke
Intelligence: intelligence@intel.go.ke
```

## Important limitations

- Backend data is currently in memory and resets when the server restarts.
- Government integrations are mocked/stubbed and need real API credentials before production use.
- File uploads are represented as checklist state, not actual document storage.
- Production use needs a real database, rate limiting, stronger auth controls, and deployment hardening.

## Recommended next build step

Move the backend storage to PostgreSQL or SQLite with Prisma, then add tests around auth, deal-room creation, duplicate detection, and role-based access.
