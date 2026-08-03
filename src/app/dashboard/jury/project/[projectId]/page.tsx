import React from 'react'
import { SidebarLayout } from '@/components/SidebarLayout'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { StatusRibbon } from '@/components/ui/StatusRibbon'
import styles from '../../../dashboard.module.css'
import Link from 'next/link'
import EvaluationClient from './EvaluationClient'

export default async function JuryEvaluationPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'JURY') {
    return <div>Unauthorized.</div>
  }

  const assignment = await prisma.juryAssignment.findUnique({
    where: { juryId_projectId_phase: { juryId: session.user.id, projectId, phase: 1 } }
  });

  if (!assignment) {
    return <div>You are not assigned to evaluate this project.</div>
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      team: true,
      coreFeatures: true,
      futureEnhancements: true,
      references: true,
      juryEvaluations: { where: { juryId: session.user.id } }
    }
  });

  if (!project) return <div>Project not found.</div>

  const evaluation = project.juryEvaluations[0] || null;

  return (
    <SidebarLayout role={session.user.role} userName={session.user.name || 'User'} mustChangePassword={session.user.mustChangePassword} rollNo={session.user.rollNo}>
      <div className={styles.dashboardContainer} style={{ paddingTop: 0 }}>
        <header className={styles.header} style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 className={styles.title}>Evaluation Workspace</h1>
            <p className={styles.subtitle}>{project.team.teamName} · {project.projectTitle}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/dashboard/jury" style={{ color: 'var(--flame-red)', textDecoration: 'none', fontWeight: 600 }}>&larr; Back to Dashboard</Link>
            <StatusRibbon label="Phase 1" tone="hot" />
          </div>
        </header>

        <EvaluationClient project={project} initialEvaluation={evaluation} />
      </div>
    </SidebarLayout>
  )
}