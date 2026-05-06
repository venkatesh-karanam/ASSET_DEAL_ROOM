import { useEffect, useMemo, useState } from 'react'
import type { AssetType, DealRoom } from './types'

const storageKey = 'dealroom-ke-rooms'
const initialChecks = {
  ardhiSearch: false,
  ntsaRecord: false,
  sellerId: false,
  sellerAuthority: false,
}

const assetLabels = {
  land: 'Land title number',
  car: 'Vehicle registration number',
}

function getInitialRooms(): DealRoom[] {
  try {
    const raw = window.localStorage.getItem(storageKey)
    return raw ? (JSON.parse(raw) as DealRoom[]) : []
  } catch {
    return []
  }
}

function getRiskStatus(room: DealRoom): { status: string; color: string } {
  if (
    room.conflict ||
    (!room.officialChecks.ardhiSearch && room.assetType === 'land') ||
    (!room.officialChecks.ntsaRecord && room.assetType === 'car')
  ) {
    return { status: 'Do not pay yet', color: 'var(--danger)' }
  }

  if (!room.identityProof || !room.authorityProof || !room.supportingDocs || !room.inspectionNotes || !room.paymentMilestone) {
    return { status: 'Proceed with caution', color: 'var(--warning)' }
  }

  return { status: 'Safe to proceed', color: 'var(--success)' }
}

function formatField(value: boolean) {
  return value ? 'Yes' : 'No'
}

