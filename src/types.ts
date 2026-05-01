export type AssetType = 'land' | 'car'

export type AssetStatus = 'safe' | 'caution' | 'stop'

export interface GovernmentVerification {
  assetType: AssetType
  identifier: string
  registry: 'Ardhisasa' | 'NTSA'
  verified: boolean
  status: 'clear' | 'caution' | 'blocked'
  owner: string
  reference: string
  checkedAt: string
  caveats: string[]
  encumbrances: string[]
  message: string
}

export interface DealRoom {
  id: string
  assetType: AssetType
  identifier: string
  title: string
  createdAt: string
  buyerName: string
  sellerName: string
  sellerPhone: string
  officialChecks: Record<string, boolean>
  evidenceDocuments?: Record<string, string>
  governmentVerification?: GovernmentVerification
  identityProof: boolean
  authorityProof: boolean
  supportingDocs: boolean
  inspectionNotes: boolean
  paymentMilestone: boolean
  conflict?: string
  fraud?: boolean
  riskScore?: number
  status?: 'pending' | 'completed' | 'flagged' | 'rejected'
  completed: boolean
}
