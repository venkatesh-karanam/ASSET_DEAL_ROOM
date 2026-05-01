# DealRoom KE

A Kenya-focused asset deal room MVP for land and vehicle transactions. The app helps a buyer or agency create a transaction room, capture seller/buyer details, track verification evidence, and flag duplicate asset rooms before money changes hands.

## What is included

- React + Vite frontend for the citizen deal room flow.
- Optional government dashboard at `/?mode=gov`.
- Express + TypeScript backend with demo JWT auth, role-based API access, audit logging, and fraud/risk scoring.
- Browser-storage fallback in the frontend when the backend is not running.
- Evidence-based verification inputs for registry certificates, seller identity, authority documents, supporting documents, inspection reports, and payment instructions.
- Mock Ardhisasa/NTSA verification flow that simulates caveat, encumbrance, and blocked-asset checks before a deal can be marked safe.

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
- File uploads currently store document metadata for demo purposes; production needs encrypted object storage.
- Production use needs a real database, rate limiting, stronger auth controls, and deployment hardening.

## Phase 2 Roadmap (Scalability & Security)

- **Secure Persistence:** Replace in-memory/browser fallback storage with Supabase, Firebase, or PostgreSQL so every transaction has a durable audit trail.
- **Transactions Table:** Store title or registration number, buyer ID, seller ID, registry verification status, evidence document references, risk score, and audit hash.
- **Data Sovereignty:** Implement ODP-compliant data encryption for citizen documents and restrict storage to approved regions.
- **Identity Integration:** Integrate with IPRS (Integrated Population Registration System) for KYC and citizen identity checks.
- **Registry Integration:** Replace the mock `verifyWithGovernment(assetId)` flow with approved Ardhisasa and NTSA APIs.
- **Integrity Engine:** Add blockchain-inspired immutable audit logs to prevent record tampering.
- **Deployment:** Deploy the frontend to Vercel or Netlify and host the API on a secure managed platform for phone-ready stakeholder demos.
- **Clean Code Standards:** Replace the current TypeScript lint script with ESLint rules and CI checks before formal government review.
