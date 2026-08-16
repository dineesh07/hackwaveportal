import React from 'react'
import { auth } from '@/auth'
import { getTeamData } from '../team-data'
import TeamTasks from '../TeamTasks'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ClipboardList, MessageSquareText } from 'lucide-react'
import styles from '../../dashboard.module.css'

export default async function TeamTasksPage() {
  const session = await auth()
  if (!session?.user?.id) return null;

  const teamData = await getTeamData(session.user.id, session.user.rollNo)
  if (!teamData || !teamData.team) return null

  const { project } = teamData

  return (
    <div>
      <Card style={{ padding: '2rem' }}>
        <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <ClipboardList size={20} /> Mentor Tasks
        </h2>
        {project?.tasks && project.tasks.length > 0 ? (
          <TeamTasks tasks={project.tasks} />
        ) : (
          <EmptyState
            icon={<ClipboardList size={28} />}
            title="No Tasks Assigned"
            description="Your mentor hasn't assigned any tasks to your team yet."
          />
        )}
      </Card>

      {project?.mentorFeedback && project.mentorFeedback.length > 0 && (
        <Card style={{ marginTop: '2rem' }}>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MessageSquareText size={20} />
            Mentor Feedback
          </h2>
          {project.mentorFeedback.map((fb: any) => (
            <div key={fb.id} className={styles.noteItem}>
              <div className={styles.noteHeader}>
                <strong style={{ color: 'var(--flame-red)' }}>Overall Feedback</strong>
                <span className={styles.muted}>{new Date(fb.createdAt).toLocaleDateString()}</span>
              </div>
              <p style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap', marginBottom: '0.75rem' }}>{fb.overallFeedback}</p>
              {fb.suggestions && (
                <>
                  <strong className={styles.muted} style={{ fontWeight: 700 }}>Suggestions</strong>
                  <p style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>{fb.suggestions}</p>
                </>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
