import React, { useState, useEffect } from 'react'

interface FraudAnalytics {
  totalTransactions: number
  flaggedCount: number
  flagRate: number
  highSeverityAlerts: number
  byType: {
    fraud: number
    duplicates: number
    highRisk: number
  }
}

interface HighRiskSeller {
  id: string
  count: number
  flaggedCount: number
  names: string[]
  flagRate: number
}

interface PoliceAnalyticsProps {
  token: string
}

export const PoliceAnalytics: React.FC<PoliceAnalyticsProps> = ({ token }) => {
  const [analytics, setAnalytics] = useState<FraudAnalytics | null>(null)
  const [highRiskSellers, setHighRiskSellers] = useState<HighRiskSeller[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const analyticsRes = await fetch('http://localhost:5000/api/analytics/fraud-summary', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const sellersRes = await fetch('http://localhost:5000/api/analytics/high-risk-sellers', {
          headers: { Authorization: `Bearer ${token}` },
        })

        setAnalytics(await analyticsRes.json())
        setHighRiskSellers(await sellersRes.json())
      } catch (error) {
        console.error('Failed to fetch analytics', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [token])

  if (loading) return <div>Loading...</div>

  return (
    <div className="police-dashboard">
      <h1>🚔 Kenya Police Service - Fraud Investigation Dashboard</h1>

      {analytics && (
        <div className="analytics-grid">
          <div className="metric-card">
            <h3>Total Transactions</h3>
            <div className="metric-value">{analytics.totalTransactions}</div>
          </div>
          <div className="metric-card warning">
            <h3>Flagged Transactions</h3>
            <div className="metric-value">{analytics.flaggedCount}</div>
            <small>{(analytics.flagRate || 0).toFixed(1)}% flag rate</small>
          </div>
          <div className="metric-card danger">
            <h3>High Severity Alerts</h3>
            <div className="metric-value">{analytics.highSeverityAlerts}</div>
          </div>
          <div className="metric-card">
            <h3>Fraud Flags</h3>
            <div className="metric-value">{analytics.byType.fraud}</div>
          </div>
          <div className="metric-card">
            <h3>Duplicate Sales</h3>
            <div className="metric-value">{analytics.byType.duplicates}</div>
          </div>
          <div className="metric-card">
            <h3>High Risk</h3>
            <div className="metric-value">{analytics.byType.highRisk}</div>
          </div>
        </div>
      )}

      <div className="high-risk-section">
        <h2>⚠️ High Risk Sellers</h2>
        {highRiskSellers.length === 0 ? (
          <p>No high-risk sellers identified</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Seller Names</th>
                <th>Total Transactions</th>
                <th>Flagged</th>
                <th>Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {highRiskSellers.slice(0, 10).map(seller => (
                <tr key={seller.id} className={seller.flagRate > 50 ? 'critical' : 'warning'}>
                  <td>{seller.names.join(', ')}</td>
                  <td>{seller.count}</td>
                  <td>{seller.flaggedCount}</td>
                  <td className="risk-badge">{seller.flagRate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        .police-dashboard {
          padding: 20px;
        }
        h1 {
          color: #333;
          margin-bottom: 30px;
        }
        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        .metric-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #667eea;
        }
        .metric-card.warning {
          border-left-color: #f39c12;
          background: #fffbf0;
        }
        .metric-card.danger {
          border-left-color: #e74c3c;
          background: #fff5f5;
        }
        .metric-value {
          font-size: 32px;
          font-weight: bold;
          color: #333;
          margin: 10px 0;
        }
        small {
          color: #999;
        }
        .high-risk-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        h2 {
          color: #333;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          text-align: left;
          padding: 12px;
          border-bottom: 2px solid #ddd;
          font-weight: 600;
          color: #666;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #eee;
        }
        tr.critical {
          background: #fff5f5;
        }
        tr.warning {
          background: #fffbf0;
        }
        .risk-badge {
          background: #e74c3c;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 12px;
          display: inline-block;
        }
      `}</style>
    </div>
  )
}
