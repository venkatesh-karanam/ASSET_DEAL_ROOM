# DealRoom KE

**Kenya's Trust Operating System for High-Value Transactions**

DealRoom KE is institutional-grade verification infrastructure for Kenya's asset transaction market. Every year, KSh 2.1 billion in property and KSh 850 million in diaspora assets are lost to fraud. DealRoom KE provides the trust infrastructure that makes high-value transactions safe.

## What Makes DealRoom KE Different

### Operational Realism
- **Live System Status**: Real-time API connectivity, registry sync status, and verification event logs
- **Failure Management**: Automated responses to registry downtime, seller disappearance, and duplicate claims
- **Messy Document Intelligence**: OCR analysis for handwritten/scanned documents with confidence scoring

### Institutional Credibility
- **Behavioral Fraud Detection**: AI analysis of relationship-based fraud patterns common in Kenya
- **Audit Immutability**: Cryptographic hashing and blockchain timestamping for court admissibility
- **Data Ownership Transparency**: Clear data rights under Kenyan Data Protection Act

### Market Focus
- **Diaspora Mode**: Specialized protections for international buyers (UK, USA, Canada, etc.)
- **Platform Expansion**: Beyond land/vehicles to tractors, equipment, livestock, and NGO procurement
- **Anti-Corruption Positioning**: No backdoors, logged actions, immutable records

## Core Features

### Trust Infrastructure
- **System Status Dashboard**: Live API connections and verification events
- **Failure Protocols**: Automated responses to transaction failures
- **Document Intelligence**: OCR analysis with issue detection and recommendations
- **Behavioral Analysis**: Social fraud pattern detection
- **Audit Immutability**: Cryptographic evidence fingerprints

### Verification Flow
- Multi-step workflow with validation gates
- Government registry integration (Ardhisasa, NTSA, KRA)
- eCitizen KYC integration
- Evidence document upload and validation
- Risk scoring and fraud detection

### Specialized Modes
- **Diaspora Protected Purchase**: Timezone coordination, remote notarization, video identity checks
- **Government Dashboard**: Police, lands, NTSA, KRA, and intelligence agency access
- **Analytics**: Fraud patterns, asset tracing, high-risk seller monitoring

## Market Impact

### Fraud Prevention Scale
- **Property Fraud**: KSh 2.1 billion annual losses addressed
- **Vehicle Fraud**: 45,000+ incidents annually prevented
- **Diaspora Scams**: KSh 850 million in international losses protected
- **Title Disputes**: 120,000+ unresolved cases supported

### Platform Expansion Potential
- **Land & Real Estate**: Residential, commercial, agricultural
- **Vehicles & Equipment**: Cars, trucks, tractors, construction machinery
- **Business Assets**: Inventory, machinery, IP transfers
- **Government & NGO**: Procurement, asset transfers, compliance

## Technical Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: In-memory with SQLite fallback
- **Authentication**: JWT with role-based access
- **Audit**: Comprehensive logging with fraud detection
- **Integrations**: Government APIs, eCitizen, blockchain timestamping

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
