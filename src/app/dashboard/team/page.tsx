import React from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { SidebarLayout } from '@/components/SidebarLayout'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { StatusRibbon } from '@/components/ui/StatusRibbon'
import { EmptyState } from '@/components/ui/EmptyState'
import { Clock, ClipboardList, Mic, Lock, Layers, CheckCircle2, Loader, FileCheck } from 'lucide-react'
import styles from '../dashboard.module.css'
import SubmissionForm from './SubmissionForm'
import ResultsCenter from './ResultsCenter'
import TeamTasks from './TeamTasks'

function statusLabel(status: string) {
  return status.replace('_', ' ').toLowerCase();
}

export default async function TeamDashboardPage() {
  const session = await auth()

  if (!session?.user?.id) return null;

  const team = await prisma.team.findUnique({
    where: { userId: session.user.id },
    include: {
      projects: {
        where: { phase: 1 },
        include: { coreFeatures: true, futureEnhancements: true, references: true, tasks: true, mentorFeedback: true }
      }
    }
  })

  if (!team) return null

  const project = team.projects[0] || null
  const status = project?.status || 'DRAFT'
  const pendingTasks = project?.tasks.filter(t => t.status === 'PENDING') || []

  const workflowMessage =
    status === 'SUBMITTED' ? { icon: <Clock size={18} />, text: 'Waiting for Mentor Review' }
    : status === 'REVIEWED' && pendingTasks.length > 0 ? { icon: <ClipboardList size={18} />, text: 'Please complete the assigned mentor tasks before Phase 1.' }
    : status === 'UNDER_REVIEW' ? { icon: <Mic size={18} />, text: 'Ready for Phase 1 Evaluation' }
    : null;

  return (
    <SidebarLayout role={session.user.role} userName={session.user.name || 'User'} mustChangePassword={session.user.mustChangePassword} rollNo={session.user.rollNo}>
      <div className={styles.dashboardContainer} style={{ paddingTop: 0 }}>
        <header className={styles.header} style={{ marginBottom: '1.5rem', paddingBottom: '1rem' }}>
          <div>
            <h1 className={styles.title}>Team Workspace</h1>
            <p className={styles.subtitle}>{team.teamName}</p>
          </div>
          <StatusRibbon label={`Phase 1 · ${statusLabel(status)}`} tone="hot" />
        </header>

        <section className={styles.metricsGrid}>
          <StatCard label="Current Phase" value="Phase 1" icon={<Layers size={18} />} />
          <StatCard
            label="Submission Status"
            value={status.replace('_', ' ')}
            icon={status === 'SUBMITTED' || status === 'REVIEWED' ? <CheckCircle2 size={18} /> : status === 'UNDER_REVIEW' ? <Loader size={18} /> : <FileCheck size={18} />}
            tone={status === 'SUBMITTED' || status === 'REVIEWED' ? 'success' : status === 'UNDER_REVIEW' ? 'gold' : 'default'}
          />
          <StatCard
            label="Mentor Tasks"
            value={pendingTasks.length === 0 ? 'All done' : `${pendingTasks.length} pending`}
            icon={<ClipboardList size={18} />}
            tone={pendingTasks.length === 0 ? 'success' : 'default'}
          />
        </section>

        {workflowMessage && (
          <Card className={styles.workflowBanner}>
            <span className={styles.workflowIcon}>{workflowMessage.icon}</span>
            <span>{workflowMessage.text}</span>
          </Card>
        )}

        <section>
          {status === 'DRAFT' ? (
            <SubmissionForm initialData={project} />
          ) : (
            <>
              <Card className={styles.lockedCard}>
                <EmptyState
                  icon={<Lock size={28} />}
                  title="Submission Locked"
                  description={`Your Phase 1 project has been submitted and is currently ${statusLabel(status)}. You can no longer make edits.`}
                />
              </Card>

              {project?.tasks && project.tasks.length > 0 && (
                <Card style={{ marginTop: '2rem' }}>
                  <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ClipboardList size={20} />
                    Mentor Tasks
                  </h2>
                  <TeamTasks tasks={project.tasks} />
                </Card>
              )}

              {project?.id && <ResultsCenter projectId={project.id} />}
            </>
          )}
        </section>
      </div>
    </SidebarLayout>
  )
}
