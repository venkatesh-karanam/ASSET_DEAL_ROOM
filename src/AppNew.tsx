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

function getRiskStatus(room: DealRoom): { status: string; color: string; score: number; reasons: string[] } {
  const reasons: string[] = []

  if (room.conflict) {
    reasons.push('Duplicate asset room detected')
  }

  if (!room.officialChecks.ardhiSearch && room.assetType === 'land') {
    reasons.push('Ardhisasa registry not verified')
  }

  if (!room.officialChecks.ntsaRecord && room.assetType === 'car') {
    reasons.push('NTSA registry not verified')
  }

  if (!room.identityProof) {
    reasons.push('Seller identity not matched')
  }

  if (!room.authorityProof) {
    reasons.push('Seller authority documents missing')
  }

  if (!room.supportingDocs) {
    reasons.push('Supporting documents not uploaded')
  }

  if (!room.inspectionNotes) {
    reasons.push('Inspection notes incomplete')
  }

  if (!room.paymentMilestone) {
    reasons.push('Payment milestone not recorded')
  }

  const riskScore = Math.max(0, 100 - (reasons.length * 15))

  if (reasons.length > 0 && (room.conflict || (!room.officialChecks.ardhiSearch && room.assetType === 'land') || (!room.officialChecks.ntsaRecord && room.assetType === 'car'))) {
    return { status: 'Do not pay yet', color: 'var(--danger)', score: riskScore, reasons }
  }

  if (reasons.length > 0) {
    return { status: 'Proceed with caution', color: 'var(--warning)', score: riskScore, reasons }
  }

  return { status: 'Safe to proceed', color: 'var(--success)', score: 100, reasons: [] }
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
                <div className="risk-score-display">
                  <span className="score-mini">{risk.score}/100</span>
                </div>
                <h3>{room.title}</h3>
                <p><strong>🆔 Identifier:</strong> {room.identifier}</p>
                <p><strong>👤 Buyer:</strong> {room.buyerName}</p>
                <p><strong>🏪 Seller:</strong> {room.sellerName}</p>
                <p><strong>📅 Created:</strong> {new Date(room.createdAt).toLocaleString()}</p>
                {room.conflict ? (
                  <p className="danger">🚨 {room.conflict}</p>
                ) : (
                  <p className="fine">✅ No duplicate room found</p>
                )}
                {risk.reasons.length > 0 && (
                  <div className="risk-indicators">
                    {risk.reasons.slice(0, 2).map((reason, index) => (
                      <small key={index} className="risk-indicator">⚠️ {reason}</small>
                    ))}
                    {risk.reasons.length > 2 && (
                      <small className="risk-indicator">+{risk.reasons.length - 2} more risks</small>
                    )}
                  </div>
                )}
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
          <div className="risk-summary-large">
            <div className="risk-score-large">
              <span className="score-number-large">{risk.score}/100</span>
              <span className="score-label">Risk Score</span>
            </div>
            {risk.reasons.length > 0 && (
              <div className="risk-factors">
                <h4>Risk Factors Identified:</h4>
                <ul>
                  {risk.reasons.map((reason, index) => (
                    <li key={index}>⚠️ {reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="room-details-grid">
            <div><strong>🆔 Identifier:</strong> {room.identifier}</div>
            <div><strong>👤 Buyer:</strong> {room.buyerName}</div>
            <div><strong>🏪 Seller:</strong> {room.sellerName}</div>
            <div><strong>📞 Seller Phone:</strong> {room.sellerPhone}</div>
            <div><strong>📅 Created:</strong> {new Date(room.createdAt).toLocaleString()}</div>
            <div><strong>🔗 Invite Link:</strong> <code>{getRoomLink(room)}</code></div>
          </div>
          <div className="conflict-status">
            <strong>🔍 Conflict Detection:</strong> {room.conflict ?? '✅ No matching duplicate room found'}
          </div>
          {otherMatches.length > 0 && (
            <div className="conflict-panel">
              <strong>🚨 Other active rooms for this asset:</strong>
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

        <div className="room-card detail-card">
          <h3>⚖️ Dispute Center</h3>
          <p className="step-description">If issues arise after verification, use this dispute resolution system.</p>
          <div className="dispute-actions">
            <button type="button" className="secondary">
              📋 File Dispute
            </button>
            <button type="button" className="secondary">
              📞 Contact Support
            </button>
            <button type="button" className="secondary">
              📜 Legal Templates
            </button>
          </div>
          <div className="dispute-note">
            <strong>🔒 Protected:</strong> All dispute evidence is timestamped and cannot be altered.
          </div>
        </div>
      </section>
    )
  }

  return (
    <div className="page-shell">
      <header className="hero">
        <div>
          <span className="eyebrow">DealRoom KE</span>
          <h1>Kenya's First Transaction Verification Platform</h1>
          <p>Prevent fraud before money changes hands. Protect your land and vehicle purchases with government-verified evidence and real-time risk assessment.</p>
        </div>
      </header>

      {/* Trust Bar */}
      <div className="trust-bar">
        <div className="trust-badges">
          <span className="trust-badge">🔒 End-to-End Encrypted</span>
          <span className="trust-badge">⚖️ Kenya Data Protection Act Compliant</span>
          <span className="trust-badge">🏛️ Government API Integrated</span>
          <span className="trust-badge">📋 Audit Logs Retained 7 Years</span>
          <span className="trust-badge">🛡️ Role-Based Access Control</span>
        </div>
        <div className="government-logos">
          <span className="gov-logo">eCitizen</span>
          <span className="gov-logo">Ardhisasa</span>
          <span className="gov-logo">NTSA</span>
          <span className="gov-logo">KRA</span>
          <span className="gov-logo">Huduma</span>
        </div>
      </div>

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
                  <span>Choose Asset</span>
                  <span>Add Parties</span>
                  <span>Verify Ownership</span>
                  <span>Upload Evidence</span>
                  <span>Final Check</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="form-grid">
                {currentStep === 1 && (
                  <>
                    <label>
                      What type of asset are you verifying?
                      <select value={assetType} onChange={(event) => setAssetType(event.target.value as AssetType)}>
                        <option value="land">🏠 Land Property</option>
                        <option value="car">🚗 Vehicle</option>
                      </select>
                    </label>

                    <label>
                      {assetType === 'land' ? 'Enter the land title number to protect your purchase' : 'Enter the vehicle registration number to protect your purchase'}
                      <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder={assetType === 'land' ? "e.g. LR.12345/678" : "e.g. KCA 123A"} required />
                    </label>

                    <label>
                      Give this verification room a name (optional)
                      <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Karen Plot Purchase" />
                    </label>
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <label>
                      Who is buying this asset?
                      <input value={buyerName} onChange={(event) => setBuyerName(event.target.value)} placeholder="Enter buyer full name" required />
                    </label>
                    <label>
                      Who is selling this asset?
                      <input value={sellerName} onChange={(event) => setSellerName(event.target.value)} placeholder="Enter seller full name" required />
                    </label>
                    <label>
                      Seller's phone number (for verification)
                      <input value={sellerPhone} onChange={(event) => setSellerPhone(event.target.value)} placeholder="+254 XXX XXX XXX" required />
                    </label>
                  </>
                )}

                {currentStep === 3 && (
                  <div className="checklist-card">
                    <h3>🛡️ Verify ownership through government records</h3>
                    <p className="step-description">These official checks protect you from fake documents and duplicate sales.</p>
                    {assetType === 'land' ? (
                      <label className="checkbox-row">
                        <input
                          type="checkbox"
                          checked={checked.ardhiSearch}
                          onChange={(event) => setChecked({ ...checked, ardhiSearch: event.target.checked })}
                        />
                        ✅ Ardhisasa land registry search completed
                      </label>
                    ) : (
                      <label className="checkbox-row">
                        <input
                          type="checkbox"
                          checked={checked.ntsaRecord}
                          onChange={(event) => setChecked({ ...checked, ntsaRecord: event.target.checked })}
                        />
                        ✅ NTSA vehicle registration verified
                      </label>
                    )}
                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={checked.sellerId}
                        onChange={(event) => setChecked({ ...checked, sellerId: event.target.checked })}
                      />
                      ✅ Seller identity documents verified
                    </label>
                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={checked.sellerAuthority}
                        onChange={(event) => setChecked({ ...checked, sellerAuthority: event.target.checked })}
                      />
                      ✅ Seller authority to sell confirmed
                    </label>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="checklist-card">
                    <h3>📋 Complete your fraud protection checklist</h3>
                    <p className="step-description">These final checks ensure you have all the evidence needed to protect your payment.</p>
                    <label className="checkbox-row">
                      <input type="checkbox" checked={identityProof} onChange={(event) => setIdentityProof(event.target.checked)} />
                      🆔 ID selfie match completed (verify seller identity)
                    </label>
                    <label className="checkbox-row">
                      <input type="checkbox" checked={authorityProof} onChange={(event) => setAuthorityProof(event.target.checked)} />
                      📄 Seller authority documents collected (proof they can sell)
                    </label>
                    <label className="checkbox-row">
                      <input type="checkbox" checked={supportingDocs} onChange={(event) => setSupportingDocs(event.target.checked)} />
                      📎 Supporting documents uploaded (title deeds, receipts, etc.)
                    </label>
                    <label className="checkbox-row">
                      <input type="checkbox" checked={inspectionNotes} onChange={(event) => setInspectionNotes(event.target.checked)} />
                      🔍 Physical inspection completed (check condition and boundaries)
                    </label>
                    <label className="checkbox-row">
                      <input type="checkbox" checked={paymentMilestone} onChange={(event) => setPaymentMilestone(event.target.checked)} />
                      💰 Payment terms and buyer instructions recorded
                    </label>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="review-section">
                    <h3>🔍 Final Fraud Screening</h3>
                    <p className="step-description">Review your verification details and see the final risk assessment.</p>
                    <div className="review-item">
                      <strong>🏠 Asset:</strong> {assetType.toUpperCase()} - {identifier || 'Not specified'}
                    </div>
                    <div className="review-item">
                      <strong>📝 Title:</strong> {title || `${assetType === 'land' ? 'Title' : 'Reg No.'} ${identifier}`}
                    </div>
                    <div className="review-item">
                      <strong>👤 Buyer:</strong> {buyerName}
                    </div>
                    <div className="review-item">
                      <strong>🏪 Seller:</strong> {sellerName} ({sellerPhone})
                    </div>

                    <div className="risk-assessment">
                      <h4>🛡️ Risk Assessment</h4>
                      {(() => {
                        const risk = getRiskStatus({
                          id: '',
                          assetType,
                          identifier,
                          title: '',
                          createdAt: '',
                          buyerName,
                          sellerName,
                          sellerPhone,
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
                          conflict: activeConflict ? 'conflict' : undefined,
                          completed: false,
                        })
                        return (
                          <>
                            <div className="risk-score">
                              <span className="score-number">{risk.score}/100</span>
                              <span className={`score-status ${risk.status.toLowerCase().replace(' ', '-')}`}>
                                {risk.status}
                              </span>
                            </div>
                            {risk.reasons.length > 0 && (
                              <div className="risk-reasons">
                                <strong>Risk factors identified:</strong>
                                <ul>
                                  {risk.reasons.map((reason, index) => (
                                    <li key={index}>⚠️ {reason}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {activeConflict && (
                              <div className="conflict-alert">
                                🚨 <strong>Duplicate Alert:</strong> {activeConflict}
                              </div>
                            )}
                          </>
                        )
                      })()}
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
                      🛡️ Create Protected Deal Room
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

      <footer className="pricing-footer">
        <div className="pricing-info">
          <h3>🛡️ DealRoom KE Pricing</h3>
          <div className="pricing-options">
            <div className="pricing-card">
              <h4>Basic Verification</h4>
              <div className="price">KES 2,500</div>
              <p>Per transaction fraud check</p>
            </div>
            <div className="pricing-card featured">
              <h4>Lawyer Package</h4>
              <div className="price">KES 20,000</div>
              <p>Monthly subscription</p>
              <small>Unlimited verifications + legal templates</small>
            </div>
            <div className="pricing-card">
              <h4>Bank Integration</h4>
              <div className="price">Custom</div>
              <p>Enterprise API access</p>
            </div>
          </div>
          <p className="pricing-note">💡 <strong>Network Effect:</strong> Each verification strengthens fraud detection for all users</p>
        </div>
      </footer>
    </div>
  )
}

export default App
