import { AgencyRole, TransactionStatus } from './models/database'

const roles: AgencyRole[] = ['police', 'lands', 'ntsa', 'kra', 'intelligence', 'citizen']
const statuses: TransactionStatus[] = ['pending', 'completed', 'flagged', 'rejected']
const assetTypes = ['land', 'car'] as const

export function isRole(value: unknown): value is AgencyRole {
  return typeof value === 'string' && roles.includes(value as AgencyRole)
}

export function isStatus(value: unknown): value is TransactionStatus {
  return typeof value === 'string' && statuses.includes(value as TransactionStatus)
}

export function normalizeEmail(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const email = value.trim().toLowerCase()
  return email.includes('@') ? email : undefined
}

export function normalizeRequiredString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export function normalizeAssetType(value: unknown): 'land' | 'car' | undefined {
  return typeof value === 'string' && assetTypes.includes(value as 'land' | 'car') ? (value as 'land' | 'car') : undefined
}

export function normalizeAmount(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined
  const amount = Number(value)
  return Number.isFinite(amount) && amount >= 0 ? amount : undefined
}
