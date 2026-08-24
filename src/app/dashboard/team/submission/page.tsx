import React from 'react'
import { auth } from '@/auth'
import { getTeamData } from '../team-data'
import SubmissionForm from '../SubmissionForm'
import ResultsCenter from '../ResultsCenter'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Lock } from 'lucide-react'
import styles from '../../dashboard.module.css'

function statusLabel(status: string) {
  return status.replace('_', ' ').toLowerCase();
}

export default async function TeamSubmissionPage() {
  const session = await auth()
  if (!session?.user?.id) return null;

  const teamData = await getTeamData(session.user.id, session.user.rollNo)
  if (!teamData || !teamData.team) return null

  const { project, status } = teamData

  if (status === 'DRAFT' || status === 'NEEDS_REVISION') {
    return (
      <>
        {status === 'NEEDS_REVISION' && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--flame-red)', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '1rem', border: '1px solid var(--flame-red)' }}>
            <strong>Mentor requested revision:</strong> Please review your mentor's feedback in the Feedback tab and update your submission. Once done, submit again for review.
          </div>
        )}
        <SubmissionForm initialData={project} />
      </>
    )
  }

  return (
    <div>
      <Card className={styles.lockedCard}>
        <EmptyState
          icon={<Lock size={28} />}
          title="Submission Locked"
          description={`Your Phase 1 project has been submitted and is currently ${statusLabel(status)}. You can no longer make edits.`}
        />
      </Card>

      {project?.id && <ResultsCenter projectId={project.id} />}
    </div>
  )
}
