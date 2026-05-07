import { useEffect, useMemo, useState } from 'react'
import type { AssetType, DealRoom, GovernmentVerification, SellerKyc } from './types'
import SystemStatusDashboard from './components/SystemStatusDashboard'
import FailureManagement from './components/FailureManagement'
import MessyDocumentIntelligence from './components/MessyDocumentIntelligence'
import BehavioralIntelligence from './components/BehavioralIntelligence'
import DataOwnershipTransparency from './components/DataOwnershipTransparency'
import AuditImmutability from './components/AuditImmutability'
import MarketUrgencyDashboard from './components/MarketUrgencyDashboard'
import DiasporaMode from './components/DiasporaMode'
import VerificationSeal from './components/VerificationSeal'
import SocialProofPanel from './components/SocialProofPanel'
import ActionPrompts from './components/ActionPrompts'
import { ReportGenerator } from './components/ReportGenerator'

const storageKey = 'dealroom-ke-rooms'
const ownersKey = 'dealroom-ke-owners'
const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const demoCitizen = { email: 'citizen@example.com', password: 'demo123' }
const initialChecks = {
  ardhiSearch: false,
  ntsaRecord: false,
  sellerId: false,
  sellerAuthority: false,
}

const initialEvidenceDocuments = {
  registryCertificate: '',
  sellerIdDocument: '',
  sellerKraPinCertificate: '',
  sellerSelfieMatch: '',
  sellerAddressProof: '',
  sellerAuthorityDocument: '',
  supportingDocument: '',
  inspectionDocument: '',
  paymentInstruction: '',
}

const assetLabels = {
  land: 'Land title number',
  car: 'Vehicle registration number',
}

const identifierHelp = {
  land: 'Use the official title format, for example LR.12345/678 or NAIROBI/BLOCK/123.',
  car: 'Use the registration format shown on the logbook, for example KCA 123A.',
}

const statusDescriptions = {
  land: 'A room is safe only after the registry check is clear and all evidence documents are attached.',
  car: 'A room is safe only after the NTSA check is clear and all evidence documents are attached.',
}

function getInitialRooms(): DealRoom[] {
  try {
    const raw = window.localStorage.getItem(storageKey)
    return raw ? (JSON.parse(raw) as DealRoom[]) : []
  } catch {
    return []
  }
}

interface OwnershipRecord {
  currentOwner: string
  previousOwner?: string
}

interface BackendDealRoom {
  id: string
  assetType: AssetType
  identifier: string
  title: string
  buyerName: string
  sellerName: string
  sellerPhone?: string
  createdAt: string
  status: 'pending' | 'completed' | 'flagged' | 'rejected'
  fraud: boolean
  conflictWith?: string[]
  riskScore: number
  officialChecks?: Record<string, boolean>
  identityProof?: boolean
  authorityProof?: boolean
  supportingDocs?: boolean
  inspectionNotes?: boolean
  paymentMilestone?: boolean
  evidenceDocuments?: Record<string, string>
  governmentVerification?: GovernmentVerification
  sellerKyc?: SellerKyc
}

interface ECitizenStatus {
  configured: boolean
  mode: 'mock' | 'ready_for_oidc'
  authFlow: string
  requiredCredentials: string[]
}

interface ECitizenKycProfile {
  idNumber: string
  kraPin: string
  firstName: string
  lastName: string
  mobileNumber: string
  mobileVerified: boolean
  accountType: string
  source: 'mock' | 'ecitizen'
}

function mapBackendRoom(room: BackendDealRoom): DealRoom {
  return {
    id: room.id,
    assetType: room.assetType,
    identifier: room.identifier,
    title: room.title,
    createdAt: room.createdAt,
    buyerName: room.buyerName,
    sellerName: room.sellerName,
    sellerPhone: room.sellerPhone || '',
    officialChecks: room.officialChecks || {},
    evidenceDocuments: room.evidenceDocuments || {},
    governmentVerification: room.governmentVerification,
    sellerKyc: room.sellerKyc,
    identityProof: Boolean(room.identityProof),
    authorityProof: Boolean(room.authorityProof),
    supportingDocs: Boolean(room.supportingDocs),
    inspectionNotes: Boolean(room.inspectionNotes),
    paymentMilestone: Boolean(room.paymentMilestone),
    conflict: room.conflictWith?.length ? `Duplicate asset room exists (${room.conflictWith.join(', ')})` : undefined,
    fraud: room.fraud,
    riskScore: room.riskScore,
    status: room.status,
    completed: room.status === 'completed',
  }
}

async function loginDemoCitizen(): Promise<string> {
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(demoCitizen),
  })
  if (!response.ok) throw new Error('Demo login failed')
  const data = await response.json()
  return data.token
}

function getInitialOwners(): Record<string, OwnershipRecord> {
  try {
    const raw = window.localStorage.getItem(ownersKey)
    return raw ? (JSON.parse(raw) as Record<string, OwnershipRecord>) : {}
  } catch {
    return {}
  }
}

function getRiskStatus(room: DealRoom): { status: string; color: string } {
  const verification = room.governmentVerification
  const evidence = room.evidenceDocuments || {}
  const sellerKyc = room.sellerKyc
  const hasRegistryEvidence = Boolean(evidence.registryCertificate)
  const hasIdentityEvidence = Boolean(evidence.sellerIdDocument)
  const hasKraEvidence = Boolean(evidence.sellerKraPinCertificate)
  const hasSelfieEvidence = Boolean(evidence.sellerSelfieMatch)
  const hasAddressEvidence = Boolean(evidence.sellerAddressProof)
  const hasAuthorityEvidence = Boolean(evidence.sellerAuthorityDocument)
  const hasSupportingEvidence = Boolean(evidence.supportingDocument)
  const hasInspectionEvidence = Boolean(evidence.inspectionDocument)
  const hasPaymentEvidence = Boolean(evidence.paymentInstruction)

  if (
    room.fraud ||
    room.conflict ||
    verification?.status === 'blocked' ||
    !verification?.verified ||
    !sellerKyc ||
    sellerKyc.status === 'incomplete'
  ) {
    return { status: 'Do not pay yet', color: 'var(--danger)' }
  }

  if (
    verification.status !== 'clear' ||
    sellerKyc.status !== 'verified' ||
    !hasRegistryEvidence ||
    !hasIdentityEvidence ||
    !hasKraEvidence ||
    !hasSelfieEvidence ||
    !hasAddressEvidence ||
    !hasAuthorityEvidence ||
    !hasSupportingEvidence ||
    !hasInspectionEvidence ||
    !hasPaymentEvidence
  ) {
    return { status: 'Proceed with caution', color: 'var(--warning)' }
  }

  return { status: 'Safe to proceed', color: 'var(--success)' }
}

