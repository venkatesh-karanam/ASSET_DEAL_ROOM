import { Router, Response } from 'express'
import { db } from '../models/database'
import { authMiddleware, roleMiddleware, generateToken, AuthRequest } from '../middleware/auth'
import { auditLogger } from '../services/auditService'
import { fraudDetectionEngine } from '../services/fraudDetectionService'
import { verifyWithGovernment } from '../integrations/governmentApis'
import {
  isRole,
  isStatus,
  normalizeAmount,
  normalizeAssetType,
  normalizeEmail,
  normalizeRequiredString,
} from '../validation'
import bcrypt from 'bcrypt'

const router = Router()

// Auth Routes
router.post('/auth/register', async (req: AuthRequest, res: Response) => {
  try {
    const email = normalizeEmail(req.body.email)
    const password = normalizeRequiredString(req.body.password)
    const agency = normalizeRequiredString(req.body.agency)
    const { huduma, bvn } = req.body
    const role = req.body.role

    if (!email || !password || !isRole(role) || !agency) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (db.findUserByEmail(email)) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = db.createUser({
      email,
      passwordHash,
      role,
      agency,
      huduma,
      bvn,
      active: true,
    })

    const token = generateToken(user.id)
    auditLogger.log({
      userId: user.id,
      agency,
      action: 'user_registered',
      resourceType: 'user',
      resourceId: user.id,
      changes: { role, agency },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    })

    res.json({ user: { id: user.id, email: user.email, role: user.role }, token })
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' })
  }
})

router.post('/auth/login', async (req: AuthRequest, res: Response) => {
  try {
    const email = normalizeEmail(req.body.email)
    const password = normalizeRequiredString(req.body.password)
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const user = db.findUserByEmail(email)
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = generateToken(user.id)
    db.updateUser(user.id, { lastLogin: new Date(), active: true })

    auditLogger.log({
      userId: user.id,
      agency: user.agency,
      action: 'user_login',
      resourceType: 'user',
      resourceId: user.id,
      changes: {},
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    })

    res.json({ user: { id: user.id, email: user.email, role: user.role }, token })
  } catch (error) {
    res.status(500).json({ error: 'Login failed' })
  }
})

// Deal Room Routes
router.post('/government/verify', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const assetType = normalizeAssetType(req.body.assetType)
    const identifier = normalizeRequiredString(req.body.identifier)

    if (!assetType || !identifier) {
      return res.status(400).json({ error: 'assetType and identifier are required' })
    }

    const result = await verifyWithGovernment(assetType, identifier)
    auditLogger.log({
      userId: req.user?.id || 'anonymous',
      agency: req.user?.agency || 'Citizen',
      action: 'government_verification_checked',
      resourceType: 'asset',
      resourceId: result.identifier,
      changes: result as unknown as Record<string, unknown>,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    })

    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Government verification failed' })
  }
})

router.post('/deal-rooms', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' })

    const assetType = normalizeAssetType(req.body.assetType)
    const identifier = normalizeRequiredString(req.body.identifier)
    const buyerName = normalizeRequiredString(req.body.buyerName)
    const sellerName = normalizeRequiredString(req.body.sellerName)
    const sellerPhone = normalizeRequiredString(req.body.sellerPhone)
    const title = normalizeRequiredString(req.body.title)
    const amount = normalizeAmount(req.body.amount)

    if (!assetType || !identifier || !buyerName || !sellerName) {
      return res.status(400).json({ error: 'assetType, identifier, buyerName and sellerName are required' })
    }

    const dealRoom = db.createDealRoom({
      assetType,
      identifier: identifier.toUpperCase(),
      title: title || `${assetType} ${identifier}`,
      buyerName,
      sellerName,
      sellerPhone,
      sellerId: req.user.id,
      buyerId: req.user.id, // In real app, would be separate
      status: 'pending',
      fraud: false,
      riskScore: 0,
      amount,
      officialChecks: typeof req.body.officialChecks === 'object' && req.body.officialChecks !== null ? req.body.officialChecks : {},
      evidenceDocuments: typeof req.body.evidenceDocuments === 'object' && req.body.evidenceDocuments !== null ? req.body.evidenceDocuments : {},
      governmentVerification: typeof req.body.governmentVerification === 'object' && req.body.governmentVerification !== null ? req.body.governmentVerification : undefined,
      sellerKyc: typeof req.body.sellerKyc === 'object' && req.body.sellerKyc !== null ? req.body.sellerKyc : undefined,
      identityProof: Boolean(req.body.identityProof),
      authorityProof: Boolean(req.body.authorityProof),
      supportingDocs: Boolean(req.body.supportingDocs),
      inspectionNotes: Boolean(req.body.inspectionNotes),
      paymentMilestone: Boolean(req.body.paymentMilestone),
    })

    // Run fraud detection
    const allRooms = db.getAllDealRooms()
    fraudDetectionEngine.analyzeDealRoom(dealRoom, allRooms)

    auditLogger.log({
      userId: req.user.id,
      agency: req.user.agency,
      action: 'deal_room_created',
      resourceType: 'deal_room',
      resourceId: dealRoom.id,
      changes: { ...dealRoom },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    })

    res.json(db.getDealRoom(dealRoom.id) || dealRoom)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create deal room' })
  }
})

