import React from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { StatusRibbon } from '@/components/ui/StatusRibbon'
import styles from '../../dashboard.module.css'
import TeamsClient from './TeamsClient'

export default async function CoordinatorTeamsPage() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'COORDINATOR') {
    return <div>Unauthorized.</div>
  }

  const teams = await prisma.team.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      teamName: true,
      institution: true,
      leaderName: true,
      leaderRollNo: true,
      registrationStatus: true,
      createdAt: true,
      mentorAssignments: {
        where: { phase: 1 },
        select: { mentor: { select: { name: true } } },
      },
      projects: {
        where: { phase: 1 },
        select: {
          id: true,
          projectTitle: true,
          track: true,
          status: true,
          submittedAt: true,
          _count: {
            select: {
              mentorFeedback: true,
              tasks: true,
              privateNotes: true,
            },
          },
          tasks: {
            select: { status: true },
          },
        },
      },
    },
  });

  const rows = teams.map(t => {
    const project = t.projects[0] || null;
    return {
      teamId: t.id,
      teamName: t.teamName,
      institution: t.institution,
      leaderName: t.leaderName,
      leaderRollNo: t.leaderRollNo,
      registrationStatus: t.registrationStatus,
      createdAt: t.createdAt.toISOString(),
      projectId: project?.id || null,
      projectTitle: project?.projectTitle || 'No submission yet',
      track: project?.track || null,
      projectStatus: project?.status || 'NONE',
      submittedAt: project?.submittedAt?.toISOString() || null,
      mentorName: t.mentorAssignments?.[0]?.mentor?.name || null,
      feedbackCount: project?._count.mentorFeedback ?? 0,
      taskCount: project?._count.tasks ?? 0,
      completedTasks: project?.tasks.filter(tk => tk.status === 'COMPLETED').length ?? 0,
      noteCount: project?._count.privateNotes ?? 0,
    };
  });

  return (
    <>
      <div className={styles.dashboardContainer} style={{ paddingTop: 0 }}>
        <header className={styles.header} style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 className={styles.title}>Team Management</h1>
            <p className={styles.subtitle}>Drill into every team&apos;s project, mentor, feedback, and tasks</p>
          </div>
          <StatusRibbon label="Phase 1" tone="hot" />
        </header>

        <TeamsClient teams={rows} />
      </div>
    </>
  )
}
