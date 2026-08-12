import React from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { StatusRibbon } from '@/components/ui/StatusRibbon'
import styles from '../../dashboard.module.css'
import RegistrationsClient from './RegistrationsClient'

export default async function CoordinatorRegistrationsPage() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'COORDINATOR') {
    return <div>Unauthorized.</div>
  }

  const teams = await prisma.team.findMany({
    include: {
      members: true
    },
    orderBy: {
      registeredAt: 'desc'
    }
  });

  return (
    <>
      <div className={styles.dashboardContainer} style={{ paddingTop: 0 }}>
        <header className={styles.header} style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 className={styles.title}>Registrations Viewer</h1>
            <p className={styles.subtitle}>View full registration forms and manage approvals</p>
          </div>
          <StatusRibbon label="Registrations" tone="neutral" />
        </header>

        <RegistrationsClient initialTeams={teams} />
      </div>
    </>
  )
}