router.get('/deal-rooms', authMiddleware, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' })

  const rooms = db.getAllDealRooms()

  // Filter based on role
  let filteredRooms = rooms
  if (req.user.role === 'citizen') {
    filteredRooms = rooms.filter(r => r.sellerId === req.user!.id || r.buyerId === req.user!.id)
  }
  // Police, Lands, NTSA, KRA, Intelligence can see all

  res.json(filteredRooms)
})

router.get('/deal-rooms/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const dealRoom = db.getDealRoom(req.params.id)
  if (!dealRoom) {
    return res.status(404).json({ error: 'Deal room not found' })
  }

  // Check access
  if (req.user?.role === 'citizen' && req.user.id !== dealRoom.sellerId && req.user.id !== dealRoom.buyerId) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const verifications = db.getVerificationsByDealRoom(dealRoom.id)
  const alerts = db.getRiskAlertsByDealRoom(dealRoom.id)
  const auditTrail = auditLogger.getDealRoomAuditTrail(dealRoom.id)

  res.json({
    dealRoom,
    verifications,
    alerts,
    auditTrail,
  })
})

router.put('/deal-rooms/:id/status', authMiddleware, roleMiddleware('police', 'lands', 'ntsa', 'kra', 'intelligence'), (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' })

  const { status } = req.body
  if (!isStatus(status)) {
    return res.status(400).json({ error: 'Invalid transaction status' })
  }

  const dealRoom = db.updateDealRoom(req.params.id, {
    status,
    completedAt: status === 'completed' ? new Date() : undefined,
  })

  if (!dealRoom) {
    return res.status(404).json({ error: 'Deal room not found' })
  }

  auditLogger.log({
    userId: req.user.id,
    agency: req.user.agency,
    action: 'deal_room_status_updated',
    resourceType: 'deal_room',
    resourceId: dealRoom.id,
    changes: { status },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  })

  res.json(dealRoom)
})

// Analytics & Reports Routes
router.get('/analytics/fraud-summary', authMiddleware, roleMiddleware('police', 'intelligence'), (req: AuthRequest, res: Response) => {
  const allRooms = db.getAllDealRooms()
  const flaggedRooms = allRooms.filter(r => r.fraud || r.riskScore >= 60)
  const alerts = db.getHighSeverityAlerts()

  res.json({
    totalTransactions: allRooms.length,
    flaggedCount: flaggedRooms.length,
    flagRate: allRooms.length > 0 ? (flaggedRooms.length / allRooms.length) * 100 : 0,
    highSeverityAlerts: alerts.length,
    byType: {
      fraud: flaggedRooms.filter(r => r.fraud).length,
      duplicates: flaggedRooms.filter(r => r.conflictWith && r.conflictWith.length > 0).length,
      highRisk: flaggedRooms.filter(r => r.riskScore >= 75).length,
    },
  })
})

router.get('/analytics/asset-trace', authMiddleware, roleMiddleware('police', 'intelligence', 'lands', 'ntsa'), (req: AuthRequest, res: Response) => {
  const { assetType, identifier } = req.query
  if (!assetType || !identifier) {
    return res.status(400).json({ error: 'assetType and identifier required' })
  }

  const assetKey = `${assetType}-${identifier}`.toLowerCase()
  const rooms = db.getDealRoomsByAssetKey(assetType as string, identifier as string)
  const ownership = db.getOwnership(assetKey)

  res.json({
    assetKey,
    currentOwnership: ownership,
    transactionHistory: rooms.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
  })
})

router.get('/analytics/high-risk-sellers', authMiddleware, roleMiddleware('police', 'intelligence'), (req: AuthRequest, res: Response) => {
  const allRooms = db.getAllDealRooms()
  const sellerStats = new Map<string, { count: number; flaggedCount: number; names: string[] }>()

  allRooms.forEach(room => {
    const stats = sellerStats.get(room.sellerId) || { count: 0, flaggedCount: 0, names: [] }
    stats.count++
    if (room.fraud || room.riskScore >= 60) stats.flaggedCount++
    if (!stats.names.includes(room.sellerName)) stats.names.push(room.sellerName)
    sellerStats.set(room.sellerId, stats)
  })

  const highRisk = Array.from(sellerStats.entries())
    .filter(([, stats]) => stats.flaggedCount >= 2)
    .map(([id, stats]) => ({ id, ...stats, flagRate: (stats.flaggedCount / stats.count) * 100 }))
    .sort((a, b) => b.flagRate - a.flagRate)

  res.json(highRisk)
})

router.get('/audit-logs', authMiddleware, roleMiddleware('police', 'intelligence', 'kra'), (req: AuthRequest, res: Response) => {
  const logs = auditLogger.getUserAuditTrail(req.user?.id || '')
  res.json(logs)
})

export default router
