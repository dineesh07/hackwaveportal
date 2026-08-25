import React from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProblemStatementsTab from '@/app/dashboard/team/components/ProblemStatementsTab'

export default async function CoordinatorProblemStatementsPage() {
  const session = await auth()
  if (!session?.user?.id || (session.user.role !== 'COORDINATOR' && session.user.role !== 'ADMIN')) {
    redirect('/login')
  }

  // Fetch configs from database directly (safely)
  const initialLimits: Record<string, number> = {}
  try {
    if ((prisma as any).problemStatementConfig?.findMany) {
      const configs = await (prisma as any).problemStatementConfig.findMany()
      configs.forEach((c: any) => { initialLimits[c.psId] = c.maxLimit })
    }
  } catch (err) {
    console.error('Error fetching initial PS limits for coordinator:', err)
  }

  // Fetch enrolled teams per PS
  const projects = await prisma.project.findMany({
    where: {
      phase: 1,
      problemStatementId: { not: null, notIn: [''] }
    },
    include: {
      team: {
        select: {
          id: true,
          teamName: true,
          teamCode: true
        }
      }
    }
  })

  const initialCounts: Record<string, number> = {}
  const initialTeamsByPs: Record<string, Array<{ teamId: string; teamName: string; teamCode: string | null }>> = {}

  projects.forEach(p => {
    const psId = p.problemStatementId
    if (psId) {
      initialCounts[psId] = (initialCounts[psId] || 0) + 1
      if (!initialTeamsByPs[psId]) initialTeamsByPs[psId] = []
      initialTeamsByPs[psId].push({
        teamId: p.team.id,
        teamName: p.team.teamName,
        teamCode: p.team.teamCode
      })
    }
  })

  return (
    <div style={{ paddingTop: 0 }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--ink)' }}>Problem Statements</h1>
        <p style={{ color: 'var(--ink-60)', marginTop: '0.25rem' }}>Browse, search by ID, and filter problem statements across all domains for hackathon tracks.</p>
      </header>
      <ProblemStatementsTab 
        role="COORDINATOR" 
        initialLimits={initialLimits}
        initialCounts={initialCounts}
        initialTeamsByPs={initialTeamsByPs}
      />
    </div>
  )
}
