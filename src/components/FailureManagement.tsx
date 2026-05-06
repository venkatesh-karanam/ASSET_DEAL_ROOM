import { useState } from 'react'

interface FailureScenario {
  id: string
  title: string
  description: string
  automatedResponse: string
  escalationOptions: string[]
  active: boolean
}

interface FailureManagementProps {
  dealRoomId?: string
  onEscalation?: (scenario: FailureScenario, option: string) => void
}

export default function FailureManagement({ dealRoomId, onEscalation }: FailureManagementProps) {
  const [activeFailures, setActiveFailures] = useState<FailureScenario[]>([
    {
      id: 'registry-down',
      title: 'Registry Server Unavailable',
      description: 'Ardhisasa/NTSA registry servers are currently down for maintenance',
      automatedResponse: 'Verification paused. Automated retry in 15 minutes.',
      escalationOptions: ['Assign lawyer', 'Request county officer review', 'Schedule video verification'],
      active: false
    },
    {
      id: 'seller-disappeared',
      title: 'Seller Disappeared Mid-Process',
      description: 'Seller has not responded to verification requests for 48 hours',
      automatedResponse: 'Transaction frozen. Evidence preserved for legal review.',
      escalationOptions: ['Freeze transaction', 'Notify buyer', 'Escalate to police', 'Assign investigator'],
      active: false
    },
    {
      id: 'duplicate-ownership',
      title: 'Duplicate Ownership Detected',
      description: 'Multiple parties claim ownership of this asset',
      automatedResponse: 'Escalated to legal review. All parties notified.',
      escalationOptions: ['Assign lawyer', 'Schedule court hearing', 'Freeze asset transfers'],
      active: false
    },
    {
      id: 'document-fraud',
      title: 'Document Tampering Suspected',
      description: 'OCR analysis detected potential document manipulation',
      automatedResponse: 'Verification blocked. Manual review required.',
      escalationOptions: ['Assign verifier', 'Request original documents', 'Notify authorities'],
      active: false
    }
  ])

  const handleEscalation = (scenario: FailureScenario, option: string) => {
    // Update scenario status
    setActiveFailures(prev =>
      prev.map(s => s.id === scenario.id ? { ...s, active: true } : s)
    )

    // Call parent handler
    onEscalation?.(scenario, option)

    // Log the escalation
    console.log(`Escalated ${scenario.title} with option: ${option}`)
  }

  return (
    <div className="failure-management">
      <h3>Failure Management & Escalation</h3>
      <p className="description">
        When things go wrong, DealRoom KE automatically responds and provides escalation options.
        All actions are logged and auditable.
      </p>

      <div className="failure-scenarios">
        {activeFailures.map(scenario => (
          <div key={scenario.id} className={`failure-card ${scenario.active ? 'active' : ''}`}>
            <div className="failure-header">
              <h4>{scenario.title}</h4>
              <span className={`status ${scenario.active ? 'escalated' : 'monitored'}`}>
                {scenario.active ? 'Escalated' : 'Monitored'}
              </span>
            </div>

            <p className="failure-description">{scenario.description}</p>

            <div className="automated-response">
              <strong>Automated Response:</strong>
              <p>{scenario.automatedResponse}</p>
            </div>

            {!scenario.active && (
              <div className="escalation-options">
                <strong>Escalation Options:</strong>
                <div className="option-buttons">
                  {scenario.escalationOptions.map(option => (
                    <button
                      key={option}
                      className="escalation-btn"
                      onClick={() => handleEscalation(scenario, option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {scenario.active && (
              <div className="escalation-status">
                <span className="escalated-badge">Escalation in progress</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="failure-summary">
        <h4>Why Failure Management Matters</h4>
        <ul>
          <li><strong>Trust Building:</strong> Shows we handle problems, not just successes</li>
          <li><strong>Risk Mitigation:</strong> Prevents fraud from going undetected</li>
          <li><strong>Legal Protection:</strong> Creates audit trail for court admissibility</li>
          <li><strong>User Confidence:</strong> Buyers know their money is protected</li>
        </ul>
      </div>

      <style jsx>{`
        .failure-management {
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

        .failure-scenarios {
          display: grid;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .failure-card {
          border: 1px solid var(--border-light);
          border-radius: 6px;
          padding: 1rem;
          background: var(--background);
        }

        .failure-card.active {
          border-color: var(--warning);
          background: rgba(255, 193, 7, 0.05);
        }

        .failure-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .failure-header h4 {
          margin: 0;
          color: var(--text);
        }

        .status {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: bold;
        }

        .status.monitored {
          background: var(--info);
          color: white;
        }

        .status.escalated {
          background: var(--warning);
          color: white;
        }

        .failure-description {
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .automated-response {
          background: rgba(0, 123, 255, 0.1);
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .escalation-options {
          margin-bottom: 1rem;
        }

        .option-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .escalation-btn {
          background: var(--primary);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .escalation-btn:hover {
          background: var(--primary-dark);
        }

        .escalation-status {
          text-align: center;
          padding: 1rem;
        }

        .escalated-badge {
          background: var(--warning);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-weight: bold;
        }

        .failure-summary {
          border-top: 1px solid var(--border);
          padding-top: 1.5rem;
        }

        .failure-summary h4 {
          margin-bottom: 1rem;
        }

        .failure-summary ul {
          list-style: none;
          padding: 0;
        }

        .failure-summary li {
          margin-bottom: 0.5rem;
          padding-left: 1rem;
          position: relative;
        }

        .failure-summary li::before {
          content: '✓';
          color: var(--success);
          font-weight: bold;
          position: absolute;
          left: 0;
        }
      `}</style>
    </div>
  )
}