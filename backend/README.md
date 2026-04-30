# Asset Deal Room Backend

Express + TypeScript API for the DealRoom KE MVP.

## Features

- JWT login/register flow with bcrypt password hashes.
- Demo users for citizen and agency roles.
- Deal-room creation and listing.
- Role-based access for government analytics and status updates.
- Duplicate asset detection and risk alerts.
- In-memory audit log for demo usage.

## Setup

```bash
npm install
copy .env.example .env
npm run dev
```

Default server URL:

```text
http://localhost:5000
```

Health check:

```text
GET /health
```

## Environment

```text
PORT=5000
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGIN=http://localhost:5173
```

## Main API routes

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/deal-rooms
POST /api/deal-rooms
GET  /api/deal-rooms/:id
PUT  /api/deal-rooms/:id/status
GET  /api/analytics/fraud-summary
GET  /api/analytics/asset-trace
GET  /api/analytics/high-risk-sellers
GET  /api/audit-logs
```

## Demo credentials

All demo accounts use password `demo123`.

```text
citizen@example.com
police@kps.go.ke
lands@lands.go.ke
ntsa@ntsa.go.ke
kra@kra.go.ke
intelligence@intel.go.ke
```

## Production gaps

This backend is still demo-grade. Before production, replace the in-memory database with persistent storage, add rate limiting, use real government/payment integrations, enforce stronger password and 2FA policies, and add automated tests.
