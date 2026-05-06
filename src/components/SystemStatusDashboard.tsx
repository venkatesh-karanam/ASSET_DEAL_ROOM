import { useEffect, useState } from 'react'

interface SystemStatus {
  backendOnline: boolean
  ardhiConnected: boolean
  ntsaConnected: boolean
  kraConnected: boolean
  ecitizenConfigured: boolean
  lastSync: string | null
  verificationEvents: VerificationEvent[]
}

interface VerificationEvent {
  timestamp: string
  action: string
  status: 'success' | 'warning' | 'error'
  details: string
}

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function SystemStatusDashboard() {
  const [status, setStatus] = useState<SystemStatus>({
    backendOnline: false,
    ardhiConnected: false,
    ntsaConnected: false,
    kraConnected: false,
    ecitizenConfigured: false,
    lastSync: null,
    verificationEvents: []
  })

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Check backend health
        const healthResponse = await fetch(`${apiBaseUrl.replace('/api', '')}/health`)
        const backendOnline = healthResponse.ok

        // Check integrations
        const integrationsResponse = await fetch(`${apiBaseUrl}/integrations/status`)
        const integrations = integrationsResponse.ok ? await integrationsResponse.json() : {}

        // Get recent verification events
        const eventsResponse = await fetch(`${apiBaseUrl}/audit/verification-events?limit=10`)
        const verificationEvents = eventsResponse.ok ? await eventsResponse.json() : []

        setStatus({
          backendOnline,
          ardhiConnected: integrations.ardhi?.connected || false,
          ntsaConnected: integrations.ntsa?.connected || false,
          kraConnected: integrations.kra?.connected || false,
          ecitizenConfigured: integrations.ecitizen?.configured || false,
          lastSync: integrations.lastSync || null,
          verificationEvents
        })
      } catch (error) {
        console.error('Failed to fetch system status:', error)
        setStatus(prev => ({ ...prev, backendOnline: false }))
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (connected: boolean) => connected ? '🟢' : '🔴'
  const getStatusText = (connected: boolean) => connected ? 'Connected' : 'Disconnected'

  return (
    <div className="system-status-dashboard">
      <h3>System Status & Live Operations</h3>

      <div className="status-grid">
        <div className="status-item">
          <div className="status-header">
            {getStatusIcon(status.backendOnline)}
            <strong>Backend API</strong>
          </div>
          <span>{getStatusText(status.backendOnline)}</span>
        </div>

        <div className="status-item">
          <div className="status-header">
            {getStatusIcon(status.ardhiConnected)}
            <strong>Ardhisasa Registry</strong>
          </div>
          <span>{getStatusText(status.ardhiConnected)}</span>
        </div>

        <div className="status-item">
          <div className="status-header">
            {getStatusIcon(status.ntsaConnected)}
            <strong>NTSA Registry</strong>
          </div>
          <span>{getStatusText(status.ntsaConnected)}</span>
        </div>

        <div className="status-item">
          <div className="status-header">
            {getStatusIcon(status.kraConnected)}
            <strong>KRA Integration</strong>
          </div>
          <span>{getStatusText(status.kraConnected)}</span>
        </div>

        <div className="status-item">
          <div className="status-header">
            {getStatusIcon(status.ecitizenConfigured)}
            <strong>eCitizen KYC</strong>
          </div>
          <span>{status.ecitizenConfigured ? 'Configured' : 'Not Configured'}</span>
        </div>
      </div>

      {status.lastSync && (
        <div className="sync-info">
          <small>Last sync: {new Date(status.lastSync).toLocaleString()}</small>
        </div>
      )}

      <div className="verification-log">
        <h4>Recent Verification Events</h4>
        {status.verificationEvents.length > 0 ? (
          <div className="event-list">
            {status.verificationEvents.map((event, index) => (
              <div key={index} className={`event-item ${event.status}`}>
                <span className="timestamp">{new Date(event.timestamp).toLocaleTimeString()}</span>
                <span className="action">{event.action}</span>
                <span className="details">{event.details}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-events">No recent verification events</p>
        )}
      </div>

      <style jsx>{`
        .system-status-dashboard {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 1rem;
          margin: 1rem 0;
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .status-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .status-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .sync-info {
          margin-bottom: 1rem;
          color: var(--text-secondary);
        }

        .verification-log h4 {
          margin-bottom: 0.5rem;
        }

        .event-list {
          max-height: 200px;
          overflow-y: auto;
        }

        .event-item {
          display: flex;
          gap: 1rem;
          padding: 0.5rem;
          border-bottom: 1px solid var(--border-light);
          font-size: 0.85rem;
        }

        .event-item.success { background: rgba(0, 255, 0, 0.1); }
        .event-item.warning { background: rgba(255, 255, 0, 0.1); }
        .event-item.error { background: rgba(255, 0, 0, 0.1); }

        .timestamp { font-weight: bold; min-width: 80px; }
        .action { flex: 1; }
        .details { color: var(--text-secondary); }

        .no-events {
          color: var(--text-secondary);
          font-style: italic;
        }
      `}</style>
    </div>
  )
}