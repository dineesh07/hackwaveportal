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
          <div className={styles.tableContainer}>
            <table className={styles.table} style={{ minWidth: '650px' }}>
              <thead>
                <tr className={styles.tr}>
                  <th className={styles.th}>Team ID</th>
                  <th className={styles.th}>Team Name</th>
                  <th className={styles.th}>Project Title</th>
                  <th className={styles.th}>Track</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th} style={{ textAlign: 'center' }}>Marks</th>
                  <th className={styles.th} style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(a => {
                  const project = a.project;
                  const evaluation = project.juryEvaluations[0];
                  const evalStatus: string = evaluation?.status || 'NOT_STARTED';
                  const totalScore = evaluation?.totalScore || 0;

                  return (
                    <tr key={project.id} className={styles.tr}>
                      <td className={styles.td} style={{ fontWeight: 600 }}>{project.team.teamCode || 'N/A'}</td>
                      <td className={styles.td} style={{ fontWeight: 500 }}>{project.team.teamName}</td>
                      <td className={styles.td} style={{ color: 'var(--ink)' }}>{project.projectTitle}</td>
                      <td className={styles.td} style={{ color: 'var(--ink-60)', fontSize: '0.875rem' }}>
                        {project.track.replace(/_/g, ' ')}
                      </td>
                      <td className={styles.td}>
                        <Tag tone={evalTone(evalStatus)}>{evalLabel(evalStatus)}</Tag>
                      </td>
                      <td className={styles.td} style={{ textAlign: 'center', fontWeight: evalStatus !== 'NOT_STARTED' ? 700 : 400, color: evalStatus !== 'NOT_STARTED' ? 'var(--flame-red)' : 'var(--ink-40)' }}>
                        {evalStatus !== 'NOT_STARTED' ? `${totalScore} / 100` : '-'}
                      </td>
                      <td className={styles.td} style={{ textAlign: 'right' }}>
                        <Link href={`/dashboard/jury/project/${project.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', backgroundColor: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '6px', textDecoration: 'none', color: 'var(--ink)', fontWeight: 600, fontSize: '0.85rem', transition: 'background-color 0.2s', whiteSpace: 'nowrap' }}>
                          <Eye size={15} /> Evaluate
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
