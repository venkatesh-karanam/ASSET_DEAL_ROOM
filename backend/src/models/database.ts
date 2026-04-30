import { v4 as uuidv4 } from 'uuid'

export type AgencyRole = 'police' | 'lands' | 'ntsa' | 'kra' | 'intelligence' | 'citizen'
export type TransactionStatus = 'pending' | 'completed' | 'flagged' | 'rejected'
export type VerificationStatus = 'verified' | 'pending' | 'failed'

export interface User {
  id: string
  email: string
  passwordHash: string
  role: AgencyRole
  agency: string
  huduma?: string
  bvn?: string
  createdAt: Date
  lastLogin?: Date
  active: boolean
}

export interface DealRoom {
  id: string
  assetType: 'land' | 'car'
  identifier: string
  title: string
  buyerName: string
  sellerName: string
  sellerPhone?: string
  sellerId: string
  buyerId: string
  sellerHuduma?: string
  buyerHuduma?: string
  createdAt: Date
  completedAt?: Date
  status: TransactionStatus
  amount?: number
  mpesaRef?: string
  fraud: boolean
  conflictWith?: string[]
  riskScore: number
  notes?: string
  officialChecks?: Record<string, boolean>
  identityProof?: boolean
  authorityProof?: boolean
  supportingDocs?: boolean
  inspectionNotes?: boolean
  paymentMilestone?: boolean
}

export interface OwnershipRecord {
  id: string
  assetKey: string
  currentOwnerId: string
  currentOwnerName: string
  previousOwnerId?: string
  previousOwnerName?: string
  transferDate: Date
  dealRoomId: string
}

export interface AuditLog {
  id: string
  timestamp: Date
  userId: string
  agency: string
  action: string
  resourceType: string
  resourceId: string
  changes: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

export interface Verification {
  id: string
  dealRoomId: string
  type: 'ardhisasa' | 'ntsa' | 'kra_identity' | 'mpesa'
  status: VerificationStatus
  result?: Record<string, unknown>
  error?: string
  verifiedAt?: Date
  verifiedBy?: string
}

export interface RiskAlert {
  id: string
  dealRoomId: string
  type: 'fraud_flag' | 'duplicate_sale' | 'rapid_flipping' | 'sanctions_match' | 'money_laundering'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  flaggedAt: Date
  flaggedBy?: string
  resolution?: string
}

export interface IntelligenceReport {
  id: string
  generatedAt: Date
  generatedBy: string
  reportType: 'fraud_summary' | 'asset_trace' | 'seller_profile' | 'buyer_profile' | 'regional_analysis'
  filters: Record<string, unknown>
  data: Record<string, unknown>
}

// In-memory database
export class Database {
  private users: Map<string, User> = new Map()
  private dealRooms: Map<string, DealRoom> = new Map()
  private ownership: Map<string, OwnershipRecord> = new Map()
  private auditLogs: AuditLog[] = []
  private verifications: Map<string, Verification> = new Map()
  private riskAlerts: Map<string, RiskAlert> = new Map()
  private intelligenceReports: Map<string, IntelligenceReport> = new Map()

  // User operations
  createUser(user: Omit<User, 'id' | 'createdAt'> & { id?: string }): User {
    const newUser: User = {
      ...user,
      id: user.id || uuidv4(),
      createdAt: new Date(),
    }
    this.users.set(newUser.id, newUser)
    return newUser
  }

  findUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.email === email)
  }

  findUserById(id: string): User | undefined {
    return this.users.get(id)
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id)
    if (!user) return undefined
    const updated = { ...user, ...updates }
    this.users.set(id, updated)
    return updated
  }

  // Deal room operations
  createDealRoom(room: Omit<DealRoom, 'id' | 'createdAt'>): DealRoom {
    const newRoom: DealRoom = {
      ...room,
      id: uuidv4(),
      createdAt: new Date(),
    }
    this.dealRooms.set(newRoom.id, newRoom)
    return newRoom
  }

  getDealRoom(id: string): DealRoom | undefined {
    return this.dealRooms.get(id)
  }

  updateDealRoom(id: string, updates: Partial<DealRoom>): DealRoom | undefined {
    const room = this.dealRooms.get(id)
    if (!room) return undefined
    const updated = { ...room, ...updates }
    this.dealRooms.set(id, updated)
    return updated
  }

  getAllDealRooms(): DealRoom[] {
    return Array.from(this.dealRooms.values())
  }

  getDealRoomsByAssetKey(assetType: string, identifier: string): DealRoom[] {
    const key = `${assetType}-${identifier.toLowerCase()}`
    return Array.from(this.dealRooms.values()).filter(
      r => `${r.assetType}-${r.identifier.toLowerCase()}` === key
    )
  }

  // Ownership operations
  recordOwnership(ownership: Omit<OwnershipRecord, 'id'>): OwnershipRecord {
    const record: OwnershipRecord = {
      ...ownership,
      id: uuidv4(),
    }
    this.ownership.set(record.assetKey, record)
    return record
  }

  getOwnership(assetKey: string): OwnershipRecord | undefined {
    return this.ownership.get(assetKey)
  }

  // Audit log operations
  addAuditLog(log: Omit<AuditLog, 'id'>): AuditLog {
    const auditLog: AuditLog = {
      ...log,
      id: uuidv4(),
    }
    this.auditLogs.push(auditLog)
    return auditLog
  }

  getAuditLogs(filters?: { userId?: string; resourceId?: string; action?: string }): AuditLog[] {
    let logs = this.auditLogs
    if (filters?.userId) logs = logs.filter(l => l.userId === filters.userId)
    if (filters?.resourceId) logs = logs.filter(l => l.resourceId === filters.resourceId)
    if (filters?.action) logs = logs.filter(l => l.action === filters.action)
    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Verification operations
  createVerification(verification: Omit<Verification, 'id'>): Verification {
    const newVerification: Verification = {
      ...verification,
      id: uuidv4(),
    }
    this.verifications.set(newVerification.id, newVerification)
    return newVerification
  }

  getVerificationsByDealRoom(dealRoomId: string): Verification[] {
    return Array.from(this.verifications.values()).filter(v => v.dealRoomId === dealRoomId)
  }

  // Risk alert operations
  createRiskAlert(alert: Omit<RiskAlert, 'id' | 'flaggedAt'>): RiskAlert {
    const newAlert: RiskAlert = {
      ...alert,
      id: uuidv4(),
      flaggedAt: new Date(),
    }
    this.riskAlerts.set(newAlert.id, newAlert)
    return newAlert
  }

  getRiskAlertsByDealRoom(dealRoomId: string): RiskAlert[] {
    return Array.from(this.riskAlerts.values()).filter(a => a.dealRoomId === dealRoomId)
  }

  getHighSeverityAlerts(): RiskAlert[] {
    return Array.from(this.riskAlerts.values()).filter(a => ['high', 'critical'].includes(a.severity))
  }

  // Intelligence report operations
  createIntelligenceReport(report: Omit<IntelligenceReport, 'id'>): IntelligenceReport {
    const newReport: IntelligenceReport = {
      ...report,
      id: uuidv4(),
    }
    this.intelligenceReports.set(newReport.id, newReport)
    return newReport
  }

  getIntelligenceReports(type?: string): IntelligenceReport[] {
    const reports = Array.from(this.intelligenceReports.values())
    if (type) return reports.filter(r => r.reportType === type)
    return reports.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime())
  }
}

// Global database instance
export const db = new Database()
