import React from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/Button'
import { StatusRibbon } from '@/components/ui/StatusRibbon'
import styles from '../../dashboard.module.css'
import AuditLogsClient from './AuditLogsClient'

const navLinks = [
  { label: 'Dashboard', href: '/dashboard/admin' },
  { label: 'User Management', href: '/dashboard/admin/users' },
  { label: 'Audit Logs', href: '/dashboard/admin/audit', active: true },
  { label: 'Platform Settings', href: '/dashboard/admin/settings' },
];

export default async function AdminAuditPage() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return <div>Unauthorized.</div>
  }

  const logs = await prisma.auditLog.findMany({
    where: {
      targetType: { not: 'PlatformSettings' }
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const actorIds = [...new Set(logs.map(l => l.actorId))]
  const actors = await prisma.user.findMany({
    where: { id: { in: actorIds } },
    select: { id: true, name: true, rollNo: true, role: true },
  })

  return (
    <>
      <div className={styles.dashboardContainer} style={{ paddingTop: 0 }}>
        <header className={styles.header} style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 className={styles.title}>Audit Logs</h1>
            <p className={styles.subtitle}>Immutable record of administrative actions</p>
          </div>
          <StatusRibbon label="Admin Only" tone="hot" />
        </header>

        <div className={styles.navLinks}>
          {navLinks.map(l => (
            <Button key={l.href} href={l.href} variant={l.active ? 'primary' : 'secondary'} size="sm">{l.label}</Button>
          ))}
        </div>

        <AuditLogsClient
          initialLogs={logs.map(l => ({
            id: l.id,
            action: l.action,
            actorId: l.actorId,
            targetType: l.targetType,
            targetId: l.targetId,
            metadata: l.metadata,
            ipAddress: l.ipAddress,
            createdAt: l.createdAt.toISOString(),
          }))}
          actors={actors.map(a => ({ id: a.id, name: a.name, rollNo: a.rollNo, role: a.role }))}
        />
      </div>
    </>
  )
}
