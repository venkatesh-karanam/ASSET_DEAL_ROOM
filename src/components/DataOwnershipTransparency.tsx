export default function DataOwnershipTransparency() {
  return (
    <div className="data-ownership">
      <h3>Data Ownership & Privacy</h3>
      <p className="description">
        Your documents and data remain yours. DealRoom KE acts as a neutral custodian,
        not an owner. All data handling follows Kenyan Data Protection Act requirements.
      </p>

      <div className="ownership-grid">
        <div className="ownership-card">
          <h4>Document Ownership</h4>
          <div className="ownership-status">
            <span className="status-icon">👤</span>
            <strong>Your documents remain yours</strong>
          </div>
          <ul>
            <li>Shared only with transaction parties you approve</li>
            <li>Deleted after legal retention period (7 years)</li>
            <li>No commercial use without explicit consent</li>
            <li>Encrypted storage with your encryption keys</li>
          </ul>
        </div>

        <div className="ownership-card">
          <h4>Verification Data</h4>
          <div className="ownership-status">
            <span className="status-icon">🔒</span>
            <strong>Controlled access</strong>
          </div>
          <ul>
            <li>Registry checks visible only to verified parties</li>
            <li>KYC data used solely for fraud prevention</li>
            <li>No data mining or profiling</li>
            <li>Audit logs for transparency</li>
          </ul>
        </div>

        <div className="ownership-card">
          <h4>Transaction Records</h4>
          <div className="ownership-status">
            <span className="status-icon">📋</span>
            <strong>Immutable evidence</strong>
          </div>
          <ul>
            <li>Blockchain-timestamped for court admissibility</li>
            <li>Cryptographic hashes prevent tampering</li>
            <li>Available for legal proceedings</li>
            <li>Exportable in standard formats</li>
          </ul>
        </div>
      </div>

      <div className="data-rights">
        <h4>Your Data Rights Under Kenyan Law</h4>
        <div className="rights-grid">
          <div className="right-item">
            <h5>Access</h5>
            <p>Request complete copy of all your data anytime</p>
          </div>
          <div className="right-item">
            <h5>Rectification</h5>
            <p>Correct any inaccurate or incomplete data</p>
          </div>
          <div className="right-item">
            <h5>Erasure</h5>
            <p>Delete your data when no longer needed</p>
          </div>
          <div className="right-item">
            <h5>Portability</h5>
            <p>Export data in machine-readable format</p>
          </div>
          <div className="right-item">
            <h5>Objection</h5>
            <p>Object to processing for legitimate reasons</p>
          </div>
          <div className="right-item">
            <h5>Consent</h5>
            <p>Withdraw consent for data processing</p>
          </div>
        </div>
      </div>

      <div className="anti-corruption">
        <h4>Anti-Corruption Measures</h4>
        <ul>
          <li><strong>No Backdoors:</strong> No hidden access for any party</li>
          <li><strong>Logged Actions:</strong> Every data access is logged and auditable</li>
          <li><strong>No Silent Edits:</strong> All changes require explicit approval</li>
          <li><strong>No Hidden Copies:</strong> No duplicate databases or shadow systems</li>
          <li><strong>Regular Audits:</strong> Independent third-party security audits</li>
        </ul>
      </div>

      <div className="data-destruction">
        <h4>Data Destruction Policy</h4>
        <p>
          After transaction completion and legal retention period:
        </p>
        <ul>
          <li>Cryptographic erasure (multiple passes)</li>
          <li>Certificate of destruction provided</li>
          <li>No recoverable data remains</li>
          <li>Blockchain record of destruction</li>
        </ul>
      </div>

      <style jsx>{`
        .data-ownership {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 1.5rem;
          margin: 1rem 0;
        }

        .description {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
        }

        .ownership-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .ownership-card {
          border: 1px solid var(--border-light);
          border-radius: 6px;
          padding: 1rem;
          background: var(--background);
        }

        .ownership-card h4 {
          margin: 0 0 1rem 0;
          color: var(--primary);
        }

        .ownership-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding: 0.5rem;
          background: rgba(0, 123, 255, 0.1);
          border-radius: 4px;
        }

        .status-icon {
          font-size: 1.2rem;
        }

        .ownership-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .ownership-card li {
          margin-bottom: 0.5rem;
          padding-left: 1rem;
          position: relative;
          color: var(--text-secondary);
        }

        .ownership-card li::before {
          content: '✓';
          color: var(--success);
          font-weight: bold;
          position: absolute;
          left: 0;
        }

        .data-rights {
          margin-bottom: 2rem;
        }

        .rights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .right-item {
          border: 1px solid var(--border-light);
          border-radius: 4px;
          padding: 1rem;
          text-align: center;
        }

        .right-item h5 {
          margin: 0 0 0.5rem 0;
          color: var(--primary);
        }

        .right-item p {
          margin: 0;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .anti-corruption, .data-destruction {
          border-top: 1px solid var(--border);
          padding-top: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .anti-corruption h4, .data-destruction h4 {
          margin-bottom: 1rem;
          color: var(--danger);
        }

        .anti-corruption ul, .data-destruction ul {
          margin: 0;
          padding-left: 1.5rem;
        }

        .anti-corruption li, .data-destruction li {
          margin-bottom: 0.5rem;
        }

        .data-destruction p {
          margin-bottom: 1rem;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  )
}