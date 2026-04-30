import dotenv from 'dotenv'

dotenv.config()

const isProduction = process.env.NODE_ENV === 'production'

export const config = {
  port: Number(process.env.PORT || 5000),
  jwtSecret: process.env.JWT_SECRET || (isProduction ? '' : 'dev-only-change-me'),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
}

if (!config.jwtSecret) {
  throw new Error('JWT_SECRET must be set in production')
}
