import React from 'react'
import { SidebarLayout } from '@/components/SidebarLayout'
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
        select: { team: { select: { teamName: true } } }
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

  const priorityTone = (p: string): "neutral" | "success" | "danger" | "gold" | "blue" | "accent" => p === 'HIGH' ? 'danger' : p === 'MEDIUM' ? 'gold' : 'neutral';

  return (
    <SidebarLayout role={session.user.role} userName={session.user.name || 'User'} mustChangePassword={session.user.mustChangePassword} rollNo={session.user.rollNo}>
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
            <Card className={styles.notesCard}>
              {notes.length === 0 && <p style={{ textAlign: 'center', color: 'var(--ink-60)' }}>No private notes recorded.</p>}
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {notes.map(n => (
                  <li key={n.id} className={styles.noteItem}>
                    <div className={styles.noteHeader}>
                      <strong style={{ color: 'var(--flame-red)' }}>{n.project.team.teamName}</strong>
                      <span className={styles.muted}>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap', marginBottom: '0.5rem' }}>{n.note}</p>
                    <div className={styles.muted} style={{ textAlign: 'right' }}>- {n.mentor.name}</div>
                  </li>
                ))}
              </ul>
            </Card>
          </section>

        </div>
      </div>
    </SidebarLayout>
  )
}