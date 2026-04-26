export type AssetType = 'land' | 'car'

export type AssetStatus = 'safe' | 'caution' | 'stop'

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
  identityProof: boolean
  authorityProof: boolean
  supportingDocs: boolean
  inspectionNotes: boolean
  paymentMilestone: boolean
  conflict?: string
  fraud?: boolean
}
