import React from 'react'
import { SidebarLayout } from '@/components/SidebarLayout'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { StatusRibbon } from '@/components/ui/StatusRibbon'
import { Users, Building2, ShieldCheck, UserCog, Activity, UserRound } from 'lucide-react'
import styles from '../dashboard.module.css'

const navLinks = [
  { label: 'Dashboard', href: '/dashboard/admin', active: true },
  { label: 'User Management', href: '/dashboard/admin/users' },
  { label: 'Platform Settings', href: '/dashboard/admin/settings' },
];

const ROLE_TONES: Record<string, "neutral" | "success" | "danger" | "gold" | "blue" | "accent"> = {
  TEAM: 'gold',
  MENTOR: 'success',
  JURY: 'accent',
  COORDINATOR: 'danger',
  ADMIN: 'accent',
};

export default async function AdminDashboardPage() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return <div>Unauthorized.</div>
  }

  const totalUsers = await prisma.user.count()
  const totalTeams = await prisma.team.count()
  const activeUsers = await prisma.user.count({ where: { status: 'ACTIVE' } })

  const usersByRole = await prisma.user.groupBy({
    by: ['role'],
    _count: { role: true }
  })

  const teamsByStatus = await prisma.team.groupBy({
    by: ['registrationStatus'],
    _count: { registrationStatus: true }
  })

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 6,
  })

  return (
    <SidebarLayout role={session.user.role} userName={session.user.name || 'User'} mustChangePassword={session.user.mustChangePassword} rollNo={session.user.rollNo}>
      <div className={styles.dashboardContainer} style={{ paddingTop: 0 }}>
        <header className={styles.header} style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 className={styles.title}>Administrator Portal</h1>
            <p className={styles.subtitle}>Welcome back, {session.user.name}</p>
          </div>
          <StatusRibbon label="Platform Admin" tone="hot" />
        </header>

        <div className={styles.navLinks}>
          {navLinks.map(l => (
            <Button key={l.href} href={l.href} variant={l.active ? 'primary' : 'secondary'} size="sm">{l.label}</Button>
          ))}
        </div>

        <div className={styles.metricsGrid}>
          <StatCard label="Total Users" value={totalUsers} icon={<Users size={22} />} />
          <StatCard label="Active Accounts" value={activeUsers} icon={<UserRound size={22} />} tone="success" />
          <StatCard label="Total Teams" value={totalTeams} icon={<Building2 size={22} />} tone="gold" />
          <StatCard label="Admin Accounts" value={usersByRole.find(s => s.role === 'ADMIN')?._count.role ?? 0} icon={<ShieldCheck size={22} />} tone="danger" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <Card style={{ padding: '1.5rem' }}>
            <h2 className={styles.sectionTitle}>Users by Role</h2>
            <div>
              {usersByRole.map(stat => (
                <div key={stat.role} className={styles.taskRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UserRound size={16} style={{ color: 'var(--ink-60)' }} />
                    <strong>{stat.role}</strong>
                  </div>
                    <Tag tone={ROLE_TONES[stat.role] || 'neutral'}>{stat._count.role}</Tag>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ padding: '1.5rem' }}>
            <h2 className={styles.sectionTitle}>Teams by Status</h2>
            <div>
              {teamsByStatus.map(stat => (
                <div key={stat.registrationStatus} className={styles.taskRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={16} style={{ color: 'var(--ink-60)' }} />
                    <strong>{stat.registrationStatus.replace(/_/g, ' ')}</strong>
                  </div>
                  <Tag tone={stat.registrationStatus === 'VERIFIED' ? 'success' : stat.registrationStatus === 'PENDING_VERIFICATION' ? 'gold' : 'neutral'}>{stat._count.registrationStatus}</Tag>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card style={{ padding: '1.5rem', marginTop: '2rem' }}>
          <div className={styles.noteHeader}>
            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Recently Created Accounts</h2>
            <Button href="/dashboard/admin/users" variant="secondary" size="sm">
              <UserCog size={14} /> Manage Users
            </Button>
          </div>
          <div className={styles.tableContainer} style={{ marginBottom: 0 }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Name</th>
                  <th className={styles.th}>Roll No</th>
                  <th className={styles.th}>Email</th>
                  <th className={styles.th}>Role</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Created</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map(u => (
                  <tr key={u.id} className={styles.tr}>
                    <td className={styles.td}><strong>{u.name}</strong></td>
                    <td className={styles.td}>{u.rollNo}</td>
                    <td className={styles.td}>{u.email || '—'}</td>
                    <td className={styles.td}><Tag tone={ROLE_TONES[u.role] || 'neutral'}>{u.role}</Tag></td>
                    <td className={styles.td}><Tag tone={u.status === 'ACTIVE' ? 'success' : 'danger'}>{u.status}</Tag></td>
                    <td className={styles.td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </SidebarLayout>
  )
}