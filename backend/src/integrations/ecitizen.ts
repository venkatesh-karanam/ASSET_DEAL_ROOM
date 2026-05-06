import crypto from 'crypto'
import { config } from '../config'

export interface ECitizenKycProfile {
  idNumber: string
  kraPin: string
  firstName: string
  lastName: string
  mobileNumber: string
  mobileVerified: boolean
  accountType: string
  source: 'mock' | 'ecitizen'
}

function base64Url(input: Buffer): string {
  return input.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export const ecitizenIntegration = {
  getStatus() {
    return {
      configured: Boolean(config.eCitizen.clientId && config.eCitizen.clientSecret),
      mode: config.eCitizen.clientId && config.eCitizen.clientSecret ? 'ready_for_oidc' : 'mock',
      authFlow: 'OAuth 2.0 Authorization Code with PKCE',
      requiredCredentials: ['ECITIZEN_CLIENT_ID', 'ECITIZEN_CLIENT_SECRET', 'ECITIZEN_REDIRECT_URI'],
      endpoints: {
        authorizeUrl: config.eCitizen.authorizeUrl,
        tokenUrl: config.eCitizen.tokenUrl,
        userInfoUrl: config.eCitizen.userInfoUrl,
      },
    }
  },

  createAuthorizationRequest() {
    const codeVerifier = base64Url(crypto.randomBytes(32))
    const codeChallenge = base64Url(crypto.createHash('sha256').update(codeVerifier).digest())
    const state = base64Url(crypto.randomBytes(16))
    const url = new URL(config.eCitizen.authorizeUrl)

    url.searchParams.set('client_id', config.eCitizen.clientId || 'demo-client-id')
    url.searchParams.set('redirect_uri', config.eCitizen.redirectUri)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope', 'openid')
    url.searchParams.set('state', state)
    url.searchParams.set('code_challenge', codeChallenge)
    url.searchParams.set('code_challenge_method', 'S256')

    return {
      authorizationUrl: url.toString(),
      state,
      codeChallenge,
      demoCodeVerifier: codeVerifier,
      note: 'Store the code verifier server-side in production before redirecting to eCitizen.',
    }
  },

  mockSellerKyc(name: string, phone: string): ECitizenKycProfile {
    const [firstName = 'Demo', ...rest] = name.trim().split(/\s+/)
    const lastName = rest.join(' ') || 'Seller'

    return {
      idNumber: '12345678',
      kraPin: 'A123456789B',
      firstName,
      lastName,
      mobileNumber: phone || '254711000000',
      mobileVerified: true,
      accountType: 'citizen',
      source: 'mock',
    }
  },
}
