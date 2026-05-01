import axios from 'axios'
import type { GovernmentVerificationResult } from '../models/database'

// Ardhisasa Integration (Land Registry)
export const ardhisasaIntegration = {
  verifyLandTitle: async (titleNumber: string): Promise<{ verified: boolean; owner: string; data: any }> => {
    // In production, call: const response = await axios.get(`https://ardhisasa.api.go.ke/verify/${titleNumber}`, {...})
    // For demo, simulate verification
    console.log(`[Ardhisasa] Verifying land title: ${titleNumber}`)
    return {
      verified: true,
      owner: 'Government Registry',
      data: {
        titleNumber,
        location: 'Demo Location',
        size: '0.5 acres',
        status: 'Clear',
      },
    }
  },
}

// NTSA Integration (Vehicle Registration)
export const ntsaIntegration = {
  verifyVehicleRegistration: async (regNumber: string): Promise<{ verified: boolean; owner: string; data: any }> => {
    // In production: const response = await axios.get(`https://ntsa.api.go.ke/vehicles/${regNumber}`, {...})
    console.log(`[NTSA] Verifying vehicle registration: ${regNumber}`)
    return {
      verified: true,
      owner: 'Demo Owner',
      data: {
        regNumber,
        make: 'Toyota',
        model: 'Corolla',
        year: 2020,
        engineNumber: 'DEMO123',
        status: 'Active',
      },
    }
  },

  checkStolenVehicles: async (regNumber: string): Promise<{ isStolen: boolean; details?: string }> => {
    console.log(`[NTSA] Checking stolen vehicle list: ${regNumber}`)
    // Simulate check (would call real API)
    return { isStolen: false }
  },
}

// KRA Integration (Tax Authority - Identity Verification)
export const kraIntegration = {
  verifyIdentity: async (huduma: string, bvn?: string): Promise<{ verified: boolean; name: string; data: any }> => {
    // In production: const response = await axios.post(`https://kra.api.go.ke/verify-identity`, {huduma, bvn})
    console.log(`[KRA] Verifying identity: Huduma=${huduma}, BVN=${bvn}`)
    return {
      verified: true,
      name: 'Demo Citizen',
      data: {
        huduma,
        bvn,
        taxPin: 'A1234567B',
        complianceStatus: 'Compliant',
      },
    }
  },

  checkSanctionsList: async (huduma: string): Promise<{ onSanctionsList: boolean; details?: string }> => {
    console.log(`[KRA] Checking sanctions list: ${huduma}`)
    return { onSanctionsList: false }
  },
}

// M-Pesa Integration (Mobile Money Verification)
export const mpesaIntegration = {
  verifyPayment: async (transactionRef: string, amount: number): Promise<{ verified: boolean; status: string; data: any }> => {
    // In production: const response = await axios.post(`https://mpesa.api.go.ke/verify`, {transactionRef, amount})
    console.log(`[M-Pesa] Verifying payment: Ref=${transactionRef}, Amount=${amount}`)
    return {
      verified: true,
      status: 'Completed',
      data: {
        transactionRef,
        amount,
        timestamp: new Date(),
        sender: 'Demo Payer',
        receiver: 'Demo Recipient',
      },
    }
  },
}

// NAFIS Integration (Police Fraud Database)
export const nafisIntegration = {
  reportFraud: async (dealRoomId: string, description: string): Promise<{ reported: boolean; caseNumber?: string }> => {
    console.log(`[NAFIS] Reporting fraud: Deal=${dealRoomId}, Description=${description}`)
    return {
      reported: true,
      caseNumber: `NAFIS-${Date.now()}`,
    }
  },

  checkFraudHistory: async (huduma: string): Promise<{ hasFraudHistory: boolean; records?: any[] }> => {
    console.log(`[NAFIS] Checking fraud history: ${huduma}`)
    return { hasFraudHistory: false, records: [] }
  },
}

export const verifyWithGovernment = async (
  assetType: 'land' | 'car',
  identifier: string,
): Promise<GovernmentVerificationResult> => {
  const normalized = identifier.trim().toUpperCase()
  const hasCaveat = normalized.includes('CAVEAT') || normalized.includes('DISPUTE')
  const hasEncumbrance = normalized.includes('ENC') || normalized.includes('LOAN')
  const isBlocked = normalized.includes('STOLEN') || normalized.includes('FRAUD')

  const registry = assetType === 'land' ? 'Ardhisasa' : 'NTSA'
  const baseResult = assetType === 'land'
    ? await ardhisasaIntegration.verifyLandTitle(normalized)
    : await ntsaIntegration.verifyVehicleRegistration(normalized)

  const caveats = hasCaveat ? ['Active caveat recorded against this asset'] : []
  const encumbrances = hasEncumbrance ? ['Outstanding charge or lien requires clearance before transfer'] : []
  const status = isBlocked ? 'blocked' : caveats.length > 0 || encumbrances.length > 0 ? 'caution' : 'clear'

  return {
    assetType,
    identifier: normalized,
    registry,
    verified: status !== 'blocked' && baseResult.verified,
    status,
    owner: baseResult.owner,
    reference: `${registry.toUpperCase()}-${Date.now()}`,
    checkedAt: new Date(),
    caveats,
    encumbrances,
    message: status === 'clear'
      ? 'Mock registry check found no caveats or encumbrances.'
      : status === 'caution'
        ? 'Mock registry check found issues that require agency review.'
        : 'Mock registry check blocked this transaction.',
  }
}
