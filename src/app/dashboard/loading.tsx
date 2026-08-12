import React from 'react'

export default function DashboardLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', width: '100%' }}>
      <div className="spinner" style={{ 
        width: '40px', 
        height: '40px', 
        border: '3px solid rgba(232, 40, 63, 0.2)', 
        borderTop: '3px solid var(--flame-red)', 
        borderRadius: '50%', 
        animation: 'spin 1s linear infinite' 
      }}></div>
      <p style={{ marginTop: '1rem', color: 'var(--ink-60)', fontWeight: 500 }}>Loading section...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
