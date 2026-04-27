import { db, AuditLog } from '../models/database'

export interface AuditEntry {
  userId: string
  agency: string
  action: string
  resourceType: string
  resourceId: string
  changes: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

export const auditLogger = {
  log: (entry: AuditEntry): AuditLog => {
    return db.addAuditLog({
      ...entry,
      timestamp: new Date(),
    })
  },

  getDealRoomAuditTrail: (dealRoomId: string): AuditLog[] => {
    return db.getAuditLogs({ resourceId: dealRoomId })
  },

  getUserAuditTrail: (userId: string): AuditLog[] => {
    return db.getAuditLogs({ userId })
  },

  getActionLog: (action: string): AuditLog[] => {
    return db.getAuditLogs({ action })
  },
}
