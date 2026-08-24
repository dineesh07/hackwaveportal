import React from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { StatusRibbon } from '@/components/ui/StatusRibbon'
import { EmptyState } from '@/components/ui/EmptyState'
import { CheckSquare, ClipboardList, StickyNote } from 'lucide-react'
import styles from '../../dashboard.module.css'

export default async function CoordinatorTasksPage() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'COORDINATOR') {
    return <div>Unauthorized.</div>
  }

  const tasksRaw = await prisma.task.findMany({
    where: { phase: 1 },
    orderBy: { createdAt: 'desc' },
    include: {
      project: {
        select: { team: { select: { teamName: true } } }
      }
    }
  });

  const notesRaw = await prisma.mentorPrivateNote.findMany({
    where: { phase: 1 },
    orderBy: { createdAt: 'desc' },
    include: {
      project: {
        select: { team: { select: { teamName: true, teamCode: true } } }
      }
    }
  });

  const allMentors = await prisma.user.findMany({
    where: { role: 'MENTOR' },
    select: { id: true, name: true }
  });

  const getMentorName = (mentorId: string) => {
    return allMentors.find(m => m.id === mentorId)?.name || 'Unknown Mentor';
  }

  const tasks = tasksRaw.map(t => ({ ...t, mentor: { name: getMentorName(t.mentorId) } }));
  const notes = notesRaw.map(n => ({ ...n, mentor: { name: getMentorName(n.mentorId) } }));
  
  // Group notes by team
  const groupedNotes = notes.reduce((acc, note) => {
    const teamId = note.projectId; // assuming project 1:1 team mapping per phase
    if (!acc[teamId]) acc[teamId] = { team: note.project.team, notes: [] };
    acc[teamId].notes.push(note);
    return acc;
  }, {} as Record<string, { team: { teamName: string, teamCode: string | null }, notes: typeof notes }>);

  const priorityTone = (p: string): "neutral" | "success" | "danger" | "gold" | "blue" | "accent" => p === 'HIGH' ? 'danger' : p === 'MEDIUM' ? 'gold' : 'neutral';

  return (
    <>
      <div className={styles.dashboardContainer} style={{ paddingTop: 0 }}>
        <header className={styles.header} style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 className={styles.title}>Tasks & Private Notes</h1>
            <p className={styles.subtitle}>Monitor Team Progress and Mentor Communications</p>
          </div>
          <StatusRibbon label="Phase 1" tone="hot" />
        </header>

        <div className={styles.splitLayout}>

          <section>
            <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckSquare size={20} color="var(--flame-red)" />
              Task Monitoring
            </h2>
            <div className={styles.tableContainer}>
              {tasks.length === 0 ? (
                <EmptyState
                  icon={<ClipboardList size={28} color="var(--ink-40)" />}
                  title="No tasks assigned yet."
                />
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Task</th>
                      <th className={styles.th}>Team</th>
                      <th className={styles.th}>Mentor</th>
                      <th className={styles.th}>Due Date</th>
                      <th className={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((t) => (
                      <tr key={t.id} className={styles.tr}>
                        <td className={styles.td}>
                          <strong>{t.title}</strong>
                          <div style={{ marginTop: '0.375rem' }}>
                            <Tag tone={priorityTone(t.priority)}>{t.priority} Priority</Tag>
                          </div>
                        </td>
                        <td className={styles.td}>{t.project.team.teamName}</td>
                        <td className={styles.td}>{t.mentor.name}</td>
                        <td className={styles.td}>{t.dueDate?.toLocaleDateString() || 'N/A'}</td>
                        <td className={styles.td}>
                          <Tag tone={t.status === 'COMPLETED' ? 'success' : 'gold'}>{t.status}</Tag>
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
              <StickyNote size={20} color="var(--flame-orange)" />
              Private Notes
            </h2>
            <Card className={styles.notesCard} style={{ padding: '1.5rem' }}>
              {notes.length === 0 && <p style={{ textAlign: 'center', color: 'var(--ink-60)' }}>No private notes recorded.</p>}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {Object.values(groupedNotes).map((group, idx) => (
                  <details key={idx} style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--line)', overflow: 'hidden' }}>
                    <summary style={{ padding: '1rem', cursor: 'pointer', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>
                        {group.team.teamCode ? <Tag tone="neutral" style={{ marginRight: '0.5rem' }}>{group.team.teamCode}</Tag> : ''}
                        {group.team.teamName}
                      </span>
                      <Tag tone="accent">{group.notes.length} Note{group.notes.length > 1 ? 's' : ''}</Tag>
                    </summary>
                    <div style={{ padding: '1rem', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {group.notes.map(n => (
                        <div key={n.id} style={{ background: 'var(--background)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--line)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                            <strong style={{ color: 'var(--ink)' }}>{n.mentor.name}</strong>
                            <span className={styles.muted}>{new Date(n.createdAt).toLocaleString()}</span>
                          </div>
                          <p style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>{n.note}</p>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </Card>
          </section>

        </div>
      </div>
    </>
  )
}