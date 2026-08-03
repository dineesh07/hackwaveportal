import React from 'react'
import { SidebarLayout } from '@/components/SidebarLayout'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { StatusRibbon } from '@/components/ui/StatusRibbon'
import styles from '../../dashboard.module.css'
import AwardsClient from './AwardsClient'

export default async function CoordinatorAwardsPage() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'COORDINATOR') {
    return <div>Unauthorized.</div>
  }

  const awards = await prisma.award.findMany();

  const projects = await prisma.project.findMany({
    where: { phase: 1 },
    include: {
      team: true,
      awards: { include: { award: true } }
    }
  });

  return (
    <SidebarLayout role={session.user.role} userName={session.user.name || 'User'} mustChangePassword={session.user.mustChangePassword} rollNo={session.user.rollNo}>
      <div className={styles.dashboardContainer} style={{ paddingTop: 0 }}>
        <header className={styles.header} style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 className={styles.title}>Awards Center</h1>
            <p className={styles.subtitle}>Manage Custom Awards</p>
          </div>
          <StatusRibbon label="Awards" tone="hot" />
        </header>

        <AwardsClient awards={awards} projects={projects} />
      </div>
    </SidebarLayout>
  )
}