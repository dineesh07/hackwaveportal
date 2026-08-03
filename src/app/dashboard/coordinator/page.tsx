import React from 'react'
import { SidebarLayout } from '@/components/SidebarLayout'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { StatusRibbon } from '@/components/ui/StatusRibbon'
import { EmptyState } from '@/components/ui/EmptyState'
import { CheckCircle2, Users, UserCheck, FileCheck, CheckCheck, Clock, ClipboardList, ListChecks, AlertTriangle, UserPlus } from 'lucide-react'
import styles from '../dashboard.module.css'
import RegistrationActions from './RegistrationActions'

const navLinks = [
  { label: 'Dashboard', href: '/dashboard/coordinator', active: true },
  { label: 'Team Management', href: '/dashboard/coordinator/teams' },
  { label: 'Mentors & Reviews', href: '/dashboard/coordinator/mentors' },
  { label: 'Jury Mapping', href: '/dashboard/coordinator/jury' },
  { label: 'Monitoring', href: '/dashboard/coordinator/monitoring' },
  { label: 'Tasks & Notes', href: '/dashboard/coordinator/tasks' },
  { label: 'Leaderboard & Results', href: '/dashboard/coordinator/results' },
  { label: 'Awards', href: '/dashboard/coordinator/awards' },
];

export default async function CoordinatorDashboardPage() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'COORDINATOR') {
    return <div>Unauthorized.</div>
  }

  const totalTeams = await prisma.team.count({ where: { status: 'ACTIVE' } });
  const totalMentors = await prisma.user.count({ where: { role: 'MENTOR', status: 'ACTIVE' } });

  const projects = await prisma.project.findMany({ where: { phase: 1 }, include: { tasks: true, team: true } });

  let submittedCount = 0;
  let reviewedCount = 0;
  let pendingTasks = 0;
  let completedTasks = 0;

  const inactiveTeams: { teamName: string; status: string; reason: string }[] = [];
  // eslint-disable-next-line react-hooks/purity
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  projects.forEach(p => {
    if (p.status === 'SUBMITTED') submittedCount++;
    if (p.status === 'REVIEWED') reviewedCount++;

    p.tasks.forEach(t => {
      if (t.status === 'PENDING') pendingTasks++;
      if (t.status === 'COMPLETED') completedTasks++;
    });

    let isActive = false;
    if (p.status !== 'DRAFT' && p.submittedAt && p.submittedAt > sevenDaysAgo) isActive = true;
    p.tasks.forEach(t => { if (t.completedAt && t.completedAt > sevenDaysAgo) isActive = true; });

    if (!isActive) {
      inactiveTeams.push({
        teamName: p.team.teamName,
        status: p.status,
        reason: p.status === 'DRAFT' ? 'Has not submitted project yet.' : 'No tasks completed in the last 7 days.'
      });
    }
  });

  const pendingReviews = submittedCount;

  const pendingRegistrationTeams = await prisma.team.findMany({
    where: { registrationStatus: 'PENDING_VERIFICATION' },
    orderBy: { registeredAt: 'asc' },
    include: { members: true }
  })

  return (
    <SidebarLayout role={session.user.role} userName={session.user.name || 'User'} mustChangePassword={session.user.mustChangePassword} rollNo={session.user.rollNo}>
      <div className={styles.dashboardContainer} style={{ paddingTop: 0 }}>
        <header className={styles.header} style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 className={styles.title}>Coordinator Portal</h1>
            <p className={styles.subtitle}>System Overview & Management</p>
          </div>
          <StatusRibbon label="Phase 1 · Live" tone="hot" />
        </header>

        <div className={styles.navLinks}>
          {navLinks.map(l => (
            <Button key={l.href} href={l.href} variant={l.active ? 'primary' : 'secondary'} size="sm">{l.label}</Button>
          ))}
        </div>

        <section className={styles.metricsGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2.5rem' }}>
          <StatCard label="Total Teams" value={totalTeams} icon={<Users size={18} />} />
          <StatCard label="Total Mentors" value={totalMentors} icon={<UserCheck size={18} />} />
          <StatCard label="Submitted Projects" value={submittedCount} icon={<FileCheck size={18} />} tone="gold" />
          <StatCard label="Reviewed Projects" value={reviewedCount} icon={<CheckCheck size={18} />} tone="success" />
          <StatCard label="Pending Reviews" value={pendingReviews} icon={<Clock size={18} />} tone="danger" />
          <StatCard label="Tasks Pending" value={pendingTasks} icon={<ClipboardList size={18} />} />
          <StatCard label="Tasks Completed" value={completedTasks} icon={<ListChecks size={18} />} tone="success" />
        </section>

        <div className={styles.splitLayout}>
          <section>
            <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <UserPlus size={20} color="var(--flame-red)" />
              Registration Queue
            </h2>
            <div className={styles.tableContainer}>
              {pendingRegistrationTeams.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle2 size={28} color="var(--success)" />}
                  title="All caught up!"
                  description="No teams are currently pending verification."
                />
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Team Name</th>
                      <th className={styles.th}>Leader Name</th>
                      <th className={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRegistrationTeams.map((team) => (
                      <tr key={team.id} className={styles.tr}>
                        <td className={styles.td}><strong>{team.teamName}</strong></td>
                        <td className={styles.td}>{team.leaderName}</td>
                        <td className={styles.td}>
                          <RegistrationActions teamId={team.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          <section>
            <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <AlertTriangle size={20} color="var(--flame-orange)" />
              Teams Without Activity
            </h2>
            <Card className={styles.inactiveCard}>
              {inactiveTeams.length === 0 ? (
                <p style={{ color: 'var(--success)', fontWeight: 600 }}>All active! No inactive teams found.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {inactiveTeams.map((it, idx) => (
                    <li key={idx} className={styles.inactiveItem}>
                      <strong>{it.teamName}</strong>
                      <Tag tone="neutral">{it.status}</Tag>
                      <p className={styles.inactiveReason}>{it.reason}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </section>
        </div>
      </div>
    </SidebarLayout>
  )
}
