interface VerificationSealProps {
  status: 'safe' | 'caution' | 'stop'
  referenceId: string
  checkedAt: string
  matchedOwnership: boolean
  matchedIdentity: boolean
  duplicateClaimsCleared: boolean
}

export default function VerificationSeal({
  status,
  referenceId,
  checkedAt,
  matchedOwnership,
  matchedIdentity,
  duplicateClaimsCleared,
}: VerificationSealProps) {
  const statusLabel = status === 'safe' ? 'VERIFIED OWNERSHIP MATCH' : status === 'caution' ? 'UNRESOLVED RISKS REMAIN' : 'TRANSACTION BLOCKED'
  const accent = status === 'safe' ? 'var(--success)' : status === 'caution' ? 'var(--warning)' : 'var(--danger)'

  return (
    <div className="verification-seal">
      <div className="seal-card">
        <div className="seal-icon" style={{ borderColor: accent }}>
          {status === 'safe' ? '✅' : status === 'caution' ? '⚠️' : '⛔'}
        </div>
        <div className="seal-copy">
          <strong>{statusLabel}</strong>
          <p>Protection infrastructure verified the transaction against ownership records, identity evidence, and duplicate claims.</p>
          <div className="seal-meta">
            <span>Reference: {referenceId}</span>
            <span>Checked: {new Date(checkedAt).toLocaleString('en-KE')}</span>
          </div>
        </div>
      </div>

      <ul className="seal-checklist">
        <li className={matchedIdentity ? 'pass' : 'fail'}>Seller identity matched</li>
        <li className={matchedOwnership ? 'pass' : 'fail'}>Registry ownership matched</li>
        <li className={duplicateClaimsCleared ? 'pass' : 'fail'}>No duplicate claims detected</li>
      </ul>

      <style jsx>{`
        .verification-seal {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 1.25rem;
          margin: 1rem 0;
        }

        .seal-card {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-bottom: 1rem;
        }

        .seal-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 4rem;
          height: 4rem;
          border: 2px solid;
          border-radius: 50%;
          font-size: 1.75rem;
        }

        .seal-copy strong {
          display: block;
          margin-bottom: 0.25rem;
          font-size: 1rem;
        }

        .seal-copy p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .seal-meta {
          display: grid;
          gap: 0.25rem;
          margin-top: 0.85rem;
          color: var(--text-secondary);
          font-size: 0.85rem;
        }

        .seal-checklist {
          display: grid;
          gap: 0.5rem;
          padding: 0;
          margin: 0;
          list-style: none;
        }

        .seal-checklist li {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          background: var(--background);
          border: 1px solid var(--border-light);
        }

        .seal-checklist li.pass {
          border-color: var(--success);
          color: var(--success);
        }

        .seal-checklist li.fail {
          border-color: var(--warning);
          color: var(--warning);
        }
      `}</style>
    </div>
  )
}
