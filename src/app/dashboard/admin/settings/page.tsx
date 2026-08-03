import React from 'react'
import { SidebarLayout } from '@/components/SidebarLayout'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/Button'
import { StatusRibbon } from '@/components/ui/StatusRibbon'
import styles from '../../dashboard.module.css'
import AdminSettingsClient from './AdminSettingsClient'
import { PasswordUpdateForm } from '@/components/PasswordUpdateForm'

const navLinks = [
  { label: 'Dashboard', href: '/dashboard/admin' },
  { label: 'User Management', href: '/dashboard/admin/users' },
  { label: 'Platform Settings', href: '/dashboard/admin/settings', active: true },
];

export default async function AdminSettingsPage() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return <div>Unauthorized.</div>
  }

  const settings = await prisma.platformSettings.findUnique({ where: { id: 'singleton' } })

  return (
    <SidebarLayout role={session.user.role} userName={session.user.name || 'User'} mustChangePassword={session.user.mustChangePassword} rollNo={session.user.rollNo}>
      <div className={styles.dashboardContainer} style={{ paddingTop: 0 }}>
        <header className={styles.header} style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 className={styles.title}>Settings</h1>
            <p className={styles.subtitle}>Configure Platform & Account Settings</p>
          </div>
          <StatusRibbon label="Admin Only" tone="hot" />
        </header>

        <div className={styles.navLinks}>
          {navLinks.map(l => (
            <Button key={l.href} href={l.href} variant={l.active ? 'primary' : 'secondary'} size="sm">{l.label}</Button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', maxWidth: '800px' }}>
          <section>
            <h2 className={styles.sectionTitle}>Platform Settings</h2>
            <AdminSettingsClient
              initial={{
                hackathonName: settings?.hackathonName || null,
                registrationOpen: settings?.registrationOpen ?? false,
                announcementBanner: settings?.announcementBanner || null,
                submissionDeadline: settings?.submissionDeadline ? settings.submissionDeadline.toISOString() : null,
                phase1ReviewWindowStart: settings?.phase1ReviewWindowStart ? settings.phase1ReviewWindowStart.toISOString() : null,
                phase1ReviewWindowEnd: settings?.phase1ReviewWindowEnd ? settings.phase1ReviewWindowEnd.toISOString() : null,
                evaluationWindowStart: settings?.evaluationWindowStart ? settings.evaluationWindowStart.toISOString() : null,
                evaluationWindowEnd: settings?.evaluationWindowEnd ? settings.evaluationWindowEnd.toISOString() : null,
              }}
            />
          </section>

          <section>
            <h2 className={styles.sectionTitle}>Account Settings</h2>
            <PasswordUpdateForm />
          </section>
        </div>
      </div>
    </SidebarLayout>
  )
}