import React from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { StatusRibbon } from '@/components/ui/StatusRibbon'
import styles from '../../dashboard.module.css'
import MentorsClient from './MentorsClient'

export default async function CoordinatorMentorsPage() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'COORDINATOR') {
    return <div>Unauthorized.</div>
  }

  const mentors = await prisma.user.findMany({
    where: { role: 'MENTOR', status: 'ACTIVE' },
    select: { id: true, name: true, email: true, organization: true }
  });

  const teamsRaw = await prisma.team.findMany({
    where: {
      status: 'ACTIVE',
      registrationStatus: { not: 'REJECTED' }
    },
    select: {
      id: true,
      teamName: true,
      teamCode: true,
      projects: {
        where: { phase: 1 },
        select: { track: true }
      }
    }
  });

  const teams = teamsRaw.map(t => ({
    id: t.id,
    teamName: t.teamName,
    teamCode: t.teamCode,
    track: t.projects[0]?.track || 'NO_TRACK'
  }));

  const assignments = await prisma.mentorAssignment.findMany({
    where: { phase: 1 },
    include: {
      team: { select: { teamName: true, teamCode: true } },
      mentor: { select: { name: true } }
    }
  });

  return (
    <>
      <div className={styles.dashboardContainer} style={{ paddingTop: 0 }}>
        <header className={styles.header} style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 className={styles.title}>Mentors & Reviews</h1>
            <p className={styles.subtitle}>Map Mentors to Teams for Phase 1</p>
          </div>
          <StatusRibbon label="Phase 1" tone="hot" />
        </header>

        <MentorsClient mentors={mentors} teams={teams} assignments={assignments} />
      </div>
    </>
  )
}