function App() {
  const [rooms, setRooms] = useState<DealRoom[]>(getInitialRooms)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [assetType, setAssetType] = useState<AssetType>('land')
  const [identifier, setIdentifier] = useState('')
  const [title, setTitle] = useState('')
  const [buyerName, setBuyerName] = useState('')
  const [sellerName, setSellerName] = useState('')
  const [sellerPhone, setSellerPhone] = useState('')
  const [checked, setChecked] = useState(initialChecks)
  const [identityProof, setIdentityProof] = useState(false)
  const [authorityProof, setAuthorityProof] = useState(false)
  const [supportingDocs, setSupportingDocs] = useState(false)
  const [inspectionNotes, setInspectionNotes] = useState(false)
  const [paymentMilestone, setPaymentMilestone] = useState(false)
  const [message, setMessage] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(rooms))
  }, [rooms])

  useEffect(() => {
    const updateFromHash = () => {
      const hash = window.location.hash.replace('#', '')
      setSelectedRoomId(hash.startsWith('room:') ? hash.replace('room:', '') : null)
    }

    updateFromHash()
    window.addEventListener('hashchange', updateFromHash)
    return () => window.removeEventListener('hashchange', updateFromHash)
  }, [])

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId) ?? null,
    [rooms, selectedRoomId],
  )

  const activeConflict = useMemo(() => {
    const existing = rooms.find(
      (room) => room.assetType === assetType && room.identifier.trim().toLowerCase() === identifier.trim().toLowerCase(),
    )
    return existing
      ? `Active room created on ${new Date(existing.createdAt).toLocaleString()} for ${existing.assetType === 'land' ? 'land' : 'car'}.`
      : undefined
  }, [assetType, identifier, rooms])

  const riskSummary = useMemo(() => {
    if (!identifier || !buyerName || !sellerName) return 'Complete the form to see risk status.'
    const conflict = activeConflict ? 'Conflict detected: duplicate asset room exists.' : ''
    return conflict || 'No obvious conflict detected yet.'
  }, [activeConflict, buyerName, identifier, sellerName])

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!identifier.trim()
      case 2:
        return !!buyerName.trim() && !!sellerName.trim() && !!sellerPhone.trim()
      case 3:
        return true // Official checks are optional
      case 4:
        return true // Evidence checklist is optional
      case 5:
        return true // Review step
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    } else {
      setMessage('Please fill in all required fields for this step.')
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const resetForm = () => {
    setAssetType('land')
    setIdentifier('')
    setTitle('')
    setBuyerName('')
    setSellerName('')
    setSellerPhone('')
    setChecked(initialChecks)
    setIdentityProof(false)
    setAuthorityProof(false)
    setSupportingDocs(false)
    setInspectionNotes(false)
    setPaymentMilestone(false)
    setMessage('')
    setCurrentStep(1)
  }

  const getRoomLink = (room: DealRoom) => `${window.location.origin}/#room:${room.id}`

  const downloadRoomSummary = (room: DealRoom) => {
    const summary = [
      `Deal room: ${room.title}`,
      `Asset type: ${room.assetType}`,
      `Identifier: ${room.identifier}`,
      `Buyer: ${room.buyerName}`,
      `Seller: ${room.sellerName}`,
      `Seller phone: ${room.sellerPhone}`,
      `Created: ${new Date(room.createdAt).toLocaleString()}`,
      `Risk status: ${getRiskStatus(room).status}`,
      `Conflict: ${room.conflict ?? 'None'}`,
      '--- Official check evidence ---',
      `Ardhisasa search uploaded: ${formatField(room.officialChecks.ardhiSearch)}`,
      `NTSA record uploaded: ${formatField(room.officialChecks.ntsaRecord)}`,
      `Seller identity proof: ${formatField(room.officialChecks.sellerId)}`,
      `Seller authority proof: ${formatField(room.officialChecks.sellerAuthority)}`,
      '--- Evidence checklist ---',
      `ID/selfie match: ${formatField(room.identityProof)}`,
      `Seller authority docs: ${formatField(room.authorityProof)}`,
      `Supporting docs: ${formatField(room.supportingDocs)}`,
      `Inspection notes: ${formatField(room.inspectionNotes)}`,
      `Payment milestone: ${formatField(room.paymentMilestone)}`,
    ].join('\n')

    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${room.title.replace(/\W+/g, '_')}_summary.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!identifier.trim() || !buyerName.trim() || !sellerName.trim() || !sellerPhone.trim()) {
      setMessage('Please fill in all required fields.')
      return
    }

    const normalized = identifier.trim().toUpperCase()
    const conflictRoom = rooms.find(
      (room) => room.assetType === assetType && room.identifier.trim().toUpperCase() === normalized,
    )

    const newRoom: DealRoom = {
      id: crypto.randomUUID(),
      assetType,
      identifier: normalized,
      title: title.trim() || `${assetType === 'land' ? 'Title' : 'Reg No.'} ${normalized}`,
      createdAt: new Date().toISOString(),
      buyerName: buyerName.trim(),
      sellerName: sellerName.trim(),
      sellerPhone: sellerPhone.trim(),
      officialChecks: {
        ardhiSearch: assetType === 'land' ? checked.ardhiSearch : false,
        ntsaRecord: assetType === 'car' ? checked.ntsaRecord : false,
        sellerId: checked.sellerId,
        sellerAuthority: checked.sellerAuthority,
      },
      identityProof,
      authorityProof,
      supportingDocs,
      inspectionNotes,
      paymentMilestone,
      conflict: conflictRoom ? `Duplicate asset room exists (${conflictRoom.id})` : undefined,
      completed: false,
    }

    setRooms((prev) => [newRoom, ...prev])
    const roomLink = getRoomLink(newRoom)
    setMessage(`Deal room created for ${newRoom.title}. Invite link: ${roomLink}`)
    window.location.hash = `room:${newRoom.id}`
    resetForm()
  }

  const renderRoomList = () => (
    <section className="panel">
      <h2>Existing deal rooms</h2>
      {rooms.length === 0 ? (
        <p>No rooms created yet. Create the first land or car deal room.</p>
      ) : (
        <div className="room-grid">
          {rooms.map((room) => {
            const risk = getRiskStatus(room)
            return (
              <article key={room.id} className="room-card room-preview" onClick={() => (window.location.hash = `room:${room.id}`)}>
                <div className="room-header">
                  <span>{room.assetType.toUpperCase()}</span>
                  <span className="pill" style={{ background: risk.color }}>
                    {risk.status}
                  </span>
                </div>
                <h3>{room.title}</h3>
                <p><strong>Identifier:</strong> {room.identifier}</p>
                <p><strong>Buyer:</strong> {room.buyerName}</p>
                <p><strong>Seller:</strong> {room.sellerName}</p>
                <p><strong>Created:</strong> {new Date(room.createdAt).toLocaleString()}</p>
                {room.conflict ? <p className="danger">{room.conflict}</p> : <p className="fine">No duplicate room found</p>}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )

  const renderRoomDetails = (room: DealRoom) => {
    const risk = getRiskStatus(room)
    const otherMatches = rooms.filter(
      (candidate) => candidate.id !== room.id && candidate.assetType === room.assetType && candidate.identifier === room.identifier,
    )

    return (
      <section className="panel">
        <div className="detail-header">
          <button type="button" className="secondary" onClick={() => (window.location.hash = '')}>
            ← Back to rooms
          </button>
          <h2>{room.title}</h2>
        </div>

        <div className="room-card detail-card">
          <div className="room-header">
            <span>{room.assetType.toUpperCase()}</span>
            <span className="pill" style={{ background: risk.color }}>
              {risk.status}
            </span>
          </div>
          <p><strong>Identifier:</strong> {room.identifier}</p>
          <p><strong>Buyer:</strong> {room.buyerName}</p>
          <p><strong>Seller:</strong> {room.sellerName}</p>
          <p><strong>Seller phone:</strong> {room.sellerPhone}</p>
          <p><strong>Created:</strong> {new Date(room.createdAt).toLocaleString()}</p>
          <p><strong>Invite link:</strong> <code>{getRoomLink(room)}</code></p>
          <p><strong>Conflict detection:</strong> {room.conflict ?? 'No matching duplicate room found'}</p>
          {otherMatches.length > 0 && (
            <div className="conflict-panel">
              <strong>Other active rooms for this asset:</strong>
              <ul>
                {otherMatches.map((match) => (
                  <li key={match.id}>{match.title} — created {new Date(match.createdAt).toLocaleString()}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="room-card detail-card">
          <h3>Verification evidence</h3>
          <dl>
            <dt>Ardhisasa evidence</dt>
            <dd>{formatField(room.officialChecks.ardhiSearch)}</dd>
            <dt>NTSA evidence</dt>
            <dd>{formatField(room.officialChecks.ntsaRecord)}</dd>
            <dt>Seller identity proof</dt>
            <dd>{formatField(room.officialChecks.sellerId)}</dd>
            <dt>Seller authority proof</dt>
            <dd>{formatField(room.officialChecks.sellerAuthority)}</dd>
            <dt>ID/selfie match</dt>
            <dd>{formatField(room.identityProof)}</dd>
            <dt>Authority documents</dt>
            <dd>{formatField(room.authorityProof)}</dd>
            <dt>Supporting docs</dt>
            <dd>{formatField(room.supportingDocs)}</dd>
            <dt>Inspection notes</dt>
            <dd>{formatField(room.inspectionNotes)}</dd>
            <dt>Payment milestone</dt>
            <dd>{formatField(room.paymentMilestone)}</dd>
          </dl>
          <button type="button" className="primary" onClick={() => downloadRoomSummary(room)}>
            Download verification summary
          </button>
        </div>
      </section>
    )
  }

  return (
    <div className="page-shell">
      <header className="hero">
        <div>
          <span className="eyebrow">DealRoom KE</span>
          <h1>A Kenyan pre-payment verification room for land & vehicles</h1>
          <p>Create one deal room per asset, upload evidence, and flag duplicate asset conflicts before payment.</p>
        </div>
      </header>

      <main>
        {selectedRoom ? renderRoomDetails(selectedRoom) : (
          <>
            <section className="panel">
              <h2>Create a new asset deal room</h2>
              <div className="step-indicator">
                <div className="steps">
                  {[1, 2, 3, 4, 5].map(step => (
                    <div key={step} className={`step ${currentStep >= step ? 'active' : ''}`}>
                      {step}
                    </div>
                  ))}
                </div>
                <div className="step-labels">
                  <span>Asset Details</span>
                  <span>Parties</span>
                  <span>Official Checks</span>
                  <span>Evidence</span>
                  <span>Review</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="form-grid">
                {currentStep === 1 && (
                  <>
                    <label>
                      Asset type
                      <select value={assetType} onChange={(event) => setAssetType(event.target.value as AssetType)}>
                        <option value="land">Land</option>
                        <option value="car">Car</option>
                      </select>
                    </label>

                    <label>
                      {assetLabels[assetType]}
                      <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="e.g. LR.12345/678" required />
                    </label>

                    <label>
                      Deal room title
                      <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Optional custom title" />
                    </label>
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <label>
                      Buyer name
                      <input value={buyerName} onChange={(event) => setBuyerName(event.target.value)} placeholder="Buyer name" required />
                    </label>
                    <label>
                      Seller name
                      <input value={sellerName} onChange={(event) => setSellerName(event.target.value)} placeholder="Seller name" required />
                    </label>
                    <label>
                      Seller phone
                      <input value={sellerPhone} onChange={(event) => setSellerPhone(event.target.value)} placeholder="Seller phone" required />
                    </label>
                  </>
                )}

                {currentStep === 3 && (
                  <div className="checklist-card">
                    <h3>Official check workflow</h3>
                    {assetType === 'land' ? (
                      <label className="checkbox-row">
                        <input
                          type="checkbox"
                          checked={checked.ardhiSearch}
                          onChange={(event) => setChecked({ ...checked, ardhiSearch: event.target.checked })}
                        />
                        Upload Ardhisasa search evidence
                      </label>
                    ) : (
                      <label className="checkbox-row">
                        <input
                          type="checkbox"
                          checked={checked.ntsaRecord}
                          onChange={(event) => setChecked({ ...checked, ntsaRecord: event.target.checked })}
                        />
                        Upload NTSA/eCitizen record evidence
                      </label>
                    )}
                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={checked.sellerId}
                        onChange={(event) => setChecked({ ...checked, sellerId: event.target.checked })}
                      />
                      Seller identity proof uploaded
                    </label>
                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={checked.sellerAuthority}
                        onChange={(event) => setChecked({ ...checked, sellerAuthority: event.target.checked })}
                      />
                      Seller authority proof uploaded
                    </label>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="checklist-card">
                    <h3>Evidence checklist</h3>
                    <label className="checkbox-row">
                      <input type="checkbox" checked={identityProof} onChange={(event) => setIdentityProof(event.target.checked)} />
                      ID selfie match / identity proof collected
                    </label>
                    <label className="checkbox-row">
                      <input type="checkbox" checked={authorityProof} onChange={(event) => setAuthorityProof(event.target.checked)} />
                      Seller authority documents collected
                    </label>
                    <label className="checkbox-row">
                      <input type="checkbox" checked={supportingDocs} onChange={(event) => setSupportingDocs(event.target.checked)} />
                      Supporting documents uploaded
                    </label>
                    <label className="checkbox-row">
                      <input type="checkbox" checked={inspectionNotes} onChange={(event) => setInspectionNotes(event.target.checked)} />
                      Inspection or vehicle condition notes completed
                    </label>
                    <label className="checkbox-row">
                      <input type="checkbox" checked={paymentMilestone} onChange={(event) => setPaymentMilestone(event.target.checked)} />
                      Payment milestone and buyer instruction recorded
                    </label>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="review-section">
                    <h3>Review and Create Deal Room</h3>
                    <div className="review-item">
                      <strong>Asset:</strong> {assetType.toUpperCase()} - {identifier || 'Not specified'}
                    </div>
                    <div className="review-item">
                      <strong>Title:</strong> {title || `${assetType === 'land' ? 'Title' : 'Reg No.'} ${identifier}`}
                    </div>
                    <div className="review-item">
                      <strong>Buyer:</strong> {buyerName}
                    </div>
                    <div className="review-item">
                      <strong>Seller:</strong> {sellerName} ({sellerPhone})
                    </div>
                    <div className="status-card">
                      <strong>Conflict check</strong>
                      <p>{riskSummary}</p>
                      {activeConflict && <p className="danger">{activeConflict}</p>}
                    </div>
                  </div>
                )}

                <div className="form-navigation">
                  {currentStep > 1 && (
                    <button type="button" className="secondary" onClick={handlePrevious}>
                      Previous
                    </button>
                  )}
                  {currentStep < totalSteps ? (
                    <button type="button" className="primary" onClick={handleNext}>
                      Next
                    </button>
                  ) : (
                    <button type="submit" className="primary">
                      Create deal room
                    </button>
                  )}
                </div>
              </form>
              {message && <div className="notice">{message}</div>}
            </section>

            {renderRoomList()}
          </>
        )}
      </main>
    </div>
  )
}

export default App
