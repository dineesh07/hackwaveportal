import React from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { Tag } from '@/components/ui/Tag'
import { StatusRibbon } from '@/components/ui/StatusRibbon'
import { EmptyState } from '@/components/ui/EmptyState'
import { ClipboardList, Clock, CheckCircle2, Layers, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import styles from '../dashboard.module.css'

export default async function JuryDashboardPage() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'JURY') {
    return <div>Unauthorized.</div>
  }

  const assignments = await prisma.juryAssignment.findMany({
    where: { juryId: session.user.id },
    include: {
      project: {
        include: {
          team: true,
          juryEvaluations: { where: { juryId: session.user.id } }
        }
      }
    }
  });

  let pendingCount = 0;
  let completedCount = 0;

  const evalTone = (s: string): 'success' | 'gold' | 'danger' =>
    s === 'SUBMITTED' ? 'success' : s === 'DRAFT' ? 'gold' : 'danger';

  const evalLabel = (s: string) =>
    s === 'SUBMITTED' ? 'Completed' : s === 'DRAFT' ? 'Draft Saved' : 'Pending Evaluation';

  const projectCards = assignments.map(a => {
    const project = a.project;
    const evaluation = project.juryEvaluations[0];
    const evalStatus = evaluation?.status || 'NOT_STARTED';

    if (evalStatus === 'SUBMITTED') completedCount++;
    else pendingCount++;

    return (
      <Link href={`/dashboard/jury/project/${project.id}`} key={project.id} style={{ textDecoration: 'none' }}>
        <Card interactive className={styles.juryCard}>
          <div className={styles.juryCardTop}>
            <h3>{project.team.teamName}</h3>
            <ChevronRight size={18} color="var(--ink-40)" />
          </div>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--ink)' }}>{project.projectTitle}</p>
          <div className={styles.muted} style={{ marginBottom: '1rem' }}>Track: {project.track.replace(/_/g, ' ')}</div>
          <Tag tone={evalTone(evalStatus)}>{evalLabel(evalStatus)}</Tag>
        </Card>
      </Link>
    )
  });

  return (
    <>
      <div className={styles.dashboardContainer} style={{ paddingTop: 0 }}>
        <header className={styles.header} style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 className={styles.title}>Jury Portal</h1>
            <p className={styles.subtitle}>Welcome back, {session.user.name}</p>
          </div>
          <StatusRibbon label="Phase 1" tone="hot" />
        </header>

        <section className={styles.metricsGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2.5rem' }}>
          <StatCard label="Assigned Projects" value={assignments.length} icon={<ClipboardList size={18} />} />
          <StatCard label="Pending Evaluations" value={pendingCount} icon={<Clock size={18} />} tone="danger" />
          <StatCard label="Completed Evaluations" value={completedCount} icon={<CheckCircle2 size={18} />} tone="success" />
          <StatCard label="Current Phase" value="Phase 1" icon={<Layers size={18} />} />
        </section>

        <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ClipboardList size={20} color="var(--flame-red)" />
          Assigned Projects
        </h2>
        {projectCards.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            {projectCards}
          </div>
        ) : (
          <EmptyState
            icon={<ClipboardList size={28} color="var(--ink-40)" />}
            title="No projects assigned"
            description="No projects assigned for evaluation yet."
          />
        )}
      </div>
    </>
  )
}