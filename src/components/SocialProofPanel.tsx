interface SocialProofPanelProps {
  sellerName: string
  verifiedTransactions: number
  fraudDisputes: number
  firstVerified: string
  lawyerName?: string
  lawyerVerified?: boolean
  lawyerTransactions?: number
}

export default function SocialProofPanel({
  sellerName,
  verifiedTransactions,
  fraudDisputes,
  firstVerified,
  lawyerName,
  lawyerVerified,
  lawyerTransactions,
}: SocialProofPanelProps) {
  return (
    <div className="social-proof-panel">
      <div className="social-copy">
        <h3>Trust signals from the transaction ecosystem</h3>
        <p>Your platform now shows visible evidence that others have trusted this seller and advisor.</p>
      </div>
      <div className="social-grid">
        <div className="social-card">
          <strong>{sellerName || 'Seller'}</strong>
          <span>{verifiedTransactions} verified transactions</span>
          <span>{fraudDisputes} fraud disputes</span>
          <span>Verified since {firstVerified}</span>
        </div>
        {lawyerName && (
          <div className="social-card">
            <strong>{lawyerName}</strong>
            <span>{lawyerVerified ? 'Verified lawyer' : 'Lawyer verification pending'}</span>
            <span>{lawyerTransactions || 0} completed transactions</span>
          </div>
        )}
      </div>

      <style jsx>{`
        .social-proof-panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 1.25rem;
          margin: 1rem 0;
        }

        .social-copy h3 {
          margin: 0 0 0.5rem 0;
        }

        .social-copy p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .social-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .social-card {
          border: 1px solid var(--border-light);
          border-radius: 8px;
          padding: 1rem;
          background: var(--background);
          display: grid;
          gap: 0.5rem;
        }

        .social-card strong {
          font-size: 1rem;
          color: var(--primary);
        }

        .social-card span {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  )
}
