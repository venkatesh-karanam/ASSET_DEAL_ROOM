import { db, DealRoom, RiskAlert } from '../models/database'

export interface FraudIndicator {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  confidence: number // 0-100
}

export const fraudDetectionEngine = {
  calculateRiskScore: (dealRoom: DealRoom, allDealRooms: DealRoom[]): { score: number; indicators: FraudIndicator[] } => {
    const indicators: FraudIndicator[] = []
    let score = 0

    // Check for duplicate sales
    const sameAssetRooms = allDealRooms.filter(
      r => r.assetType === dealRoom.assetType && r.identifier === dealRoom.identifier && r.id !== dealRoom.id
    )
    if (sameAssetRooms.length > 0) {
      const activeDuplicates = sameAssetRooms.filter(r => r.status !== 'rejected')
      if (activeDuplicates.length > 0) {
        indicators.push({
          type: 'duplicate_sale',
          severity: 'critical',
          description: `${activeDuplicates.length} active room(s) for same asset`,
          confidence: 95,
        })
        score += 40
      }
    }

    // Check for rapid asset flipping (same seller appears frequently)
    const sellerRooms = allDealRooms.filter(r => r.sellerId === dealRoom.sellerId)
    if (sellerRooms.length > 5) {
      indicators.push({
        type: 'rapid_flipping',
        severity: 'high',
        description: `Seller has ${sellerRooms.length} transactions in short period`,
        confidence: 80,
      })
      score += 25
    }

    // Check for seller not being owner (fraud)
    if (dealRoom.fraud) {
      indicators.push({
        type: 'fraud_flag',
        severity: 'critical',
        description: 'Seller is not the recorded owner of this asset',
        confidence: 100,
      })
      score += 50
    }

    // Check for high-value transactions without proper verification
    if (dealRoom.amount && dealRoom.amount > 500000) {
      const verifications = db.getVerificationsByDealRoom(dealRoom.id)
      if (verifications.filter(v => v.status === 'verified').length < 3) {
        indicators.push({
          type: 'high_value_unverified',
          severity: 'high',
          description: `High-value transaction (${dealRoom.amount}) with insufficient verification`,
          confidence: 70,
        })
        score += 20
      }
    }

    // Check for sanctions/identity issues
    // This would connect to KRA and other services in production
    if (dealRoom.buyerHuduma && dealRoom.sellerHuduma) {
      // Simulate sanctions check (would call real API)
      if (Math.random() < 0.05) {
        // 5% chance for demo
        indicators.push({
          type: 'sanctions_match',
          severity: 'critical',
          description: 'Participant matches sanctions watchlist',
          confidence: 85,
        })
        score += 45
      }
    }

    // Cap score at 100
    score = Math.min(score, 100)

    return { score, indicators }
  },

  analyzeDealRoom: (dealRoom: DealRoom, allDealRooms: DealRoom[]): void => {
    const { score, indicators } = fraudDetectionEngine.calculateRiskScore(dealRoom, allDealRooms)

    // Update deal room risk score
    const activeDuplicateIds = allDealRooms
      .filter(r => r.assetType === dealRoom.assetType && r.identifier === dealRoom.identifier && r.id !== dealRoom.id && r.status !== 'rejected')
      .map(r => r.id)

    db.updateDealRoom(dealRoom.id, {
      riskScore: score,
      conflictWith: activeDuplicateIds.length > 0 ? activeDuplicateIds : undefined,
    })

    // Create risk alerts for high-risk indicators
    indicators.forEach(indicator => {
      if (['high', 'critical'].includes(indicator.severity)) {
        db.createRiskAlert({
          dealRoomId: dealRoom.id,
          type: indicator.type as any,
          severity: indicator.severity,
          description: indicator.description,
        })
      }
    })
  },

  detectMoneyLaunderingPattern: (buyerId: string, sellerId: string): boolean => {
    const buyerTransactions = db.getAllDealRooms().filter(r => r.buyerId === buyerId)
    const sellerTransactions = db.getAllDealRooms().filter(r => r.sellerId === sellerId)

    // Pattern: Quick buy-resell cycle
    const buyerToSeller = buyerTransactions.filter(t => t.status === 'completed').length > 3
    const rapidCycle = buyerToSeller && sellerTransactions.length > 3

    // Multiple quick transactions
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recentBuyer = buyerTransactions.filter(t => t.createdAt > last30Days).length > 5
    const recentSeller = sellerTransactions.filter(t => t.createdAt > last30Days).length > 5

    return rapidCycle || (recentBuyer && recentSeller)
  },

  getHighRiskTransactions: (): DealRoom[] => {
    return db.getAllDealRooms().filter(r => r.riskScore >= 60)
  },
}
