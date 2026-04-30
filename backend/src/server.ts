import express from 'express'
import cors from 'cors'
import bcrypt from 'bcrypt'
import apiRoutes from './routes/apiRoutes'
import { db } from './models/database'
import { config } from './config'

const app = express()

app.use(express.json({ limit: '1mb' }))
app.use(cors({ origin: config.corsOrigin }))

app.use('/api', apiRoutes)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Asset Deal Room API' })
})

const initializeDemoData = async () => {
  const agencies = [
    { email: 'police@kps.go.ke', password: 'demo123', role: 'police', agency: 'Kenya Police Service' },
    { email: 'lands@lands.go.ke', password: 'demo123', role: 'lands', agency: 'Ministry of Lands' },
    { email: 'ntsa@ntsa.go.ke', password: 'demo123', role: 'ntsa', agency: 'NTSA' },
    { email: 'kra@kra.go.ke', password: 'demo123', role: 'kra', agency: 'Kenya Revenue Authority' },
    { email: 'intelligence@intel.go.ke', password: 'demo123', role: 'intelligence', agency: 'Intelligence Services' },
    { email: 'citizen@example.com', password: 'demo123', role: 'citizen', agency: 'Citizen' },
  ] as const

  for (const agency of agencies) {
    if (!db.findUserByEmail(agency.email)) {
      db.createUser({
        email: agency.email,
        passwordHash: await bcrypt.hash(agency.password, 10),
        role: agency.role,
        agency: agency.agency,
        active: true,
      })
    }
  }

  console.log('Demo users initialized')
}

app.listen(config.port, async () => {
  await initializeDemoData()
  console.log(`Asset Deal Room API running at http://localhost:${config.port}`)
  console.log('Demo credentials: citizen@example.com / demo123')
})
