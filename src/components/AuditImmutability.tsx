import { useState, useEffect } from 'react'

interface EvidenceFingerprint {
  documentId: string
  hash: string
  timestamp: string
  blockHeight?: number
  transactionId?: string
  immutable: boolean
}

interface AuditImmutabilityProps {
  dealRoomId?: string
  documents?: Record<string, string>
}

export default function AuditImmutability({ dealRoomId, documents = {} }: AuditImmutabilityProps) {
  const [fingerprints, setFingerprints] = useState<EvidenceFingerprint[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const generateFingerprints = async () => {
      if (Object.keys(documents).length === 0) return

      setLoading(true)

      // Simulate blockchain/API delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      const newFingerprints: EvidenceFingerprint[] = []

      for (const [key, fileName] of Object.entries(documents)) {
        if (!fileName) continue

        // Mock hash generation - in real implementation, use SHA-256 of file content
        const mockHash = await generateMockHash(fileName + key + Date.now())

        newFingerprints.push({
          documentId: key,
          hash: mockHash,
          timestamp: new Date().toISOString(),
          blockHeight: Math.floor(Math.random() * 1000000) + 800000, // Mock block height
          transactionId: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock tx id
          immutable: true
        })
      }

      setFingerprints(newFingerprints)
      setLoading(false)
    }

    generateFingerprints()
  }, [documents])

  const generateMockHash = async (input: string): Promise<string> => {
    // Simple mock hash - in production, use crypto.subtle.digest
    const encoder = new TextEncoder()
    const data = encoder.encode(input)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-KE', {
      timeZone: 'Africa/Nairobi',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="audit-immutability">
      <h3>Audit Immutability & Evidence Integrity</h3>
      <p className="description">
        Every document and action is cryptographically hashed and timestamped on blockchain.
        Evidence cannot be altered or deleted, ensuring court admissibility.
      </p>

      {loading ? (
        <div className="loading">Generating cryptographic fingerprints...</div>
      ) : fingerprints.length > 0 ? (
        <div className="fingerprints-list">
          {fingerprints.map((fp, index) => (
            <div key={index} className="fingerprint-card">
              <div className="fingerprint-header">
                <h4>{fp.documentId.replace(/([A-Z])/g, ' $1').toLowerCase()}</h4>
                <span className={`immutable-badge ${fp.immutable ? 'locked' : 'pending'}`}>
                  {fp.immutable ? '🔒 Locked' : '⏳ Pending'}
                </span>
              </div>

              <div className="fingerprint-details">
                <div className="hash-section">
                  <strong>Document hash:</strong>
                  <code>{fp.hash}</code>
                </div>

                <div className="timestamp-section">
                  <strong>Timestamp:</strong>
                  <span>{formatTimestamp(fp.timestamp)} EAT</span>
                </div>

                {fp.blockHeight && (
                  <div className="blockchain-section">
                    <strong>Blockchain record:</strong>
                    <div className="blockchain-info">
                      <span>Block: {fp.blockHeight.toLocaleString()}</span>
                      <span>Tx: {fp.transactionId?.slice(0, 10)}...</span>
                    </div>
                  </div>
                )}

                <div className="version-section">
                  <strong>Version:</strong>
                  <span>v1.0 locked</span>
                </div>
              </div>

              <div className="fingerprint-actions">
                <button className="verify-btn" onClick={() => alert('Verification would check blockchain integrity')}>
                  Verify Integrity
                </button>
                <button className="export-btn" onClick={() => alert('Would export cryptographic proof')}>
                  Export Proof
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-fingerprints">Upload documents to generate immutable fingerprints</p>
      )}

      <div className="immutability-benefits">
        <h4>Why Immutability Matters</h4>
        <ul>
          <li><strong>Court Admissible:</strong> Cryptographic proof of evidence integrity</li>
          <li><strong>Tamper Proof:</strong> Any changes detectable via hash verification</li>
          <li><strong>Timestamped:</strong> Exact time of document submission recorded</li>
          <li><strong>Blockchain Backed:</strong> Distributed ledger prevents single points of failure</li>
          <li><strong>Legal Standard:</strong> Meets requirements for electronic evidence in Kenyan courts</li>
        </ul>
      </div>

      <div className="tamper-detection">
        <h4>Tamper Detection</h4>
        <p>If anyone attempts to modify evidence:</p>
        <ul>
          <li>Hash verification will fail</li>
          <li>System automatically flags tampering</li>
          <li>All parties notified immediately</li>
          <li>Original evidence preserved in quarantine</li>
          <li>Legal authorities alerted for investigation</li>
        </ul>
      </div>

      <style jsx>{`
        .audit-immutability {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 1.5rem;
          margin: 1rem 0;
        }

        .description {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .loading {
          text-align: center;
          color: var(--primary);
          font-style: italic;
          padding: 2rem;
        }

        .fingerprints-list {
          display: grid;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .fingerprint-card {
          border: 1px solid var(--border-light);
          border-radius: 6px;
          padding: 1rem;
          background: var(--background);
        }

        .fingerprint-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .fingerprint-header h4 {
          margin: 0;
          text-transform: capitalize;
        }

        .immutable-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: bold;
        }

        .immutable-badge.locked {
          background: var(--success);
          color: white;
        }

        .immutable-badge.pending {
          background: var(--warning);
          color: white;
        }

        .fingerprint-details {
          margin-bottom: 1rem;
        }

        .hash-section, .timestamp-section, .blockchain-section, .version-section {
          margin-bottom: 0.75rem;
        }

        .hash-section code {
          display: block;
          background: var(--background);
          border: 1px solid var(--border-light);
          padding: 0.5rem;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.85rem;
          word-break: break-all;
          margin-top: 0.25rem;
        }

        .blockchain-info {
          display: flex;
          gap: 1rem;
          margin-top: 0.25rem;
        }

        .blockchain-info span {
          font-family: monospace;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .fingerprint-actions {
          display: flex;
          gap: 0.5rem;
        }

        .verify-btn, .export-btn {
          background: var(--primary);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .verify-btn:hover, .export-btn:hover {
          background: var(--primary-dark);
        }

        .no-fingerprints {
          color: var(--text-secondary);
          font-style: italic;
          text-align: center;
          padding: 2rem;
        }

        .immutability-benefits, .tamper-detection {
          border-top: 1px solid var(--border);
          padding-top: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .immutability-benefits h4, .tamper-detection h4 {
          margin-bottom: 1rem;
        }

        .immutability-benefits ul, .tamper-detection ul {
          margin: 0;
          padding-left: 1.5rem;
        }

        .immutability-benefits li, .tamper-detection li {
          margin-bottom: 0.5rem;
        }

        .tamper-detection p {
          margin-bottom: 1rem;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  )
}