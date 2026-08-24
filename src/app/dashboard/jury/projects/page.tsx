import React from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { StatusRibbon } from '@/components/ui/StatusRibbon'
import { EmptyState } from '@/components/ui/EmptyState'
import { ClipboardList, Eye } from 'lucide-react'
import Link from 'next/link'
import styles from '../../dashboard.module.css'

export default async function JuryProjectsPage() {
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
    },
    orderBy: { assignedAt: 'desc' }
  });

  const evalTone = (s: string): 'success' | 'gold' | 'danger' =>
    s === 'SUBMITTED' ? 'success' : s === 'DRAFT' ? 'gold' : 'danger';

  const evalLabel = (s: string) =>
    s === 'SUBMITTED' ? 'Completed' : s === 'DRAFT' ? 'Draft Saved' : 'Pending';

  return (
    <>
      <div className={styles.dashboardContainer} style={{ paddingTop: 0 }}>
        <header className={styles.header} style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 className={styles.title}>Assigned Projects</h1>
            <p className={styles.subtitle}>All projects assigned to you for evaluation</p>
          </div>
          <StatusRibbon label="Phase 1" tone="hot" />
        </header>

        {assignments.length > 0 ? (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--line)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--paper)', borderBottom: '1px solid var(--line)' }}>
                  <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Team ID</th>
                  <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Team Name</th>
                  <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Project Title</th>
                  <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Track</th>
                  <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Status</th>
                  <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', textAlign: 'center' }}>Marks</th>
                  <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(a => {
                  const project = a.project;
                  const evaluation = project.juryEvaluations[0];
                  const evalStatus: string = evaluation?.status || 'NOT_STARTED';
                  const totalScore = evaluation?.totalScore || 0;

                  return (
                    <tr key={project.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{project.team.teamCode || 'N/A'}</td>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>{project.team.teamName}</td>
                      <td style={{ padding: '1rem', color: 'var(--ink)' }}>{project.projectTitle}</td>
                      <td style={{ padding: '1rem', color: 'var(--ink-60)', fontSize: '0.875rem' }}>
                        {project.track.replace(/_/g, ' ')}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <Tag tone={evalTone(evalStatus)}>{evalLabel(evalStatus)}</Tag>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', fontWeight: evalStatus !== 'NOT_STARTED' ? 700 : 400, color: evalStatus !== 'NOT_STARTED' ? 'var(--flame-red)' : 'var(--ink-40)' }}>
                        {evalStatus !== 'NOT_STARTED' ? `${totalScore} / 100` : '-'}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <Link href={`/dashboard/jury/project/${project.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', backgroundColor: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '6px', textDecoration: 'none', color: 'var(--ink)', fontWeight: 500, fontSize: '0.875rem', transition: 'background-color 0.2s' }}>
                          <Eye size={16} /> Evaluate
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
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
