import React from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { Tag } from '@/components/ui/Tag'
import { StatusRibbon } from '@/components/ui/StatusRibbon'
import { EmptyState } from '@/components/ui/EmptyState'
import { Users, Clock, CheckCircle2, ChevronRight, User } from 'lucide-react'
import Link from 'next/link'
import styles from '../dashboard.module.css'

export default async function MentorDashboardPage() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'MENTOR') {
    return <div>Unauthorized.</div>
  }

  const assignments = await prisma.mentorAssignment.findMany({
    where: { mentorId: session.user.id },
    include: {
      team: {
        include: {
          projects: {
            where: { phase: 1 }
          }
        }
      }
    }
  });

  const totalAssigned = assignments.length;
  let submittedCount = 0;
  let reviewedCount = 0;

  const statusTone = (s: string): 'success' | 'gold' | 'neutral' =>
    s === 'REVIEWED' ? 'success' : s === 'SUBMITTED' ? 'gold' : 'neutral';

  const teamCards = assignments.map(a => {
    const project = a.team.projects[0];
    const status = project?.status || 'NOT_SUBMITTED';
    if (status === 'SUBMITTED') submittedCount++;
    if (status === 'REVIEWED') reviewedCount++;

    return (
      <Link href={`/dashboard/mentor/team/${a.team.id}`} key={a.team.id} style={{ textDecoration: 'none' }}>
        <Card interactive className={styles.juryCard}>
          <div className={styles.juryCardTop}>
            <h3>{a.team.teamName}</h3>
            <ChevronRight size={18} color="var(--ink-40)" />
          </div>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--ink)' }}>{project?.projectTitle || 'Untitled Project'}</p>
          <div className={styles.muted} style={{ marginBottom: '0.5rem' }}>Track: {project?.track.replace(/_/g, ' ') || 'N/A'}</div>
          <div className={styles.muted} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <User size={14} /> {a.team.leaderName}
          </div>
          <Tag tone={statusTone(status)}>{status.replace('_', ' ')}</Tag>
        </Card>
      </Link>
    )
  });

  return (
    <>
      <div className={styles.dashboardContainer} style={{ paddingTop: 0 }}>
        <header className={styles.header} style={{ marginBottom: '1.5rem', paddingBottom: '1rem' }}>
          <div>
            <h1 className={styles.title}>Mentor Portal</h1>
            <p className={styles.subtitle}>Welcome back, {session.user.name}</p>
          </div>
          <StatusRibbon label="Phase 1" tone="hot" />
        </header>

        <section className={styles.metricsGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2.5rem' }}>
          <StatCard label="Assigned Teams" value={totalAssigned} icon={<Users size={18} />} />
          <StatCard label="Submitted for Review" value={submittedCount} icon={<Clock size={18} />} tone="gold" />
          <StatCard label="Reviewed" value={reviewedCount} icon={<CheckCircle2 size={18} />} tone="success" />
        </section>

        <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Users size={20} color="var(--flame-red)" />
          Assigned Teams
        </h2>
        {teamCards.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            {teamCards}
          </div>
        ) : (
          <EmptyState
            icon={<Users size={28} color="var(--ink-40)" />}
            title="No teams assigned"
            description="No teams assigned to you yet."
          />
        )}
      </div>
    </>
  )
}