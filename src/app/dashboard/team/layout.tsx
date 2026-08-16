import React from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getTeamData } from './team-data'
import { StatusRibbon } from '@/components/ui/StatusRibbon'
import { Card } from '@/components/ui/Card'
import { Clock, ClipboardList, Mic } from 'lucide-react'
import styles from '../dashboard.module.css'

function statusLabel(status: string) {
  return status.replace('_', ' ').toLowerCase();
}

export default async function TeamWorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const teamData = await getTeamData(session.user.id, session.user.rollNo)

  if (!teamData || !teamData.team) {
    return null
  }

  const { team, status, pendingTasks } = teamData

  const workflowMessage =
    status === 'SUBMITTED' ? { icon: <Clock size={18} />, text: 'Waiting for Mentor Review' }
    : status === 'REVIEWED' && pendingTasks.length > 0 ? { icon: <ClipboardList size={18} />, text: 'Please complete the assigned mentor tasks before Phase 1.' }
    : status === 'UNDER_REVIEW' ? { icon: <Mic size={18} />, text: 'Ready for Phase 1 Evaluation' }
    : null;

  return (
    <div className={styles.dashboardContainer} style={{ paddingTop: 0 }}>
      <header className={styles.header} style={{ marginBottom: '1.5rem', paddingBottom: '1rem' }}>
        <div>
          <h1 className={styles.title}>Team Workspace</h1>
          <p className={styles.subtitle} style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--ink)' }}>{team.teamName}</p>
        </div>
        <StatusRibbon label={`Phase 1 · ${statusLabel(status)}`} tone="hot" />
      </header>

      {workflowMessage && (
        <Card className={styles.workflowBanner} style={{ marginBottom: '2rem' }}>
          <span className={styles.workflowIcon}>{workflowMessage.icon}</span>
          <span>{workflowMessage.text}</span>
        </Card>
      )}

      {children}
    </div>
  )
}
