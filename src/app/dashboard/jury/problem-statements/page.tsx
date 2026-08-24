import React from 'react'
import ProblemStatementsTab from '@/app/dashboard/team/components/ProblemStatementsTab'

export default function JuryProblemStatementsPage() {
  return (
    <div style={{ paddingTop: 0 }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--ink)' }}>Problem Statements</h1>
        <p style={{ color: 'var(--ink-60)', marginTop: '0.25rem' }}>Browse all available problem statements for this hackathon.</p>
      </header>
      <ProblemStatementsTab />
    </div>
  )
}
