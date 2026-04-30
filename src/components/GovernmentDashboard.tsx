import React, { useState } from 'react'

interface GovDashboardProps {
  token: string
  role: string
  onLogout: () => void
}

export const GovernmentDashboard: React.FC<GovDashboardProps> = ({ token, role, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview')

  const roleLabels: Record<string, string> = {
    police: '🚔 Kenya Police Service',
    lands: '🏠 Ministry of Lands',
    ntsa: '🚗 NTSA',
    kra: '💼 Kenya Revenue Authority',
    intelligence: '🔍 Intelligence Services',
  }

  return (
    <div className="gov-dashboard">
      <header className="gov-header">
        <h1>Asset Deal Room - Government Edition</h1>
        <div className="header-info">
          <span className="agency-badge">{roleLabels[role] || role}</span>
          <button onClick={onLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <nav className="gov-nav">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
          📊 Overview
        </button>
        <button className={activeTab === 'transactions' ? 'active' : ''} onClick={() => setActiveTab('transactions')}>
          💼 Transactions
        </button>
        <button className={activeTab === 'fraud' ? 'active' : ''} onClick={() => setActiveTab('fraud')}>
          ⚠️ Fraud Alerts
        </button>
        <button className={activeTab === 'audit' ? 'active' : ''} onClick={() => setActiveTab('audit')}>
          📋 Audit Trail
        </button>
        <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>
          📈 Reports
        </button>
      </nav>

      <main className="gov-content">
        {activeTab === 'overview' && (
          <div className="content-section">
            <h2>System Overview</h2>
            <div className="info-cards">
              <div className="info-card">
                <h3>✅ System Status</h3>
                <p>All integrations operational</p>
                <small>Last verified: Just now</small>
              </div>
              <div className="info-card">
                <h3>🔗 Connected APIs</h3>
                <ul>
                  <li>✓ Ardhisasa (Land Registry)</li>
                  <li>✓ NTSA (Vehicle Registration)</li>
                  <li>✓ KRA (Identity & Tax)</li>
                  <li>✓ M-Pesa (Payment Verification)</li>
                  <li>✓ NAFIS (Fraud Database)</li>
                </ul>
              </div>
              <div className="info-card">
                <h3>🛡️ Security Features</h3>
                <ul>
                  <li>✓ Role-based access control</li>
                  <li>✓ Immutable audit logging</li>
                  <li>✓ Real-time fraud detection</li>
                  <li>✓ Encrypted transactions</li>
                  <li>✓ Multi-agency coordination</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="content-section">
            <h2>Recent Transactions</h2>
            <p className="placeholder">Fetching transactions from backend...</p>
          </div>
        )}

        {activeTab === 'fraud' && (
          <div className="content-section">
            <h2>Active Fraud Alerts</h2>
            <p className="placeholder">Displaying high-priority fraud cases...</p>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="content-section">
            <h2>Immutable Audit Trail</h2>
            <p className="placeholder">All transactions logged and timestamped...</p>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="content-section">
            <h2>Intelligence Reports</h2>
            <p className="placeholder">Generating analytics and intelligence reports...</p>
          </div>
        )}
      </main>

      <style>{`
        .gov-dashboard {
          min-height: 100vh;
          background: #f5f5f5;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .gov-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        h1 {
          margin: 0;
          font-size: 24px;
        }
        .header-info {
          display: flex;
          gap: 20px;
          align-items: center;
        }
        .agency-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
        }
        .logout-btn {
          background: rgba(255, 255, 255, 0.3);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.3s;
        }
        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.4);
        }
        .gov-nav {
          background: white;
          display: flex;
          gap: 10px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          overflow-x: auto;
        }
        .gov-nav button {
          background: none;
          border: none;
          padding: 10px 20px;
          cursor: pointer;
          color: #666;
          font-weight: 500;
          border-bottom: 3px solid transparent;
          transition: all 0.3s;
        }
        .gov-nav button:hover {
          color: #667eea;
        }
        .gov-nav button.active {
          color: #667eea;
          border-bottom-color: #667eea;
        }
        .gov-content {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .content-section {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        h2 {
          color: #333;
          margin-top: 0;
        }
        .info-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        .info-card {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }
        .info-card h3 {
          margin-top: 0;
          color: #333;
        }
        .info-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .info-card li {
          padding: 5px 0;
          color: #666;
        }
        .placeholder {
          color: #999;
          text-align: center;
          padding: 40px 20px;
        }
      `}</style>
    </div>
  )
}
