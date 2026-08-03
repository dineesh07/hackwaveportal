'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { UserCheck, Scale, FolderSync, Search } from 'lucide-react'
import { Input } from '@/components/ui/FormControls'
import styles from '../../dashboard.module.css'

type MentorStat = {
  id: string;
  name: string;
  rollNo: string;
  status: string;
  teamCount: number;
  submitted: number;
  reviewed: number;
  feedbackCount: number;
  pendingTasks: number;
};

type JuryStat = {
  id: string;
  name: string;
  rollNo: string;
  status: string;
  projectCount: number;
  evalCount: number;
  submittedCount: number;
  avgScore: number;
};

type SubmittedProject = {
  id: string;
  projectTitle: string;
  status: string;
  submittedAt: string | null;
  teamName: string;
};

const TABS = [
  { key: 'mentors', label: 'Mentor Monitoring' },
  { key: 'juries', label: 'Jury Monitoring' },
  { key: 'reviews', label: 'Review Queue' },
];

export default function MonitoringClient({
  mentorStats,
  juryStats,
  submittedProjects,
}: {
  mentorStats: MentorStat[];
  juryStats: JuryStat[];
  submittedProjects: SubmittedProject[];
}) {
  const [tab, setTab] = useState('mentors');
  const [search, setSearch] = useState('');

  const mentorFiltered = mentorStats.filter(m =>
    `${m.name} ${m.rollNo}`.toLowerCase().includes(search.toLowerCase())
  );
  const juryFiltered = juryStats.filter(j =>
    `${j.name} ${j.rollNo}`.toLowerCase().includes(search.toLowerCase())
  );
  const reviewFiltered = submittedProjects.filter(p =>
    `${p.projectTitle} ${p.teamName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={styles.tab}
            style={{
              ...(tab === t.key ? {
                backgroundColor: 'var(--flame-red)',
                color: '#fff',
                borderColor: 'var(--flame-red)',
              } : {}),
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '360px', marginBottom: '1.5rem', position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-40)' }} />
        <Input
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: '2.25rem' }}
        />
      </div>

      {tab === 'mentors' && (
        <Card style={{ padding: '1.5rem' }}>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <UserCheck size={20} color="var(--flame-red)" /> Mentor Workload
          </h2>
          <div className={styles.tableContainer} style={{ marginBottom: 0 }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Mentor</th>
                  <th className={styles.th}>Teams</th>
                  <th className={styles.th}>Submitted</th>
                  <th className={styles.th}>Reviewed</th>
                  <th className={styles.th}>Feedback</th>
                  <th className={styles.th}>Pending Tasks</th>
                  <th className={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {mentorFiltered.map(m => (
                  <tr key={m.id} className={styles.tr}>
                    <td className={styles.td}>
                      <strong>{m.name}</strong>
                      <div className={styles.muted}>{m.rollNo}</div>
                    </td>
                    <td className={styles.td}>{m.teamCount}</td>
                    <td className={styles.td}>{m.submitted}</td>
                    <td className={styles.td}>{m.reviewed}</td>
                    <td className={styles.td}>{m.feedbackCount}</td>
                    <td className={styles.td}>{m.pendingTasks}</td>
                    <td className={styles.td}>
                      <Tag tone={m.status === 'ACTIVE' ? 'success' : 'danger'}>{m.status}</Tag>
                    </td>
                  </tr>
                ))}
                {mentorFiltered.length === 0 && (
                  <tr><td colSpan={7} className={styles.emptyState}>No mentors found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'juries' && (
        <Card style={{ padding: '1.5rem' }}>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <Scale size={20} color="var(--flame-orange)" /> Jury Progress
          </h2>
          <div className={styles.tableContainer} style={{ marginBottom: 0 }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Jury Member</th>
                  <th className={styles.th}>Projects</th>
                  <th className={styles.th}>Evals Started</th>
                  <th className={styles.th}>Submitted</th>
                  <th className={styles.th}>Avg Score</th>
                  <th className={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {juryFiltered.map(j => (
                  <tr key={j.id} className={styles.tr}>
                    <td className={styles.td}>
                      <strong>{j.name}</strong>
                      <div className={styles.muted}>{j.rollNo}</div>
                    </td>
                    <td className={styles.td}>{j.projectCount}</td>
                    <td className={styles.td}>{j.evalCount}</td>
                    <td className={styles.td}>{j.submittedCount}</td>
                    <td className={styles.td} style={{ fontWeight: 700, color: 'var(--accent)' }}>
                      {j.submittedCount > 0 ? j.avgScore.toFixed(2) : '—'}
                    </td>
                    <td className={styles.td}>
                      <Tag tone={j.status === 'ACTIVE' ? 'success' : 'danger'}>{j.status}</Tag>
                    </td>
                  </tr>
                ))}
                {juryFiltered.length === 0 && (
                  <tr><td colSpan={6} className={styles.emptyState}>No jury members found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'reviews' && (
        <Card style={{ padding: '1.5rem' }}>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <FolderSync size={20} color="var(--flame-gold)" /> Review Queue
          </h2>
          <div className={styles.tableContainer} style={{ marginBottom: 0 }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Team</th>
                  <th className={styles.th}>Project</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {reviewFiltered.map(p => (
                  <tr key={p.id} className={styles.tr}>
                    <td className={styles.td}><strong>{p.teamName}</strong></td>
                    <td className={styles.td}>{p.projectTitle}</td>
                    <td className={styles.td}>
                      <Tag tone={p.status === 'REVIEWED' ? 'success' : 'gold'}>{p.status}</Tag>
                    </td>
                    <td className={styles.td}>{p.submittedAt ? new Date(p.submittedAt).toLocaleString() : '—'}</td>
                  </tr>
                ))}
                {reviewFiltered.length === 0 && (
                  <tr><td colSpan={4} className={styles.emptyState}>No submissions pending review.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
