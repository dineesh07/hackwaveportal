import React from 'react'
import { auth } from '@/auth'
import { getTeamData } from '../team-data'
import SubmissionForm from '../SubmissionForm'
import ResultsCenter from '../ResultsCenter'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Lock } from 'lucide-react'
import styles from '../../dashboard.module.css'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function statusLabel(status: string) {
  return status.replace('_', ' ').toLowerCase();
}

export default async function TeamSubmissionPage() {
  const session = await auth()
  if (!session?.user?.id) return null;

  const teamData = await getTeamData(session.user.id, session.user.rollNo)
  if (!teamData || !teamData.team) return null

  const { project, status } = teamData

  // 1. Check if problem statement is locked
  if (!project?.problemStatementId) {
    return (
      <Card style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '640px', margin: '2rem auto', borderRadius: '16px', border: '1.5px solid rgba(255, 201, 74, 0.5)', background: 'linear-gradient(135deg, rgba(255, 201, 74, 0.08) 0%, var(--surface) 100%)' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ffc94a, #ff6b35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          margin: '0 auto 1.5rem',
          boxShadow: '0 8px 24px rgba(255, 107, 53, 0.25)'
        }}>
          <Lock size={30} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '0.75rem' }}>
          Problem Statement Required
        </h2>
        <p style={{ color: 'var(--ink-70)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
          You must lock a problem statement for your team before opening the Phase 1 project submission form. Problem statements can only be locked by the <strong>Team Leader</strong>.
        </p>
        <a
          href="/dashboard/team/problem-statements"
          style={{
            background: 'var(--flame-red)',
            color: '#fff',
            padding: '0.75rem 1.75rem',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.95rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none'
          }}
        >
          Go to Problem Statements Repository →
        </a>
      </Card>
    )
  }

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
