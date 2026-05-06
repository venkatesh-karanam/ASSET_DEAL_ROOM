export default function MarketUrgencyDashboard() {
  const marketStats = {
    propertyFraudLosses: {
      amount: 'KSh 2.1 billion',
      timeframe: '2023',
      source: 'Kenya Property Developers Association'
    },
    vehicleFraudIncidents: {
      count: '45,000+',
      timeframe: '2022',
      source: 'NTSA Annual Report'
    },
    unresolvedTitleDisputes: {
      count: '120,000+',
      description: 'pending in courts',
      source: 'Ministry of Lands'
    },
    diasporaScamVictims: {
      count: '15,000+',
      amount: 'KSh 850 million',
      timeframe: '2023',
      source: 'Central Bank of Kenya'
    },
    corruptionPerception: {
      rank: '137th out of 180',
      description: 'countries in Corruption Perceptions Index',
      source: 'Transparency International 2023'
    }
  }

  return (
    <div className="market-urgency">
      <h3>Why DealRoom KE Now? The Market Imperative</h3>
      <p className="description">
        Kenya's high-value transaction market is a fraud battleground. The current system
        cannot protect buyers. This creates an urgent opportunity for trust infrastructure.
      </p>

      <div className="stats-grid">
        <div className="stat-card critical">
          <div className="stat-icon">🏠</div>
          <div className="stat-content">
            <div className="stat-value">{marketStats.propertyFraudLosses.amount}</div>
            <div className="stat-label">Property Fraud Losses</div>
            <div className="stat-meta">{marketStats.propertyFraudLosses.timeframe} • {marketStats.propertyFraudLosses.source}</div>
          </div>
        </div>

        <div className="stat-card critical">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <div className="stat-value">{marketStats.vehicleFraudIncidents.count}</div>
            <div className="stat-label">Vehicle Fraud Incidents</div>
            <div className="stat-meta">{marketStats.vehicleFraudIncidents.timeframe} • {marketStats.vehicleFraudIncidents.source}</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⚖️</div>
          <div className="stat-content">
            <div className="stat-value">{marketStats.unresolvedTitleDisputes.count}</div>
            <div className="stat-label">Unresolved Title Disputes</div>
            <div className="stat-meta">{marketStats.unresolvedTitleDisputes.description} • {marketStats.unresolvedTitleDisputes.source}</div>
          </div>
        </div>

        <div className="stat-card critical">
          <div className="stat-icon">🌍</div>
          <div className="stat-content">
            <div className="stat-value">{marketStats.diasporaScamVictims.amount}</div>
            <div className="stat-label">Diaspora Scam Losses</div>
            <div className="stat-meta">{marketStats.diasporaScamVictims.count} victims • {marketStats.diasporaScamVictims.timeframe}</div>
            <div className="stat-meta">{marketStats.diasporaScamVictims.source}</div>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{marketStats.corruptionPerception.rank}</div>
            <div className="stat-label">Corruption Perception Rank</div>
            <div className="stat-meta">{marketStats.corruptionPerception.description}</div>
            <div className="stat-meta">{marketStats.corruptionPerception.source}</div>
          </div>
        </div>
      </div>

      <div className="market-opportunity">
        <h4>The Platform Opportunity</h4>
        <p>
          DealRoom KE isn't just a land/vehicle platform. It's Kenya's trust operating system
          for high-value transactions. The market needs this infrastructure <strong>now</strong>.
        </p>

        <div className="opportunity-areas">
          <div className="opportunity-item">
            <h5>🏠 Real Estate</h5>
            <p>Land, commercial property, residential transactions</p>
          </div>
          <div className="opportunity-item">
            <h5>🚗 Vehicles & Equipment</h5>
            <p>Cars, trucks, tractors, construction equipment</p>
          </div>
          <div className="opportunity-item">
            <h5>🏭 Business Assets</h5>
            <p>Machinery, inventory, intellectual property</p>
          </div>
          <div className="opportunity-item">
            <h5>🌾 Agricultural</h5>
            <p>Farmland, livestock, equipment financing</p>
          </div>
          <div className="opportunity-item">
            <h5>⛏️ Natural Resources</h5>
            <p>Mining claims, borehole drilling, extraction rights</p>
          </div>
          <div className="opportunity-item">
            <h5>🏢 NGO & Government</h5>
            <p>Procurement, asset transfers, compliance</p>
          </div>
        </div>
      </div>

      <div className="competitive-advantage">
        <h4>Defensible Moat</h4>
        <ul>
          <li><strong>First-Mover Advantage:</strong> Establishing trust infrastructure before competitors</li>
          <li><strong>Network Effects:</strong> More transactions = more fraud patterns detected</li>
          <li><strong>Regulatory Relationships:</strong> Deep integration with government registries</li>
          <li><strong>Data Advantage:</strong> Unique behavioral fraud detection capabilities</li>
          <li><strong>Brand Trust:</strong> First platform Kenyans trust for high-value deals</li>
        </ul>
      </div>

      <div className="call-to-action">
        <h4>The Urgency Is Real</h4>
        <p>
          Every day without DealRoom KE, Kenyans lose millions to fraud.
          Every successful transaction builds the network effect.
          The market <strong>must</strong> be captured now.
        </p>
      </div>

      <style jsx>{`
        .market-urgency {
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

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          border: 1px solid var(--border-light);
          border-radius: 6px;
          padding: 1rem;
          background: var(--background);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-card.critical { border-color: var(--danger); background: rgba(220, 53, 69, 0.05); }
        .stat-card.warning { border-color: var(--warning); background: rgba(255, 193, 7, 0.05); }
        .stat-card.danger { border-color: var(--danger); background: rgba(255, 193, 7, 0.05); }

        .stat-icon {
          font-size: 2rem;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--text);
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-weight: bold;
          color: var(--text);
          margin-bottom: 0.25rem;
        }

        .stat-meta {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .market-opportunity {
          margin-bottom: 2rem;
        }

        .market-opportunity h4 {
          margin-bottom: 1rem;
        }

        .market-opportunity p {
          margin-bottom: 1.5rem;
          color: var(--text-secondary);
        }

        .opportunity-areas {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .opportunity-item {
          border: 1px solid var(--border-light);
          border-radius: 4px;
          padding: 1rem;
          text-align: center;
        }

        .opportunity-item h5 {
          margin: 0 0 0.5rem 0;
          color: var(--primary);
        }

        .opportunity-item p {
          margin: 0;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .competitive-advantage {
          border-top: 1px solid var(--border);
          padding-top: 1.5rem;
          margin-bottom: 2rem;
        }

        .competitive-advantage h4 {
          margin-bottom: 1rem;
        }

        .competitive-advantage ul {
          margin: 0;
          padding-left: 1.5rem;
        }

        .competitive-advantage li {
          margin-bottom: 0.5rem;
        }

        .call-to-action {
          border-top: 1px solid var(--border);
          padding-top: 1.5rem;
          background: rgba(0, 123, 255, 0.05);
          padding: 1.5rem;
          border-radius: 6px;
        }

        .call-to-action h4 {
          margin-bottom: 1rem;
          color: var(--primary);
        }

        .call-to-action p {
          margin: 0;
          font-size: 1.1rem;
          line-height: 1.5;
        }
      `}</style>
    </div>
  )
}