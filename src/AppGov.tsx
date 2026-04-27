import React, { useState } from 'react'
import { LoginPage } from './components/LoginPage'
import { GovernmentDashboard } from './components/GovernmentDashboard'
import { PoliceAnalytics } from './components/PoliceAnalytics'

function AppGov() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [userRole, setUserRole] = useState<string | null>(localStorage.getItem('userRole'))

  const handleLogin = (newToken: string, role: string) => {
    setToken(newToken)
    setUserRole(role)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    setToken(null)
    setUserRole(null)
  }

  if (!token || !userRole) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <>
      {userRole === 'police' ? (
        <>
          <GovernmentDashboard token={token} role={userRole} onLogout={handleLogout} />
          <PoliceAnalytics token={token} />
        </>
      ) : (
        <GovernmentDashboard token={token} role={userRole} onLogout={handleLogout} />
      )}
    </>
  )
}

export default AppGov
