import { useState } from 'react'

interface DiasporaModeProps {
  buyerLocation?: string
  sellerLocation?: string
  dealAmount?: number
}

export default function DiasporaMode({ buyerLocation, sellerLocation, dealAmount }: DiasporaModeProps) {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])

  const diasporaFeatures = [
    {
      id: 'timezone_coordination',
      title: 'Timezone Coordination',
      description: 'Schedule calls and reviews across time zones',
      icon: '🕐'
    },
    {
      id: 'remote_notarization',
      title: 'Remote Notarization',
      description: 'Digital notarization for international locations',
      icon: '📝'
    },
    {
      id: 'video_identity',
      title: 'Video Identity Checks',
      description: 'Real-time video verification with liveness detection',
      icon: '📹'
    },
    {
      id: 'currency_transparency',
      title: 'Currency Transparency',
      description: 'Clear conversion rates and no hidden fees',
      icon: '💱'
    },
    {
      id: 'family_delegation',
      title: 'Family Delegation',
      description: 'Authorize family members to act on your behalf',
      icon: '👨‍👩‍👧‍👦'
    },
    {
      id: 'escrow_protection',
      title: 'Enhanced Escrow',
      description: 'Multi-signature escrow with diaspora-friendly banks',
      icon: '🔐'
    }
  ]

  const kenyaStats = {
    diasporaRemittances: 'KSh 3.8 trillion (2023)',
    propertyFraudVictims: '15,000+ annually',
    averageTransaction: 'KSh 2.5 million',
    topCountries: ['UK', 'USA', 'Canada', 'Australia', 'Germany']
  }

  return (
    <div className="diaspora-mode">
      <h3>Diaspora Protected Purchase Mode</h3>
      <p className="description">
        Designed specifically for Kenyans abroad buying property or vehicles home.
        Your inheritance, retirement home, or family investment deserves institutional protection.
      </p>

      <div className="diaspora-stats">
        <h4>Why Diaspora Mode Matters</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{kenyaStats.diasporaRemittances}</div>
            <div className="stat-label">Annual Diaspora Remittances</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{kenyaStats.propertyFraudVictims}</div>
            <div className="stat-label">Property Fraud Victims Annually</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{kenyaStats.averageTransaction}</div>
            <div className="stat-label">Average Diaspora Property Transaction</div>
          </div>
        </div>
        <div className="top-countries">
          <strong>Top Diaspora Countries:</strong> {kenyaStats.topCountries.join(', ')}
        </div>
      </div>

      <div className="diaspora-features">
        <h4>Diaspora-Specific Protections</h4>
        <div className="features-grid">
          {diasporaFeatures.map(feature => (
            <div
              key={feature.id}
              className={`feature-card ${selectedFeatures.includes(feature.id) ? 'selected' : ''}`}
              onClick={() => {
                setSelectedFeatures(prev =>
                  prev.includes(feature.id)
                    ? prev.filter(f => f !== feature.id)
                    : [...prev, feature.id]
                )
              }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h5>{feature.title}</h5>
              <p>{feature.description}</p>
              <div className="feature-checkbox">
                {selectedFeatures.includes(feature.id) && '✓'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="diaspora-process">
        <h4>Diaspora Transaction Process</h4>
        <div className="process-steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h5>Remote Identity Verification</h5>
              <p>Video call with biometric checks from anywhere in the world</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h5>Family Representative Authorization</h5>
              <p>Appoint and verify family members to handle local processes</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h5>Timezone-Coordinated Reviews</h5>
              <p>Schedule inspections and legal reviews at your convenient time</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h5>Multi-Currency Escrow</h5>
              <p>Hold funds in your preferred currency until satisfaction</p>
            </div>
          </div>
        </div>
      </div>

      <div className="diaspora-benefits">
        <h4>Diaspora Advantages</h4>
        <ul>
          <li><strong>Time Zone Flexibility:</strong> No more 3 AM calls for property viewings</li>
          <li><strong>Family Involvement:</strong> Trusted relatives can represent you locally</li>
          <li><strong>Currency Protection:</strong> Transparent rates, no remittance company markups</li>
          <li><strong>Legal Continuity:</strong> Seamless integration with international notaries</li>
          <li><strong>Fraud Prevention:</strong> AI detects diaspora-specific scam patterns</li>
        </ul>
      </div>

      <style jsx>{`
        .diaspora-mode {
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

        .diaspora-stats {
          margin-bottom: 2rem;
        }

        .diaspora-stats h4 {
          margin-bottom: 1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .stat-item {
          text-align: center;
          padding: 1rem;
          border: 1px solid var(--border-light);
          border-radius: 6px;
        }

        .stat-value {
          font-size: 1.2rem;
          font-weight: bold;
          color: var(--primary);
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .top-countries {
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .diaspora-features h4 {
          margin-bottom: 1rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .feature-card {
          border: 1px solid var(--border-light);
          border-radius: 6px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .feature-card:hover {
          border-color: var(--primary);
          background: rgba(0, 123, 255, 0.05);
        }

        .feature-card.selected {
          border-color: var(--primary);
          background: rgba(0, 123, 255, 0.1);
        }

        .feature-icon {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .feature-card h5 {
          margin: 0 0 0.5rem 0;
          color: var(--text);
        }

        .feature-card p {
          margin: 0;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .feature-checkbox {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 20px;
          height: 20px;
          border: 2px solid var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          font-weight: bold;
        }

        .diaspora-process h4 {
          margin-bottom: 1rem;
        }

        .process-steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .step {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .step-number {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          flex-shrink: 0;
        }

        .step-content h5 {
          margin: 0 0 0.5rem 0;
          color: var(--text);
        }

        .step-content p {
          margin: 0;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .diaspora-benefits {
          border-top: 1px solid var(--border);
          padding-top: 1.5rem;
        }

        .diaspora-benefits h4 {
          margin-bottom: 1rem;
        }

        .diaspora-benefits ul {
          margin: 0;
          padding-left: 1.5rem;
        }

        .diaspora-benefits li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  )
}