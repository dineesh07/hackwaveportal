import React from 'react'
import { SidebarLayout } from '@/components/SidebarLayout'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { StatusRibbon } from '@/components/ui/StatusRibbon'
import styles from '../../dashboard.module.css'
import UsersClient from './UsersClient'

export default async function AdminUsersPage() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return <div>Unauthorized.</div>
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <SidebarLayout role={session.user.role} userName={session.user.name || 'User'} mustChangePassword={session.user.mustChangePassword} rollNo={session.user.rollNo}>
      <div className={styles.dashboardContainer} style={{ paddingTop: 0 }}>
        <header className={styles.header} style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 className={styles.title}>User Management</h1>
            <p className={styles.subtitle}>Manage Accounts & Roles</p>
          </div>
          <StatusRibbon label="Admin Only" tone="hot" />
        </header>

        <UsersClient users={users} />
      </div>
    </SidebarLayout>
  )
}