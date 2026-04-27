import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import AppGov from './AppGov'
import './styles.css'

const urlParams = new URLSearchParams(window.location.search)
const mode = urlParams.get('mode') || 'citizen'

const AppComponent = mode === 'gov' ? AppGov : App

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppComponent />
  </React.StrictMode>,
)
