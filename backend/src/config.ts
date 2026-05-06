import dotenv from 'dotenv'

dotenv.config()

const isProduction = process.env.NODE_ENV === 'production'

export const config = {
  port: Number(process.env.PORT || 5000),
  jwtSecret: process.env.JWT_SECRET || (isProduction ? '' : 'dev-only-change-me'),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  eCitizen: {
    clientId: process.env.ECITIZEN_CLIENT_ID || '',
    clientSecret: process.env.ECITIZEN_CLIENT_SECRET || '',
    redirectUri: process.env.ECITIZEN_REDIRECT_URI || 'http://localhost:5173/ecitizen/callback',
    authorizeUrl: process.env.ECITIZEN_AUTHORIZE_URL || 'https://accounts.ecitizen.go.ke/oauth/authorize',
    tokenUrl: process.env.ECITIZEN_TOKEN_URL || 'https://accounts.ecitizen.go.ke/oauth/access-token',
    userInfoUrl: process.env.ECITIZEN_USERINFO_URL || 'https://accounts.ecitizen.go.ke/api/userinfo',
  },
}

if (!config.jwtSecret) {
  throw new Error('JWT_SECRET must be set in production')
}
