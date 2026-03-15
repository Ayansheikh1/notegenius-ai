import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f1420',
            color: '#e2ddd4',
            border: '1px solid rgba(255,255,255,0.07)',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '13px',
            borderRadius: '10px',
          },
          success: { iconTheme: { primary: '#00d4aa', secondary: '#0f1420' } },
          error:   { iconTheme: { primary: '#ff4d6d', secondary: '#0f1420' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
