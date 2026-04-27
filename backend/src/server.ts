import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import apiRoutes from './routes/apiRoutes'
import { db } from './models/database'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(express.json())
app.use(cors())

// Routes
app.use('/api', apiRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Government Asset Deal Room Backend Running' })
})

// Initialize demo data
const initializeDemoData = () => {
  // Create demo users from different agencies
  const agencies = [
    { email: 'police@kps.go.ke', password: 'demo123', role: 'police', agency: 'Kenya Police Service' },
    { email: 'lands@lands.go.ke', password: 'demo123', role: 'lands', agency: 'Ministry of Lands' },
    { email: 'ntsa@ntsa.go.ke', password: 'demo123', role: 'ntsa', agency: 'NTSA' },
    { email: 'kra@kra.go.ke', password: 'demo123', role: 'kra', agency: 'Kenya Revenue Authority' },
    { email: 'intelligence@intel.go.ke', password: 'demo123', role: 'intelligence', agency: 'Intelligence Services' },
    { email: 'citizen@example.com', password: 'demo123', role: 'citizen', agency: 'Citizen' },
  ]

  agencies.forEach(agency => {
    if (!db.findUserByEmail(agency.email)) {
      db.createUser({
        email: agency.email,
        passwordHash: 'hashed_demo123', // In real app, would be properly hashed
        role: agency.role as any,
        agency: agency.agency,
        active: true,
      })
    }
  })

  console.log('✓ Demo users initialized')
}

// Start server
app.listen(PORT, () => {
  initializeDemoData()
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║   ASSET DEAL ROOM - GOVERNMENT EDITION                         ║
║   Backend API Server Running                                   ║
╚════════════════════════════════════════════════════════════════╝

🚀 Server: http://localhost:${PORT}
📊 Features:
  ✓ Role-based access control (Police, Lands, NTSA, KRA, Intelligence)
  ✓ Fraud detection & risk scoring
  ✓ Immutable audit trail logging
  ✓ Government API integrations (Ardhisasa, NTSA, KRA)
  ✓ Intelligence & analytics dashboard
  ✓ Ownership tracking with history

📝 Demo Credentials:
  Police:       police@kps.go.ke / demo123
  Lands:        lands@lands.go.ke / demo123
  NTSA:         ntsa@ntsa.go.ke / demo123
  KRA:          kra@kra.go.ke / demo123
  Intelligence: intelligence@intel.go.ke / demo123
  Citizen:      citizen@example.com / demo123

🔗 API Endpoints:
  POST   /api/auth/register - Register new user
  POST   /api/auth/login - Login
  POST   /api/deal-rooms - Create deal room
  GET    /api/deal-rooms - List deal rooms
  GET    /api/deal-rooms/:id - Get deal room details
  PUT    /api/deal-rooms/:id/status - Update status
  GET    /api/analytics/fraud-summary - Fraud statistics
  GET    /api/analytics/asset-trace - Asset ownership history
  GET    /api/analytics/high-risk-sellers - Identify high-risk sellers
  GET    /api/audit-logs - Audit trail

🛡️  Government Integrations (Ready for production APIs):
  • Ardhisasa (Land Registry)
  • NTSA (Vehicle Registration)
  • KRA (Tax Authority & Identity)
  • M-Pesa (Mobile Money)
  • NAFIS (Police Fraud Database)
`)
})
