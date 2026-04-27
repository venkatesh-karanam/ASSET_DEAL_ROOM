import React, { useState } from 'react'

interface LoginProps {
  onLogin: (token: string, role: string) => void
}

export const LoginPage: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()
      localStorage.setItem('token', data.token)
      localStorage.setItem('userRole', data.user.role)
      onLogin(data.token, data.user.role)
    } catch (err) {
      setError('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const demoAccounts = [
    { email: 'police@kps.go.ke', agency: 'Kenya Police Service' },
    { email: 'lands@lands.go.ke', agency: 'Ministry of Lands' },
    { email: 'ntsa@ntsa.go.ke', agency: 'NTSA' },
    { email: 'kra@kra.go.ke', agency: 'KRA' },
    { email: 'intelligence@intel.go.ke', agency: 'Intelligence' },
    { email: 'citizen@example.com', agency: 'Citizen' },
  ]

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Asset Deal Room - Government Edition</h1>
        <p className="tagline">Secure Asset Transaction Verification & Fraud Detection</p>

        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && <p className="error">{error}</p>}
        </form>

        <div className="demo-section">
          <h3>Demo Accounts (Password: demo123)</h3>
          <div className="demo-grid">
            {demoAccounts.map(account => (
              <div key={account.email} className="demo-card" onClick={() => setEmail(account.email)}>
                <strong>{account.agency}</strong>
                <small>{account.email}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .login-container {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          max-width: 500px;
          width: 100%;
        }
        h1 {
          text-align: center;
          color: #333;
          margin-bottom: 10px;
        }
        .tagline {
          text-align: center;
          color: #666;
          margin-bottom: 30px;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        input {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 16px;
        }
        button {
          padding: 12px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
          font-weight: 600;
        }
        button:disabled {
          opacity: 0.6;
        }
        .error {
          color: #e74c3c;
          text-align: center;
        }
        .demo-section {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        .demo-section h3 {
          color: #666;
          margin-bottom: 15px;
        }
        .demo-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .demo-card {
          padding: 10px;
          background: #f5f5f5;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s;
        }
        .demo-card:hover {
          background: #e8e8e8;
        }
        .demo-card strong {
          display: block;
          color: #333;
          font-size: 12px;
        }
        .demo-card small {
          display: block;
          color: #999;
          font-size: 11px;
          margin-top: 5px;
        }
      `}</style>
    </div>
  )
}
