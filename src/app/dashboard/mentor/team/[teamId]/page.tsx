import React from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { StatusRibbon } from '@/components/ui/StatusRibbon'
import styles from '../../../dashboard.module.css'
import Link from 'next/link'
import MentorWorkspaceClient from './MentorWorkspaceClient'

export default async function MentorTeamWorkspacePage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'MENTOR') {
    return <div>Unauthorized.</div>
  }

  const assignment = await prisma.mentorAssignment.findUnique({
    where: { mentorId_teamId_phase: { mentorId: session.user.id, teamId, phase: 1 } }
  });

  if (!assignment) {
    return <div>You are not assigned to this team.</div>
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: true,
      projects: {
        where: { phase: 1 },
        include: {
          coreFeatures: true,
          futureEnhancements: true,
          references: true,
          mentorFeedback: { where: { mentorId: session.user.id } },
          privateNotes: { where: { mentorId: session.user.id } },
          tasks: { where: { mentorId: session.user.id } }
        }
      }
    }
  });

  if (!team) return <div>Team not found.</div>
  const project = team.projects[0];

  return (
    <>
      <div className={styles.dashboardContainer} style={{ paddingTop: 0 }}>
        <header className={styles.header} style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 className={styles.title}>Team Workspace</h1>
            <p className={styles.subtitle}>{team.teamName}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/dashboard/mentor" style={{ color: 'var(--flame-red)', textDecoration: 'none', fontWeight: 600 }}>&larr; Back to Dashboard</Link>
            <StatusRibbon label="Phase 1" tone="hot" />
          </div>
        </header>

        <MentorWorkspaceClient team={team} project={project} />
      </div>
    </>
  )
}