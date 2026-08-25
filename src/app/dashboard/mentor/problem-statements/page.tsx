import React from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import ProblemStatementsTab from '@/app/dashboard/team/components/ProblemStatementsTab'

export default async function MentorProblemStatementsPage() {
  const session = await auth()
  if (!session?.user?.id || (session.user.role !== 'MENTOR' && session.user.role !== 'COORDINATOR' && session.user.role !== 'ADMIN')) {
    redirect('/login')
  }

  return (
    <div style={{ paddingTop: 0 }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--ink)' }}>Problem Statements</h1>
        <p style={{ color: 'var(--ink-60)', marginTop: '0.25rem' }}>Browse, search by ID, and filter problem statements across all domains for mentoring teams.</p>
      </header>
      <ProblemStatementsTab role="MENTOR" />
    </div>
  )
}
