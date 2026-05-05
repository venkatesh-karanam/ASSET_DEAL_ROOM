import { useEffect, useMemo, useState } from 'react'
import type { AssetType, DealRoom, GovernmentVerification, SellerKyc } from './types'

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

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(rooms))
  }, [rooms])

  useEffect(() => {
    let active = true

    async function loadRoomsFromBackend() {
      try {
        const token = await loginDemoCitizen()
        const response = await fetch(`${apiBaseUrl}/deal-rooms`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) throw new Error('Failed to load deal rooms')
        const data = (await response.json()) as BackendDealRoom[]
        if (!active) return
        setBackendToken(token)
        setBackendOnline(true)
        setRooms(data.map(mapBackendRoom))
      } catch {
        if (!active) return
        setBackendOnline(false)
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
  }, [evidenceDocuments, sellerIdNumber, sellerKraPin, sellerPhoneVerified])

  const evidenceFileCount = useMemo(
    () => Object.values(evidenceDocuments).filter(Boolean).length,
    [evidenceDocuments],
  )

  const riskPreview = useMemo(() => {
    const sellerMismatch = Boolean(currentOwner && currentOwner !== sellerName.trim())

    if (
      activeConflict ||
      sellerMismatch ||
      governmentVerification?.status === 'blocked' ||
      !governmentVerification?.verified ||
      sellerKyc.status === 'incomplete'
    ) {
      return { key: 'stop', label: 'Do not pay yet' }
    }

    if (governmentVerification.status !== 'clear' || sellerKyc.status !== 'verified' || evidenceFileCount < 9) {
      return { key: 'caution', label: 'Proceed with caution' }
    }

    return { key: 'safe', label: 'Safe to proceed' }
  }, [activeConflict, currentOwner, evidenceFileCount, governmentVerification, sellerKyc.status, sellerName])

  const workflowSteps = [
    { label: 'Asset Setup', complete: Boolean(identifier.trim() && title.trim()) },
    { label: 'Parties', complete: Boolean(buyerName.trim() && sellerName.trim() && sellerPhone.trim() && sellerPhoneVerified) },
    { label: 'Seller KYC', complete: sellerKyc.status === 'verified' },
    { label: 'Upload Evidence', complete: evidenceFileCount === 9 },
    { label: 'Risk Status & Review', complete: riskPreview.key === 'safe' },
  ]

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

    if (sellerKyc.status !== 'verified') {
      setMessage('Seller KYC is incomplete. Verify ID number, KRA PIN, phone, selfie match, address proof, and authority documents before creating the deal room.')
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
          <h1>A Kenyan pre-payment verification room for land & vehicles</h1>
          <p>Create one deal room per asset per person, upload evidence, and flag duplicate ownership or registry conflicts before payment.</p>
        </div>
      </header>

      <main className="workflow-shell">
        <div className="workflow-steps" aria-label="Deal room workflow steps">
          {workflowSteps.map((step, index) => (
            <div key={step.label} className={`step-chip ${step.complete ? 'complete' : ''}`}>
              <span>{index + 1}</span>
              <strong>{step.label}</strong>
            </div>
          ))}
        </div>

        {loadingRooms && <div className="notice">Loading saved deal rooms...</div>}

        <form onSubmit={handleSubmit} className="workflow-grid">
          <section className={`workflow-card ${workflowSteps[0].complete ? 'complete' : ''}`}>
            <h2>1. Asset Setup</h2>
            <div className="workflow-card-body">
              <label>
                <span>Asset type</span>
                <select value={assetType} onChange={(event) => setAssetType(event.target.value as AssetType)}>
                  <option value="land">Land</option>
                  <option value="car">Vehicle</option>
                </select>
              </label>
              <label>
                <span>{assetLabels[assetType]}</span>
                <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="e.g. LR.12345/678" />
                <small>{identifierHelp[assetType]}</small>
              </label>
              <label>
                <span>Deal room title</span>
                <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. LR.12345 sale" />
              </label>
            </div>
            <div className="card-footer-note">{workflowSteps[0].complete ? 'Asset ready' : 'Complete asset details'}</div>
          </section>

          <section className={`workflow-card ${workflowSteps[1].complete ? 'complete' : ''}`}>
            <h2>2. Parties</h2>
            <div className="workflow-card-body">
              <label>
                <span>Buyer</span>
                <input value={buyerName} onChange={(event) => setBuyerName(event.target.value)} placeholder="Buyer name" />
              </label>
              <label>
                <span>Seller</span>
                <input value={sellerName} onChange={(event) => setSellerName(event.target.value)} placeholder="Seller name" />
              </label>
              <label>
                <span>Seller phone</span>
                <input value={sellerPhone} onChange={(event) => setSellerPhone(event.target.value)} placeholder="Seller phone" />
              </label>
              <label className={`verified-strip ${sellerPhoneVerified ? 'complete' : ''}`}>
                <input type="checkbox" checked={sellerPhoneVerified} onChange={(event) => setSellerPhoneVerified(event.target.checked)} />
                <span>Seller phone verified by OTP or call-back</span>
              </label>
            </div>
            <div className="card-footer-note">{workflowSteps[1].complete ? 'Parties confirmed' : 'Verify seller phone'}</div>
          </section>

          <section className={`workflow-card ${workflowSteps[2].complete ? 'complete' : ''}`}>
            <h2>3. Seller KYC</h2>
            <div className="workflow-card-body">
              <div className="kyc-header compact">
                <div>
                  <h3>Strict seller KYC</h3>
                  <p>Seller identity must be fully verified.</p>
                </div>
                <span className={`kyc-badge ${sellerKyc.status}`}>{sellerKyc.score}%</span>
              </div>
              <label>
                <span>Seller ID number</span>
                <input value={sellerIdNumber} onChange={(event) => setSellerIdNumber(event.target.value)} placeholder="e.g. 12345678" />
              </label>
              <label>
                <span>KRA PIN</span>
                <input value={sellerKraPin} onChange={(event) => setSellerKraPin(event.target.value.toUpperCase())} placeholder="A123456789B" />
              </label>
              <div className="kyc-confirmation">
                <span>Phone Verified</span>
                <strong>{sellerPhoneVerified ? 'Confirmed' : 'Pending'}</strong>
              </div>
            </div>
            <div className="card-footer-note">{sellerKyc.status === 'verified' ? 'KYC verified' : `${sellerKyc.score}% complete`}</div>
          </section>

          <section className={`workflow-card ${workflowSteps[3].complete ? 'complete' : ''}`}>
            <h2>4. Upload Evidence</h2>
            <div className="workflow-card-body">
              <label className="drop-zone">
                <input type="file" accept=".pdf,image/*" onChange={(event) => setEvidenceFile('registryCertificate', event.target.files)} />
                <span>{evidenceDocuments.registryCertificate || 'Drop files here or click to upload.'}</span>
                <small>{evidenceFileCount} of 9 evidence files attached.</small>
              </label>
              <div className="evidence-list">
                {[
                  ['sellerIdDocument', 'Seller ID document'],
                  ['sellerKraPinCertificate', 'KRA PIN certificate'],
                  ['sellerSelfieMatch', 'Selfie match'],
                  ['sellerAddressProof', 'Proof of address'],
                  ['sellerAuthorityDocument', 'Authority document'],
                  ['inspectionDocument', 'Inspection report'],
                ].map(([key, label]) => (
                  <label key={key} className={evidenceDocuments[key as keyof typeof initialEvidenceDocuments] ? 'complete' : ''}>
                    <input type="file" accept=".pdf,image/*" onChange={(event) => setEvidenceFile(key as keyof typeof initialEvidenceDocuments, event.target.files)} />
                    <span>{evidenceDocuments[key as keyof typeof initialEvidenceDocuments] || label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="card-footer-note">{workflowSteps[3].complete ? 'Evidence package complete' : `${evidenceFileCount} of 9 attached`}</div>
          </section>

          <section className={`workflow-card review-card ${workflowSteps[4].complete ? 'complete' : ''}`}>
            <h2>5. Risk Status & Review</h2>
            <div className="workflow-card-body">
              <div className="status-options">
                <div className={`status-option safe ${riskPreview.key === 'safe' ? 'active' : ''}`}>Safe to proceed</div>
                <div className={`status-option caution ${riskPreview.key === 'caution' ? 'active' : ''}`}>Proceed with caution</div>
                <div className={`status-option stop ${riskPreview.key === 'stop' ? 'active' : ''}`}>Do not pay yet</div>
              </div>
              <button type="button" className="secondary" onClick={handleGovernmentVerification} disabled={verificationLoading}>
                {verificationLoading ? 'Checking registry...' : `Verify with ${assetType === 'land' ? 'Ardhisasa' : 'NTSA'}`}
              </button>
              <div className="review-summary">
                <p><strong>Recorded owner:</strong> {currentOwner || governmentVerification?.owner || 'Not yet registered'}</p>
                <p><strong>Audit trail review:</strong> Government-style checks and seller KYC required.</p>
                <p><strong>KYC score:</strong> {sellerKyc.score}% / {sellerKyc.status}</p>
                <p><strong>Live decision:</strong> {riskPreview.label}</p>
                <p><strong>Evidence files:</strong> {evidenceFileCount} of 9 attached</p>
                <p>{riskSummary}</p>
              </div>
              {message && <div className="notice compact-notice">{message}</div>}
            </div>
            <button type="submit" className="primary">Create verified room</button>
          </section>
        </form>
      </main>
    </div>
  )
}

export default App
