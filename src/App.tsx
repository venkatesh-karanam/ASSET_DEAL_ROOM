import { useEffect, useMemo, useState } from 'react'
import type { AssetType, DealRoom } from './types'

const storageKey = 'dealroom-ke-rooms'
const ownersKey = 'dealroom-ke-owners'
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

function getInitialOwners(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(ownersKey)
    return raw ? (JSON.parse(raw) as Record<string, string>) : {}
  } catch {
    return {}
  }
}

function getRiskStatus(room: DealRoom): { status: string; color: string } {
  if (
    room.fraud ||
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

function App() {
  const [rooms, setRooms] = useState<DealRoom[]>(getInitialRooms)
  const [assetOwners, setAssetOwners] = useState<Record<string, string>>(getInitialOwners)
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

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(rooms))
  }, [rooms])

  useEffect(() => {
    window.localStorage.setItem(ownersKey, JSON.stringify(assetOwners))
  }, [assetOwners])

  const activeConflict = useMemo(() => {
    const existing = rooms.find(
      (room) => room.assetType === assetType && room.identifier.trim().toLowerCase() === identifier.trim().toLowerCase(),
    )
    return existing ? `Active room created on ${new Date(existing.createdAt).toLocaleString()} for ${existing.assetType === 'land' ? 'land' : 'car'}.` : undefined
  }, [assetType, identifier, rooms])

  const riskSummary = useMemo(() => {
    if (!identifier || !buyerName || !sellerName) return 'Complete the form to see risk status.'
    const conflict = activeConflict ? 'Conflict detected: duplicate asset room exists.' : ''
    const key = `${assetType}-${identifier.trim().toLowerCase()}`
    const currentOwner = assetOwners[key]
    const fraudCheck = currentOwner && currentOwner !== sellerName.trim() ? 'Fraud risk: Seller is not the current owner.' : ''
    return conflict || fraudCheck || 'No obvious conflict detected yet.'
  }, [activeConflict, buyerName, identifier, sellerName, assetType, assetOwners])

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

    const key = `${assetType}-${identifier.trim().toLowerCase()}`
    const currentOwner = assetOwners[key]
    const isFraud = currentOwner ? currentOwner !== sellerName.trim() : false

    if (isFraud) {
      setMessage('Possible fraud detected: Seller is not the current owner of this asset.')
    }

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
      fraud: isFraud,
    }

    setRooms((prev) => [newRoom, ...prev])
    if (!isFraud) {
      setAssetOwners((prev) => ({ ...prev, [key]: buyerName.trim() }))
    }
    setMessage(isFraud ? 'Deal room created with fraud flag.' : `Deal room created for ${newRoom.title}. Invite link: ${window.location.origin}/room/${newRoom.id}`)
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
        <section className="panel">
          <h2>Create a new asset deal room</h2>
          <form onSubmit={handleSubmit} className="form-grid">
            <label>
              Asset type
              <select value={assetType} onChange={(event) => setAssetType(event.target.value as AssetType)}>
                <option value="land">Land</option>
                <option value="car">Car</option>
              </select>
            </label>

            <label>
              {assetLabels[assetType]}
              <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="e.g. LR.12345/678" />
            </label>

            <label>
              Deal room title
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Optional custom title" />
            </label>

            <label>
              Buyer name
              <input value={buyerName} onChange={(event) => setBuyerName(event.target.value)} placeholder="Buyer name" />
            </label>

            <label>
              Seller name
              <input value={sellerName} onChange={(event) => setSellerName(event.target.value)} placeholder="Seller name" />
            </label>

            <label>
              Seller phone
              <input value={sellerPhone} onChange={(event) => setSellerPhone(event.target.value)} placeholder="Seller phone" />
            </label>

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

            <button type="submit" className="primary">Create deal room</button>
          </form>
          {message && <div className="notice">{message}</div>}
          <div className="status-card">
            <strong>Conflict check</strong>
            <p>{riskSummary}</p>
            {activeConflict && <p className="danger">{activeConflict}</p>}
          </div>
        </section>

        <section className="panel">
          <h2>Existing deal rooms</h2>
          {rooms.length === 0 ? (
            <p>No rooms created yet. Create the first land or car deal room.</p>
          ) : (
            <div className="room-grid">
              {rooms.map((room) => {
                const risk = getRiskStatus(room)
                return (
                  <article key={room.id} className="room-card">
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
                    {room.fraud ? <p className="danger">Fraud flag: Seller not current owner</p> : null}
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
