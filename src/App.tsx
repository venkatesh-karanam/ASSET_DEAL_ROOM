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

      <main>
        <section className="panel">
          <div className="section-heading">
            <div>
              <h2>Create a new asset deal room</h2>
              <p>Capture the asset, parties, registry check, and evidence package in one reviewable workspace.</p>
            </div>
          </div>
          {loadingRooms && <div className="notice">Loading saved deal rooms...</div>}
          <form onSubmit={handleSubmit} className="form-grid">
            <label>
              <span>Asset type</span>
              <select value={assetType} onChange={(event) => setAssetType(event.target.value as AssetType)}>
                <option value="land">Land</option>
                <option value="car">Car</option>
              </select>
            </label>

            <label>
              <span>{assetLabels[assetType]}</span>
              <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="e.g. LR.12345/678" />
              <small>{identifierHelp[assetType]}</small>
            </label>

            <label>
              <span>Deal room title</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Optional custom title" />
              <small>Leave blank to auto-generate a title from the asset identifier.</small>
            </label>

            <label>
              <span>Buyer name</span>
              <input value={buyerName} onChange={(event) => setBuyerName(event.target.value)} placeholder="Buyer name" />
            </label>

            <label>
              <span>Seller name</span>
              <input value={sellerName} onChange={(event) => setSellerName(event.target.value)} placeholder="Seller name" />
            </label>

            <label>
              <span>Seller phone</span>
              <input value={sellerPhone} onChange={(event) => setSellerPhone(event.target.value)} placeholder="Seller phone" />
              <small>Use a reachable phone number for buyer, agency, or escrow follow-up.</small>
            </label>

            <div className="checklist-card kyc-card">
              <div className="kyc-header">
                <div>
                  <h3>Strict seller KYC</h3>
                  <p>Seller identity must be fully verified before this deal room can be created or marked safe.</p>
                </div>
                <span className={`kyc-badge ${sellerKyc.status}`}>{sellerKyc.score}% {sellerKyc.status}</span>
              </div>
              <label>
                <span>Seller national ID number</span>
                <input value={sellerIdNumber} onChange={(event) => setSellerIdNumber(event.target.value)} placeholder="e.g. 12345678" />
                <small>Required: 6 to 10 digits, matching the seller identity document.</small>
              </label>
              <label>
                <span>Seller KRA PIN</span>
                <input value={sellerKraPin} onChange={(event) => setSellerKraPin(event.target.value.toUpperCase())} placeholder="e.g. A123456789B" />
                <small>Required format: A or P, nine digits, then a final letter.</small>
              </label>
              <label className="checkbox-row">
                <input type="checkbox" checked={sellerPhoneVerified} onChange={(event) => setSellerPhoneVerified(event.target.checked)} />
                Seller phone number confirmed by OTP or call-back
              </label>
            </div>

            <div className="checklist-card">
              <h3>Mock government registry check</h3>
              <p>{statusDescriptions[assetType]}</p>
              <button type="button" className="secondary" onClick={handleGovernmentVerification} disabled={verificationLoading}>
                {verificationLoading ? 'Checking registry...' : `Verify with ${assetType === 'land' ? 'Ardhisasa' : 'NTSA'} mock API`}
              </button>
              {governmentVerification && (
                <div className={`verification-result ${governmentVerification.status}`}>
                  <strong>{governmentVerification.registry} status: {governmentVerification.status.toUpperCase()}</strong>
                  <p>{governmentVerification.message}</p>
                  <p><strong>Reference:</strong> {governmentVerification.reference}</p>
                  <p><strong>Registry owner:</strong> {governmentVerification.owner}</p>
                  {governmentVerification.caveats.length > 0 && <p><strong>Caveats:</strong> {governmentVerification.caveats.join(', ')}</p>}
                  {governmentVerification.encumbrances.length > 0 && <p><strong>Encumbrances:</strong> {governmentVerification.encumbrances.join(', ')}</p>}
                </div>
              )}
            </div>

            <div className="checklist-card">
              <h3>Evidence documents</h3>
              <label>
                <span>{assetType === 'land' ? 'Search Certificate' : 'NTSA/eCitizen Vehicle Record'}</span>
                <input type="file" accept=".pdf,image/*" onChange={(event) => setEvidenceFile('registryCertificate', event.target.files)} />
                {evidenceDocuments.registryCertificate && <span className="file-name">{evidenceDocuments.registryCertificate}</span>}
              </label>
              <label>
                <span>Seller identity document</span>
                <input type="file" accept=".pdf,image/*" onChange={(event) => setEvidenceFile('sellerIdDocument', event.target.files)} />
                {evidenceDocuments.sellerIdDocument && <span className="file-name">{evidenceDocuments.sellerIdDocument}</span>}
              </label>
              <label>
                <span>KRA PIN certificate</span>
                <input type="file" accept=".pdf,image/*" onChange={(event) => setEvidenceFile('sellerKraPinCertificate', event.target.files)} />
                {evidenceDocuments.sellerKraPinCertificate && <span className="file-name">{evidenceDocuments.sellerKraPinCertificate}</span>}
              </label>
              <label>
                <span>Selfie match or live photo proof</span>
                <input type="file" accept=".pdf,image/*" onChange={(event) => setEvidenceFile('sellerSelfieMatch', event.target.files)} />
                {evidenceDocuments.sellerSelfieMatch && <span className="file-name">{evidenceDocuments.sellerSelfieMatch}</span>}
              </label>
              <label>
                <span>Proof of address or residency</span>
                <input type="file" accept=".pdf,image/*" onChange={(event) => setEvidenceFile('sellerAddressProof', event.target.files)} />
                {evidenceDocuments.sellerAddressProof && <span className="file-name">{evidenceDocuments.sellerAddressProof}</span>}
              </label>
              <label>
                <span>Seller authority document</span>
                <input type="file" accept=".pdf,image/*" onChange={(event) => setEvidenceFile('sellerAuthorityDocument', event.target.files)} />
                {evidenceDocuments.sellerAuthorityDocument && <span className="file-name">{evidenceDocuments.sellerAuthorityDocument}</span>}
              </label>
              <label>
                <span>Supporting document bundle</span>
                <input type="file" accept=".pdf,image/*" onChange={(event) => setEvidenceFile('supportingDocument', event.target.files)} />
                {evidenceDocuments.supportingDocument && <span className="file-name">{evidenceDocuments.supportingDocument}</span>}
              </label>
              <label>
                <span>Inspection or condition report</span>
                <input type="file" accept=".pdf,image/*" onChange={(event) => setEvidenceFile('inspectionDocument', event.target.files)} />
                {evidenceDocuments.inspectionDocument && <span className="file-name">{evidenceDocuments.inspectionDocument}</span>}
              </label>
              <label>
                <span>Payment milestone instruction</span>
                <input type="file" accept=".pdf,image/*" onChange={(event) => setEvidenceFile('paymentInstruction', event.target.files)} />
                {evidenceDocuments.paymentInstruction && <span className="file-name">{evidenceDocuments.paymentInstruction}</span>}
              </label>
            </div>

            <button type="submit" className="primary">Create deal room</button>
          </form>
          {message && <div className="notice">{message}</div>}
          <div className="status-card">
            <strong>Conflict check</strong>
            <p>{riskSummary}</p>
            <p><strong>Recorded current owner:</strong> {currentOwner || 'Not yet registered'}</p>
            {previousOwner && <p><strong>Previous owner:</strong> {previousOwner}</p>}
            {activeConflict && <p className="danger">{activeConflict}</p>}
          </div>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <h2>Existing deal rooms</h2>
              <p>Review active assets, registry status, evidence completeness, and transfer progress.</p>
            </div>
          </div>
          {rooms.length === 0 ? (
            <p>No rooms created yet. Create the first land or car deal room.</p>
          ) : (
            <div className="room-grid">
              {rooms.map((room) => {
                const risk = getRiskStatus(room)
                const assetKey = `${room.assetType}-${room.identifier.toLowerCase()}`
                const ownership = assetOwners[assetKey]
                return (
                  <article key={room.id} className="room-card">
                    <div className="room-header">
                      <span>{room.assetType.toUpperCase()}</span>
                      <span className="pill" style={{ background: risk.color }}>
                        {risk.status}
                      </span>
                    </div>
                    <h3>{room.title}</h3>
                    <dl className="room-meta">
                      <div>
                        <dt>Identifier</dt>
                        <dd>{room.identifier}</dd>
                      </div>
                      <div>
                        <dt>Buyer</dt>
                        <dd>{room.buyerName}</dd>
                      </div>
                      <div>
                        <dt>Seller</dt>
                        <dd>{room.sellerName}</dd>
                      </div>
                      <div>
                        <dt>Created</dt>
                        <dd>{new Date(room.createdAt).toLocaleString()}</dd>
                      </div>
                      <div>
                        <dt>Transfer status</dt>
                        <dd>{room.completed ? 'Completed' : 'Pending'}</dd>
                      </div>
                      <div>
                        <dt>Registry check</dt>
                        <dd>{room.governmentVerification ? `${room.governmentVerification.registry} / ${room.governmentVerification.status}` : 'Not checked'}</dd>
                      </div>
                      <div>
                        <dt>Evidence files</dt>
                        <dd>{room.evidenceDocuments ? Object.values(room.evidenceDocuments).filter(Boolean).length : 0} of 9 attached</dd>
                      </div>
                      <div>
                        <dt>Seller KYC</dt>
                        <dd>{room.sellerKyc ? `${room.sellerKyc.score}% / ${room.sellerKyc.status}` : 'Not verified'}</dd>
                      </div>
                    </dl>
                    {room.completed && ownership && (
                      <>
                        <p><strong>Current owner:</strong> {ownership.currentOwner}</p>
                        {ownership.previousOwner && <p><strong>Previous owner:</strong> {ownership.previousOwner}</p>}
                      </>
                    )}
                    {room.conflict ? <p className="danger">{room.conflict}</p> : <p className="fine">No duplicate room found</p>}
                    {room.fraud ? <p className="danger">Fraud flag: Seller not current owner</p> : null}
                    {!room.completed && <button onClick={() => markCompleted(room.id)}>Mark as Completed</button>}
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