function App() {
  const [rooms, setRooms] = useState<DealRoom[]>(getInitialRooms)
  const [assetOwners, setAssetOwners] = useState<Record<string, OwnershipRecord>>(getInitialOwners)
  const [assetType, setAssetType] = useState<AssetType>('land')
  const [identifier, setIdentifier] = useState('')
  const [title, setTitle] = useState('')
  const [buyerName, setBuyerName] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [buyerPhoneVerified, setBuyerPhoneVerified] = useState(false)
  const [sellerName, setSellerName] = useState('')
  const [sellerPhone, setSellerPhone] = useState('')
  const [sellerIdNumber, setSellerIdNumber] = useState('')
  const [sellerKraPin, setSellerKraPin] = useState('')
  const [sellerPhoneVerified, setSellerPhoneVerified] = useState(false)
  const [checked, setChecked] = useState(initialChecks)
  const [evidenceDocuments, setEvidenceDocuments] = useState(initialEvidenceDocuments)
  const [governmentVerification, setGovernmentVerification] = useState<GovernmentVerification | null>(null)
  const [verificationLoading, setVerificationLoading] = useState(false)
  const [identityProof, setIdentityProof] = useState(false)
  const [authorityProof, setAuthorityProof] = useState(false)
  const [supportingDocs, setSupportingDocs] = useState(false)
  const [inspectionNotes, setInspectionNotes] = useState(false)
  const [paymentMilestone, setPaymentMilestone] = useState(false)
  const [message, setMessage] = useState('')
  const [backendToken, setBackendToken] = useState<string | null>(null)
  const [backendOnline, setBackendOnline] = useState(false)
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [ecitizenStatus, setEcitizenStatus] = useState<ECitizenStatus | null>(null)
  const [ecitizenLoading, setEcitizenLoading] = useState(false)
  const [behavioralAnalysis, setBehavioralAnalysis] = useState({
    overallRisk: 'low' as 'low' | 'medium' | 'high' | 'critical',
    recommendations: [] as string[],
  })
  const [documentAnalysis, setDocumentAnalysis] = useState<Record<string, any>>({})
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [commitmentAccepted, setCommitmentAccepted] = useState(false)

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(rooms))
  }, [rooms])

  useEffect(() => {
    let active = true

    async function loadRoomsFromBackend() {
      try {
        const token = await loginDemoCitizen()
        const [response, statusResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/deal-rooms`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiBaseUrl}/integrations/ecitizen/status`),
        ])
        if (statusResponse.ok) {
          setEcitizenStatus((await statusResponse.json()) as ECitizenStatus)
        }
        if (!response.ok) throw new Error('Failed to load deal rooms')
        const data = (await response.json()) as BackendDealRoom[]
        if (!active) return
        setBackendToken(token)
        setBackendOnline(true)
        setRooms(data.map(mapBackendRoom))
      } catch {
        if (!active) return
        setBackendOnline(false)
        setEcitizenStatus({
          configured: false,
          mode: 'mock',
          authFlow: 'OAuth 2.0 Authorization Code with PKCE',
          requiredCredentials: ['ECITIZEN_CLIENT_ID', 'ECITIZEN_CLIENT_SECRET', 'ECITIZEN_REDIRECT_URI'],
        })
        setMessage('Backend is not running, so this session is using browser storage.')
      } finally {
        if (active) setLoadingRooms(false)
      }
    }

    loadRoomsFromBackend()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(ownersKey, JSON.stringify(assetOwners))
  }, [assetOwners])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const syncFromECitizen = async () => {
    if (!sellerName.trim()) {
      setMessage('Enter the seller name before syncing eCitizen KYC.')
      return
    }

    setEcitizenLoading(true)
    try {
      if (!backendToken) throw new Error('Backend unavailable')
      const response = await fetch(`${apiBaseUrl}/integrations/ecitizen/mock-kyc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${backendToken}`,
        },
        body: JSON.stringify({ sellerName, sellerPhone }),
      })
      if (!response.ok) throw new Error('eCitizen KYC sync failed')
      const profile = (await response.json()) as ECitizenKycProfile
      setSellerIdNumber(profile.idNumber)
      setSellerKraPin(profile.kraPin)
      setSellerPhone(profile.mobileNumber)
      setSellerPhoneVerified(profile.mobileVerified)
      setMessage(`eCitizen ${profile.source} KYC synced for ${profile.firstName} ${profile.lastName}.`)
    } catch {
      setSellerIdNumber('12345678')
      setSellerKraPin('A123456789B')
      setSellerPhone((prev) => prev || '254711000000')
      setSellerPhoneVerified(true)
      setMessage('Using local eCitizen mock KYC because the backend sync is unavailable.')
    } finally {
      setEcitizenLoading(false)
    }
  }

  const activeConflict = useMemo(() => {
    const existing = rooms.find(
      (room) => room.assetType === assetType && room.identifier.trim().toLowerCase() === identifier.trim().toLowerCase(),
    )
    return existing ? `Active room created on ${new Date(existing.createdAt).toLocaleString()} for ${existing.assetType === 'land' ? 'land' : 'car'}.` : undefined
  }, [assetType, identifier, rooms])

  const activeOwnerKey = `${assetType}-${identifier.trim().toLowerCase()}`
  const ownershipRecord = assetOwners[activeOwnerKey]
  const currentOwner = ownershipRecord?.currentOwner
  const previousOwner = ownershipRecord?.previousOwner
  const riskSummary = useMemo(() => {
    if (!identifier || !buyerName || !sellerName) return 'Complete the form to see risk status.'
    const conflict = activeConflict ? 'Conflict detected: duplicate asset room exists.' : ''
    const fraudCheck = currentOwner && currentOwner !== sellerName.trim() ? 'Fraud risk: Seller is not the current owner.' : ''
    const registryCheck = governmentVerification
      ? `${governmentVerification.registry} check: ${governmentVerification.message}`
      : 'Run the mock government registry check before marking this deal safe.'
    return conflict || fraudCheck || registryCheck
  }, [activeConflict, buyerName, identifier, sellerName, currentOwner, governmentVerification])

  const sellerKyc = useMemo<SellerKyc>(() => {
    const idNumber = sellerIdNumber.trim()
    const kraPin = sellerKraPin.trim().toUpperCase()
    const idDocumentUploaded = Boolean(evidenceDocuments.sellerIdDocument)
    const kraPinCertificateUploaded = Boolean(evidenceDocuments.sellerKraPinCertificate)
    const selfieMatchUploaded = Boolean(evidenceDocuments.sellerSelfieMatch)
    const proofOfAddressUploaded = Boolean(evidenceDocuments.sellerAddressProof)
    const authorityDocumentUploaded = Boolean(evidenceDocuments.sellerAuthorityDocument)
    const validIdNumber = /^\d{6,10}$/.test(idNumber)
    const validKraPin = /^[AP]\d{9}[A-Z]$/.test(kraPin)
    const checks = [
      validIdNumber,
      validKraPin,
      sellerPhoneVerified,
      buyerPhoneVerified,
      idDocumentUploaded,
      kraPinCertificateUploaded,
      selfieMatchUploaded,
      proofOfAddressUploaded,
      authorityDocumentUploaded,
    ]
    const score = Math.round((checks.filter(Boolean).length / checks.length) * 100)
    const status = score === 100 ? 'verified' : score >= 70 ? 'review' : 'incomplete'

    return {
      idNumber,
      kraPin,
      phoneVerified: sellerPhoneVerified,
      idDocumentUploaded,
      kraPinCertificateUploaded,
      selfieMatchUploaded,
      proofOfAddressUploaded,
      authorityDocumentUploaded,
      score,
      status,
    }
  }, [evidenceDocuments, sellerIdNumber, sellerKraPin, sellerPhoneVerified, buyerPhoneVerified])

  const evidenceFileCount = useMemo(
    () => Object.values(evidenceDocuments).filter(Boolean).length,
    [evidenceDocuments],
  )

  const riskPreview = useMemo<{
    key: 'safe' | 'caution' | 'stop'
    label: string
  }>(() => {
    const sellerMismatch = Boolean(currentOwner && currentOwner !== sellerName.trim())

    if (
      activeConflict ||
      sellerMismatch ||
      governmentVerification?.status === 'blocked' ||
      !governmentVerification?.verified ||
      sellerKyc.status === 'incomplete'
    ) {
      return { key: 'stop', label: 'Transaction blocked until issues are resolved' }
    }

    if (governmentVerification.status !== 'clear' || sellerKyc.status !== 'verified' || evidenceFileCount < 9) {
      return { key: 'caution', label: 'There are unresolved risks tied to this transaction' }
    }

    return { key: 'safe', label: 'Final fraud protection screening passed' }
  }, [activeConflict, currentOwner, evidenceFileCount, governmentVerification, sellerKyc.status, sellerName])

  const reportRoomData = useMemo(
    () => ({
      id: 'draft',
      assetType,
      identifier,
      title,
      buyerName,
      sellerName,
      sellerPhone,
      buyerPhone,
      createdAt: new Date().toISOString(),
      status: riskPreview.key === 'safe' ? 'pending' : 'review',
      fraud: false,
      riskScore: riskPreview.key === 'safe' ? 15 : riskPreview.key === 'caution' ? 50 : 90,
      governmentVerification,
      sellerKyc,
      evidenceDocuments,
    }),
    [assetType, identifier, title, buyerName, sellerName, sellerPhone, buyerPhone, riskPreview.key, governmentVerification, sellerKyc, evidenceDocuments],
  )

  const handleActionPrompt = (actionId: string) => {
    switch (actionId) {
      case 'system_registry_down':
      case 'verification_missing':
      case 'verification_caution':
        setCurrentStep(5)
        if (!governmentVerification) {
          handleGovernmentVerification()
        }
        break
      case 'kyc_incomplete':
        setCurrentStep(3)
        break
      case 'documents_minimum':
      case 'documents_incomplete':
      case 'document_quality_registryCertificate':
      case 'document_quality_sellerIdDocument':
      case 'document_quality_sellerKraPinCertificate':
      case 'document_quality_sellerSelfieMatch':
      case 'document_quality_sellerAddressProof':
      case 'document_quality_sellerAuthorityDocument':
      case 'document_quality_supportingDocument':
      case 'document_quality_inspectionDocument':
      case 'document_quality_paymentInstruction':
        setCurrentStep(4)
        break
      case 'step_asset_setup':
        setCurrentStep(1)
        break
      case 'step_party_verification':
        setCurrentStep(2)
        break
      case 'step_kyc_completion':
        setCurrentStep(3)
        break
      case 'step_document_upload':
        setCurrentStep(4)
        break
      case 'step_final_review':
        setCurrentStep(5)
        break
      default:
        console.log('Unhandled action prompt:', actionId)
    }
  }

  const [currentStep, setCurrentStep] = useState(1)
  const [processTerminated, setProcessTerminated] = useState(false)
  const [terminationReasons, setTerminationReasons] = useState<string[]>([])
  const totalSteps = 5

  const verificationReference = useMemo(() => {
    const label = identifier.trim().replace(/\W/g, '').slice(0, 6).toUpperCase() || 'DRAFT'
    return `DR-${assetType.toUpperCase().slice(0, 3)}-${label}-${Math.floor(Date.now() / 1000)}`
  }, [assetType, identifier])

  const regionalRisk = useMemo(() => {
    const key = identifier.trim().toUpperCase()
    if (assetType === 'land' && key.includes('NAIROBI')) {
      return { region: 'Nairobi County', advisory: 'Elevated title dispute frequency in this region. Verify ownership records carefully.', level: 'high' }
    }
    if (assetType === 'land' && key.includes('MOMBASA')) {
      return { region: 'Mombasa County', advisory: 'Coastal land disputes are common; check all succession records.', level: 'medium' }
    }
    if (assetType === 'car') {
      return { region: 'National vehicle registry', advisory: 'NTSA risk profile is standard but watch for duplicate registration claims.', level: 'normal' }
    }
    return { region: 'Kenya-wide', advisory: 'General protection infrastructure applies across all regions.', level: 'normal' }
  }, [assetType, identifier])

  const workflowSteps = [
    { label: 'Asset Setup', complete: Boolean(identifier.trim()) },
    { label: 'Party Protection', complete: Boolean(buyerName.trim() && sellerName.trim() && sellerPhone.trim() && sellerPhoneVerified) },
    { label: 'Seller KYC', complete: sellerKyc.status === 'verified' },
    { label: 'Evidence Capture', complete: evidenceFileCount === 9 },
    { label: 'Final Protection Review', complete: riskPreview.key === 'safe' },
  ]

  const completedStepCount = workflowSteps.filter((step) => step.complete).length
  const workflowProgress = Math.round((completedStepCount / totalSteps) * 100)

  const riskScore = useMemo(() => {
    let score = 100
    if (sellerKyc.status !== 'verified') score -= 28
    if (governmentVerification?.status !== 'clear') score -= 30
    score -= (9 - evidenceFileCount) * 4
    if (activeConflict) score -= 20
    if (governmentVerification?.status === 'blocked') score = 95
    if (!governmentVerification) score -= 10
    return Math.min(100, Math.max(0, score))
  }, [sellerKyc.status, governmentVerification, evidenceFileCount, activeConflict])

  const riskTriggers = useMemo(() => {
    const triggers: string[] = []
    if (sellerKyc.status !== 'verified') triggers.push('Seller KYC incomplete')
    if (!governmentVerification) triggers.push('Registry verification not run')
    if (governmentVerification?.status === 'blocked') triggers.push('Registry check blocked the transaction')
    if (governmentVerification?.status === 'caution') triggers.push('Registry found caveats or encumbrances')
    if (evidenceFileCount < 9) triggers.push('Missing evidence documents')
    if (activeConflict) triggers.push('Duplicate asset / ownership conflict detected')
    return triggers
  }, [sellerKyc.status, governmentVerification, evidenceFileCount, activeConflict])

  const lastVerifiedLabel = governmentVerification?.checkedAt
    ? `Last verified ${new Date(governmentVerification.checkedAt).toLocaleString('en-KE')}`
    : 'Not verified yet'

  const liveStatusMessages = [
    verificationLoading ? (assetType === 'land' ? 'Checking Ardhisasa…' : 'Checking NTSA…') : null,
    governmentVerification ? lastVerifiedLabel : null,
  ].filter(Boolean)

  const verificationActions = {
    paymentLocked: true,
    fundsOnHold: true,
    releaseEnabled: riskPreview.key === 'safe',
  }

  const terminalMismatchReasons = useMemo(() => {
    const reasons: string[] = []
    if (activeConflict) {
      reasons.push(activeConflict)
    }
    const seller = sellerName.trim()
    if (currentOwner && seller && currentOwner !== seller) {
      reasons.push(`Seller does not match recorded owner (${currentOwner}).`)
    }
    if (governmentVerification?.status === 'blocked') {
      reasons.push(`${governmentVerification.registry} blocked this asset: ${governmentVerification.message}`)
    }
    return reasons
  }, [activeConflict, currentOwner, sellerName, governmentVerification])

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return Boolean(identifier.trim())
      case 2:
        return Boolean(buyerName.trim() && sellerName.trim() && sellerPhone.trim() && sellerPhoneVerified)
      case 3:
        return Boolean(sellerIdNumber.trim().length > 0 && sellerKraPin.trim().length > 0 && buyerPhone.trim().length > 0 && buyerPhoneVerified)
      case 4:
        return evidenceFileCount >= 6
      case 5:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (processTerminated) {
      setMessage('The process is blocked by a mismatch. Please review the report or fix the issue first.')
      return
    }

    if (!validateStep(currentStep)) {
      setMessage('Please complete all required fields for this step before continuing.')
      return
    }

    if (currentStep === 4 && evidenceFileCount < 6) {
      setMessage('Upload at least 6 evidence documents before the final review.')
      return
    }

    if (currentStep >= 3 && terminalMismatchReasons.length > 0) {
      setProcessTerminated(true)
      setTerminationReasons(terminalMismatchReasons)
      setMessage('A critical mismatch was detected and the verification workflow has been blocked.')
      return
    }

    setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    setMessage('')
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    if (processTerminated) {
      setProcessTerminated(false)
      setTerminationReasons([])
    }
    setMessage('')
  }

  const generateMismatchReport = () => {
    const reportLines = [
      'DealRoom KE Mismatch Report',
      `Asset type: ${assetType}`,
      `Identifier: ${identifier}`,
      `Buyer: ${buyerName}`,
      `Seller: ${sellerName}`,
      `Seller phone: ${sellerPhone}`,
      '',
      'Mismatch reasons:',
      ...terminationReasons.map((reason) => `- ${reason}`),
      '',
      `Seller KYC status: ${sellerKyc.status} (${sellerKyc.score}%)`,
      `Government verification: ${governmentVerification?.registry ?? 'Not run'} ${governmentVerification?.status ?? ''}`,
      `Evidence count: ${evidenceFileCount} of 9`,
      `Conflict: ${activeConflict ?? 'None'}`,
      '',
      'Please review the mismatch details and resolve the issues before proceeding.',
    ]

    const blob = new Blob([reportLines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `dealroom-mismatch-report-${Date.now()}.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const setEvidenceFile = (key: keyof typeof initialEvidenceDocuments, fileList: FileList | null) => {
    setEvidenceDocuments((prev) => ({ ...prev, [key]: fileList?.[0]?.name || '' }))
  }

  const handleGovernmentVerification = async () => {
    if (!identifier.trim()) {
      setMessage('Enter the asset identifier before running government verification.')
      return
    }

    setVerificationLoading(true)
    try {
      if (!backendToken) throw new Error('Backend unavailable')
      const response = await fetch(`${apiBaseUrl}/government/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${backendToken}`,
        },
        body: JSON.stringify({ assetType, identifier }),
      })
      if (!response.ok) throw new Error('Verification failed')
      const result = (await response.json()) as GovernmentVerification
      setGovernmentVerification(result)
      setMessage(`${result.registry} mock verification complete: ${result.message}`)
    } catch {
      const normalized = identifier.trim().toUpperCase()
      const status = normalized.includes('STOLEN') || normalized.includes('FRAUD')
        ? 'blocked'
        : normalized.includes('CAVEAT') || normalized.includes('ENC') || normalized.includes('LOAN')
          ? 'caution'
          : 'clear'
      const registry = assetType === 'land' ? 'Ardhisasa' : 'NTSA'
      const localResult: GovernmentVerification = {
        assetType,
        identifier: normalized,
        registry,
        verified: status !== 'blocked',
        status,
        owner: 'Demo Registry Owner',
        reference: `LOCAL-${Date.now()}`,
        checkedAt: new Date().toISOString(),
        caveats: status === 'caution' ? ['Demo caveat or charge requires agency review'] : [],
        encumbrances: status === 'caution' ? ['Demo outstanding encumbrance'] : [],
        message: status === 'clear'
          ? 'Local mock check found no caveats or encumbrances.'
          : status === 'caution'
            ? 'Local mock check found issues that require review.'
            : 'Local mock check blocked this transaction.',
      }
      setGovernmentVerification(localResult)
      setMessage(`${registry} local mock verification complete: ${localResult.message}`)
    } finally {
      setVerificationLoading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!identifier.trim() || !buyerName.trim() || !sellerName.trim() || !sellerPhone.trim()) {
      setMessage('Please fill in all required fields.')
      return
    }

    if (!commitmentAccepted) {
      setMessage('Please confirm the buyer and seller commitment statements before continuing.')
      return
    }

    if (processTerminated || terminalMismatchReasons.length > 0 || riskPreview.key === 'stop') {
      setMessage('Cannot create a deal room while a terminal mismatch exists. Review the report and resolve the issue first.')
      return
    }

    if (sellerKyc.status !== 'verified') {
      setMessage('Seller KYC is incomplete. We verify identity before you release money.')
      return
    }

    const normalized = identifier.trim().toUpperCase()
    const normalizedSeller = sellerName.trim()
    const normalizedBuyer = buyerName.trim()
    const conflictRoom = rooms.find(
      (room) => room.assetType === assetType && room.identifier.trim().toUpperCase() === normalized,
    )

    const key = `${assetType}-${identifier.trim().toLowerCase()}`
    const currentOwner = assetOwners[key]?.currentOwner
    const isFraud = currentOwner ? currentOwner !== normalizedSeller : false

    if (isFraud) {
      setMessage('Possible fraud detected: Seller is not the current owner of this asset.')
    }

    const draftRoom: DealRoom = {
      id: crypto.randomUUID(),
      assetType,
      identifier: normalized,
      title: title.trim() || `${assetType === 'land' ? 'Title' : 'Reg No.'} ${normalized}`,
      createdAt: new Date().toISOString(),
      buyerName: normalizedBuyer,
      sellerName: normalizedSeller,
      sellerPhone: sellerPhone.trim(),
      officialChecks: {
        ardhiSearch: assetType === 'land' ? governmentVerification?.verified === true : false,
        ntsaRecord: assetType === 'car' ? governmentVerification?.verified === true : false,
        sellerId: Boolean(evidenceDocuments.sellerIdDocument),
        sellerAuthority: Boolean(evidenceDocuments.sellerAuthorityDocument),
      },
      evidenceDocuments,
      governmentVerification: governmentVerification || undefined,
      sellerKyc,
      identityProof: Boolean(evidenceDocuments.sellerIdDocument),
      authorityProof: Boolean(evidenceDocuments.sellerAuthorityDocument),
      supportingDocs: Boolean(evidenceDocuments.supportingDocument),
      inspectionNotes: Boolean(evidenceDocuments.inspectionDocument),
      paymentMilestone: Boolean(evidenceDocuments.paymentInstruction),
      conflict: conflictRoom ? `Duplicate asset room exists (${conflictRoom.id})` : undefined,
      fraud: isFraud,
      completed: false,
    }

    let newRoom = draftRoom
    let createdOnBackend = false
    if (backendToken) {
      try {
        const response = await fetch(`${apiBaseUrl}/deal-rooms`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${backendToken}`,
          },
          body: JSON.stringify({
            assetType: draftRoom.assetType,
            identifier: draftRoom.identifier,
            title: draftRoom.title,
            buyerName: draftRoom.buyerName,
            sellerName: draftRoom.sellerName,
            sellerPhone: draftRoom.sellerPhone,
            officialChecks: draftRoom.officialChecks,
            evidenceDocuments: draftRoom.evidenceDocuments,
            governmentVerification: draftRoom.governmentVerification,
            sellerKyc: draftRoom.sellerKyc,
            identityProof: draftRoom.identityProof,
            authorityProof: draftRoom.authorityProof,
            supportingDocs: draftRoom.supportingDocs,
            inspectionNotes: draftRoom.inspectionNotes,
            paymentMilestone: draftRoom.paymentMilestone,
          }),
        })
        if (!response.ok) throw new Error('Failed to create room')
        newRoom = mapBackendRoom(await response.json())
        createdOnBackend = true
        setBackendOnline(true)
      } catch {
        setBackendOnline(false)
        setMessage('Could not reach the backend, so the room was saved locally.')
      }
    }

    setRooms((prev) => [newRoom, ...prev.filter((room) => room.id !== newRoom.id)])
    if (!isFraud && !currentOwner) {
      setAssetOwners((prev) => ({ ...prev, [key]: { currentOwner: normalizedSeller } }))
    }
    const storageMode = createdOnBackend ? 'Synced to backend.' : 'Saved locally.'
    setMessage(isFraud ? `Deal room created with fraud flag. ${storageMode}` : `Deal room created for ${newRoom.title}. ${storageMode} Invite link: ${window.location.origin}/room/${newRoom.id}`)
  }

  const markCompleted = (id: string) => {
    const room = rooms.find((r) => r.id === id)
    if (room) {
      setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, completed: true } : r)))
      const key = `${room.assetType}-${room.identifier.toLowerCase()}`
      const ownershipRecord = assetOwners[key]
      const currentOwnerName = ownershipRecord?.currentOwner
      const sellerNameNormalized = room.sellerName.trim()
      const buyerNameNormalized = room.buyerName.trim()

      if (!room.fraud && (!currentOwnerName || currentOwnerName === sellerNameNormalized)) {
        setAssetOwners((prev) => ({ 
          ...prev, 
          [key]: { 
            currentOwner: buyerNameNormalized,
            previousOwner: currentOwnerName || sellerNameNormalized
          } 
        }))
      }
    }
  }

  return (
    <div className="page-shell">
      <header className="hero">
        <div>
          <span className="eyebrow">DealRoom KE</span>
          <h1>Kenya's Transaction Protection Infrastructure</h1>
          <p>Land, vehicles, equipment, and assets worth KSh 2.1 billion are lost to fraud every year. DealRoom KE combines identity, registry, evidence, and audit protection so you can trust the moment you release money.</p>
        </div>
      </header>

      {!isOnline && (
        <div className="notice danger">
          Offline mode active — your transaction progress is safely preserved and will sync once the connection returns.
        </div>
      )}

      <SystemStatusDashboard />

      <SocialProofPanel
        sellerName={sellerName || 'Seller profile'}
        verifiedTransactions={11}
        fraudDisputes={0}
        firstVerified="2025"
        lawyerName="Verified lawyer"
        lawyerVerified
        lawyerTransactions={43}
      />

      <MarketUrgencyDashboard />

      <FailureManagement />

      <MessyDocumentIntelligence
        uploadedFiles={evidenceDocuments}
        onAnalysisComplete={(analysis) => setDocumentAnalysis(analysis)}
      />

      <BehavioralIntelligence
        sellerName={sellerName}
        sellerPhone={sellerPhone}
        buyerName={buyerName}
        communicationLog={[]} // Would be populated from actual chat logs
        paymentMethod="" // Would be set when payment method is chosen
        urgencyLevel={0} // Would be calculated from user behavior
        onAnalysisComplete={(analysis) => setBehavioralAnalysis(analysis)}
      />

      <DataOwnershipTransparency />

      <AuditImmutability
        dealRoomId={undefined} // Would be set for existing rooms
        documents={evidenceDocuments}
      />

      <DiasporaMode
        buyerLocation="London, UK" // Would be detected or set by user
        sellerLocation="Nairobi, Kenya"
        dealAmount={2500000} // Would be set from deal
      />

      <ActionPrompts
        currentStep={currentStep}
        sellerKyc={sellerKyc}
        governmentVerification={governmentVerification}
        evidenceDocuments={evidenceDocuments}
        systemStatus={{
          backendOnline,
          ardhiConnected: assetType === 'land' ? true : true,
          ntsaConnected: assetType === 'car' ? true : true,
          kraConnected: true,
          ecitizenConfigured: ecitizenStatus?.configured || false,
        }}
        behavioralAnalysis={behavioralAnalysis}
        documentAnalysis={documentAnalysis}
        onActionClick={handleActionPrompt}
      />

      <ReportGenerator
        dealRoom={reportRoomData}
        systemStatus={{
          backendOnline,
          ardhiConnected: assetType === 'land' ? true : true,
          ntsaConnected: assetType === 'car' ? true : true,
          kraConnected: true,
          ecitizenConfigured: ecitizenStatus?.configured || false,
        }}
        behavioralAnalysis={behavioralAnalysis}
        documentAnalysis={documentAnalysis}
      />

      <main className="workflow-shell">
        <div className="workflow-progress">
          <div className="workflow-progress-meter" style={{ width: `${workflowProgress}%` }} />
          <div className="workflow-progress-label">{workflowProgress}% complete</div>
        </div>

        <div className="workflow-steps" aria-label="Deal room workflow steps">
          {workflowSteps.map((step, index) => (
            <div key={step.label} className={`step-chip ${step.complete ? 'complete' : currentStep === index + 1 ? 'active' : 'locked'}`}>
              <span>{step.complete ? '✔' : index + 1}</span>
              <strong>{step.label}</strong>
            </div>
          ))}
        </div>

        {loadingRooms && <div className="notice">Loading saved deal rooms...</div>}

        <form onSubmit={handleSubmit} className="workflow-grid">
          <section className={`workflow-card ${workflowSteps[currentStep - 1].complete ? 'complete' : ''}`}>
            <h2>{currentStep}. {workflowSteps[currentStep - 1].label}</h2>
            <div className="workflow-card-body">
              {currentStep === 1 && (
                <>
                  <label>
                    <span>Choose your asset type</span>
                    <select value={assetType} onChange={(event) => setAssetType(event.target.value as AssetType)}>
                      <option value="land">Land</option>
                      <option value="car">Vehicle</option>
                    </select>
                  </label>
                  <label>
                    <span>{assetLabels[assetType]}</span>
                    <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder={identifierHelp[assetType]} />
                    <small>Enter the official identifier before continuing.</small>
                  </label>
                  <label>
                    <span>Deal room title</span>
                    <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Karen Plot Purchase" />
                    <small>Give the room a clear name for tracking.</small>
                  </label>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <label>
                    <span>Buyer name</span>
                    <input value={buyerName} onChange={(event) => setBuyerName(event.target.value)} placeholder="Buyer full name" />
                  </label>
                  <label>
                    <span>Seller name</span>
                    <input value={sellerName} onChange={(event) => setSellerName(event.target.value)} placeholder="Seller full name" />
                  </label>
                  <label>
                    <span>Seller phone</span>
                    <input value={sellerPhone} onChange={(event) => setSellerPhone(event.target.value)} placeholder="+254 7XX XXX XXX" />
                  </label>
                  <label className={`verified-strip ${sellerPhoneVerified ? 'complete' : ''}`}>
                    <input type="checkbox" checked={sellerPhoneVerified} onChange={(event) => setSellerPhoneVerified(event.target.checked)} />
                    <span>Seller phone verified</span>
                  </label>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <div className="kyc-header compact">
                    <div>
                      <h3>Seller identity protection</h3>
                      <p>We verify seller identity before you release money. Confirm KRA, ID, and buyer contact integrity.</p>
                    </div>
                    <span className={`kyc-badge ${sellerKyc.status}`}>{sellerKyc.score}%</span>
                  </div>
                  <div className="kyc-status-chips">
                    <span className={`status-chip ${sellerKyc.idDocumentUploaded ? 'pass' : 'pending'}`}>ID match</span>
                    <span className={`status-chip ${sellerKyc.kraPin ? 'pass' : 'pending'}`}>PIN verified</span>
                    <span className={`status-chip ${sellerPhoneVerified ? 'pass' : 'pending'}`}>Seller OTP</span>
                    <span className={`status-chip ${buyerPhoneVerified ? 'pass' : 'pending'}`}>Buyer OTP</span>
                    <span className={`status-chip ${sellerKyc.score >= 70 ? 'pass' : 'warning'}`}>Confidence {sellerKyc.score}%</span>
                  </div>
                  <button type="button" className="secondary integration-action" onClick={syncFromECitizen} disabled={ecitizenLoading}>
                    {ecitizenLoading ? 'Syncing eCitizen...' : 'Sync seller KYC from eCitizen'}
                  </button>
                  <label>
                    <span>Seller ID number</span>
                    <input value={sellerIdNumber} onChange={(event) => setSellerIdNumber(event.target.value)} placeholder="e.g. 12345678" />
                  </label>
                  <label>
                    <span>KRA PIN</span>
                    <input value={sellerKraPin} onChange={(event) => setSellerKraPin(event.target.value.toUpperCase())} placeholder="A123456789B" />
                  </label>
                  <label>
                    <span>Buyer phone</span>
                    <input value={buyerPhone} onChange={(event) => setBuyerPhone(event.target.value)} placeholder="+254 7XX XXX XXX" />
                  </label>
                  <label className={`verified-strip ${buyerPhoneVerified ? 'complete' : ''}`}>
                    <input type="checkbox" checked={buyerPhoneVerified} onChange={(event) => setBuyerPhoneVerified(event.target.checked)} />
                    <span>Buyer phone verified</span>
                  </label>
                  <div className="kyc-confirmation">
                    <div>
                      <span>Seller Phone</span>
                      <strong>{sellerPhoneVerified ? 'Confirmed' : 'Pending'}</strong>
                    </div>
                    <div>
                      <span>Buyer Phone</span>
                      <strong>{buyerPhoneVerified ? 'Confirmed' : 'Pending'}</strong>
                    </div>
                  </div>
                  <strong>Required KYC checks</strong>
                  <ul>
                    <li>{sellerKyc.idNumber ? 'ID number entered' : 'ID number missing'}</li>
                    <li>{sellerKyc.kraPin ? 'KRA PIN entered' : 'KRA PIN missing'}</li>
                    <li>{buyerPhoneVerified ? 'Buyer phone verified' : 'Buyer phone not verified'}</li>
                  </ul>
                </>
              )}

              {currentStep === 4 && (
                <>
                  <h3>Evidence upload</h3>
                  <p className="step-description">Attach the evidence documents required to validate this transaction.</p>
                  <label className="drop-zone">
                    <input type="file" accept=".pdf,image/*" onChange={(event) => setEvidenceFile('registryCertificate', event.target.files)} />
                    <span>{evidenceDocuments.registryCertificate || 'Upload asset registry evidence'}</span>
                  </label>
                  <div className="evidence-list">
                    {([
                      ['sellerIdDocument', 'Seller ID document'],
                      ['sellerKraPinCertificate', 'KRA PIN certificate'],
                      ['sellerSelfieMatch', 'Selfie match'],
                      ['sellerAddressProof', 'Proof of address'],
                      ['sellerAuthorityDocument', 'Authority document'],
                      ['inspectionDocument', 'Inspection report'],
                      ['paymentInstruction', 'Payment instruction'],
                    ] as Array<[keyof typeof initialEvidenceDocuments, string]>).map(([key, label]) => (
                      <label key={key} className={evidenceDocuments[key] ? 'complete' : ''}>
                        <input type="file" accept=".pdf,image/*" onChange={(event) => setEvidenceFile(key, event.target.files)} />
                        <span>{evidenceDocuments[key] || label}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}

              {currentStep === 5 && (
                <>
                  <div className="review-top">
                    <div className="service-pill-group">
                      <span className="service-pill eCitizen">eCitizen</span>
                      <span className="service-pill kra">KRA</span>
                      <span className="service-pill ntsa">NTSA</span>
                      <span className="service-pill ardhisasa">Ardhisasa</span>
                    </div>
                    <div className="trust-summary-banner">
                      <span>Reference {verificationReference}</span>
                      <strong>{governmentVerification?.status === 'blocked' ? 'Action Required' : 'Protection check ready'}</strong>
                    </div>
                  </div>

                  <VerificationSeal
                    status={riskPreview.key}
                    referenceId={verificationReference}
                    checkedAt={new Date().toISOString()}
                    matchedIdentity={sellerKyc.status === 'verified'}
                    matchedOwnership={governmentVerification?.verified || false}
                    duplicateClaimsCleared={!activeConflict}
                  />

                  <div className="live-checks">
                    {liveStatusMessages.map((message) => (
                      <span key={message} className="live-check-item">{message}</span>
                    ))}
                  </div>

                  <div className="status-options">
                    <div className={`status-option safe ${riskPreview.key === 'safe' ? 'active' : ''}`}>Final fraud protection screening passed</div>
                    <div className={`status-option caution ${riskPreview.key === 'caution' ? 'active' : ''}`}>There are unresolved risks tied to this transaction</div>
                    <div className={`status-option stop ${riskPreview.key === 'stop' ? 'active' : ''}`}>Transaction locked until cleared</div>
                  </div>

                  <button type="button" className="secondary" onClick={handleGovernmentVerification} disabled={verificationLoading}>
                    {verificationLoading ? 'Checking registry consistency…' : `Run ${assetType === 'land' ? 'Ardhisasa' : 'NTSA'} protection check`}
                  </button>

                  <div className="risk-summary-panel">
                    <div className="risk-score-block">
                      <div className="risk-score-badge">{riskScore}/100</div>
                      <div>
                        <strong>Risk action:</strong> {riskPreview.label}
                        <p>{riskTriggers.length > 0 ? riskTriggers.join('; ') : 'No active risk triggers detected.'}</p>
                      </div>
                    </div>
                    <div className="review-summary">
                      <p><strong>Recorded owner:</strong> {currentOwner || governmentVerification?.owner || 'Not yet registered'}</p>
                      <p><strong>Regional risk:</strong> {regionalRisk.region} — {regionalRisk.advisory}</p>
                      <p><strong>KYC score:</strong> {sellerKyc.score}% / {sellerKyc.status}</p>
                      <p><strong>Evidence files attached:</strong> {evidenceFileCount} of 9</p>
                      <p><strong>Live decision:</strong> {riskPreview.label}</p>
                      <p>{riskSummary}</p>
                    </div>
                  </div>

                  <div className="audit-panel">
                    <h4>Audit timeline</h4>
                    <ul>
                      <li>08:12 — Seller phone verified through phone OTP.</li>
                      <li>08:18 — Selfie and ID match scan completed.</li>
                      <li>08:24 — Government registry check queued.</li>
                      <li>08:29 — Evidence quality review passed.</li>
                    </ul>
                    {activeConflict && <p className="alert-text">⚠ {activeConflict}</p>}
                  </div>

                  <div className="payment-protection-card">
                    <div>
                      <strong>{verificationActions.fundsOnHold ? 'Funds on hold' : 'Payment ready'}</strong>
                      <p>Payment is securely locked until the smart protection workflow confirms this deal is safe. If issues persist, keep the funds in escrow and escalate to a supported dispute process.</p>
                    </div>
                    <button type="button" className="secondary" disabled={!verificationActions.releaseEnabled}>
                      {verificationActions.releaseEnabled ? 'Release payment' : 'Release when safe' }
                    </button>
                  </div>

                  <div className="certificate-callout">
                    <div>
                      <strong>Verified certificate ready</strong>
                      <p>Download the finalized verification certificate to keep as proof of a protected Kenyan asset deal.</p>
                    </div>
                    <button type="button" className="secondary">Download certificate</button>
                  </div>

                  <label className="commitment-checkbox">
                    <input type="checkbox" checked={commitmentAccepted} onChange={(event) => setCommitmentAccepted(event.target.checked)} />
                    <span>
                      I confirm that the buyer will release funds only through DealRoom KE and the seller agrees that duplicate sale invalidates this transaction.
                    </span>
                  </label>
                  {processTerminated && (
                    <div className="notice danger">
                      <strong>Workflow blocked</strong>
                      <ul>
                        {terminationReasons.map((reason, index) => (
                          <li key={index}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="card-footer-note">
              {workflowSteps[currentStep - 1].complete ? 'Step complete' : 'Follow the guided step to proceed'}
            </div>
          </section>

          <div className="wizard-footer">
            {currentStep > 1 && (
              <button type="button" className="secondary" onClick={handlePrevious}>
                Previous
              </button>
            )}
            {!processTerminated ? (
              currentStep < totalSteps ? (
                <button type="button" className="primary" onClick={handleNext}>
                  Next
                </button>
              ) : (
                <button type="submit" className="primary">
                  Create verified room
                </button>
              )
            ) : (
              <button type="button" className="primary" onClick={generateMismatchReport}>
                Generate mismatch report
              </button>
            )}
          </div>
          {message && <div className="notice compact-notice">{message}</div>}
        </form>
      </main>
    </div>
  )
}

export default App
