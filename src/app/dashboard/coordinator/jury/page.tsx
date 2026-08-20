import React from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { StatusRibbon } from '@/components/ui/StatusRibbon'
import styles from '../../dashboard.module.css'
import JuryClient from './JuryClient'

export default async function CoordinatorJuryPage() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'COORDINATOR') {
    return <div>Unauthorized.</div>
  }

  const juries = await prisma.user.findMany({
    where: { role: 'JURY', status: 'ACTIVE' },
    select: { id: true, name: true, email: true, organization: true }
  });

  const projects = (await prisma.project.findMany({
    where: { phase: 1 },
    select: {
      id: true,
      projectTitle: true,
      team: { select: { teamName: true, teamCode: true } }
    }
  })).map(p => ({ id: p.id, projectTitle: p.projectTitle, teamName: p.team.teamName, team: { teamCode: p.team.teamCode } }));

  const assignments = (await prisma.juryAssignment.findMany({
    where: { phase: 1 },
    include: {
      project: { select: { projectTitle: true, team: { select: { teamName: true, teamCode: true } } } },
      jury: { select: { name: true } }
    }
  })).map(a => ({
    id: a.id,
    jury: { name: a.jury.name },
    project: { projectTitle: a.project.projectTitle, teamName: a.project.team.teamName, team: { teamCode: a.project.team.teamCode } },
  }));

  return (
    <>
      <div className={styles.dashboardContainer} style={{ paddingTop: 0 }}>
        <header className={styles.header} style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 className={styles.title}>Jury Mapping</h1>
            <p className={styles.subtitle}>Assign Jury Members to Projects for Phase 1 Evaluation</p>
          </div>
          <StatusRibbon label="Phase 1" tone="hot" />
        </header>

        <JuryClient juries={juries} projects={projects} assignments={assignments} />
      </div>
    </>
  )
}
