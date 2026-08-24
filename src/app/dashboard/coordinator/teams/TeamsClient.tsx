'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Tag } from '@/components/ui/Tag'
import { Input, Select } from '@/components/ui/FormControls'
import { Search, ChevronDown, ChevronUp, Users, FolderGit2, MessageSquareText, ListChecks, UserRound, StickyNote } from 'lucide-react'
import styles from '../../dashboard.module.css'

type TeamRow = {
  teamId: string;
  teamCode: string | null;
  teamName: string;
  institution: string | null;
  leaderName: string;
  leaderRollNo: string;
  registrationStatus: string;
  createdAt: string;
  projectId: string | null;
  projectTitle: string;
  track: string | null;
  projectStatus: string;
  submittedAt: string | null;
  mentorName: string | null;
  feedbackCount: number;
  taskCount: number;
  completedTasks: number;
  noteCount: number;
};

const statusTone = (s: string): "neutral" | "success" | "danger" | "gold" | "blue" | "accent" => {
  if (s === 'SUBMITTED' || s === 'REVIEWED' || s === 'VERIFIED' || s === 'ACCOUNT_CREATED') return 'success';
  if (s === 'DRAFT' || s === 'PENDING_VERIFICATION') return 'gold';
  if (s === 'REJECTED') return 'danger';
  return 'neutral';
};

export default function TeamsClient({ teams }: { teams: TeamRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = teams.filter(t => {
    if (statusFilter && t.projectStatus !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const haystack = `${t.teamCode || ''} ${t.teamName} ${t.leaderName} ${t.leaderRollNo} ${t.projectTitle} ${t.track || ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const toggle = (teamId: string) => setExpanded(expanded === teamId ? null : teamId);

  const exportCSV = () => {
    const headers = ['Team Code', 'Team Name', 'Leader Name', 'Leader Roll No', 'Status', 'Mentor', 'Project Title', 'Track'];
    const rows = filtered.map(t => [
      t.teamCode || 'N/A',
      t.teamName,
      t.leaderName,
      t.leaderRollNo,
      t.projectStatus,
      t.mentorName || 'Unassigned',
      t.projectTitle,
      t.track || 'N/A'
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "teams_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-40)' }} />
          <Input
            placeholder="Search team, code, leader, project, or track..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
        <div style={{ width: '220px' }}>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="NONE">No Submission</option>
          </Select>
        </div>
        <Button variant="secondary" onClick={exportCSV}>Export CSV</Button>
        <span className={styles.muted}>{filtered.length} of {teams.length} teams</span>
      </div>

      <div className={styles.tableContainer} style={{ marginBottom: 0 }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Team</th>
              <th className={styles.th}>Project</th>
              <th className={styles.th}>Track</th>
              <th className={styles.th}>Mentor</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Feedback</th>
              <th className={styles.th}>Tasks</th>
              <th className={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <React.Fragment key={t.teamId}>
                <tr className={styles.tr} onClick={() => toggle(t.teamId)} style={{ cursor: 'pointer' }}>
                  <td className={styles.td}>
                    <strong>{t.teamCode ? `${t.teamCode} - ` : ''}{t.teamName}</strong>
                    <div className={styles.muted}>{t.leaderName} · {t.leaderRollNo}</div>
                  </td>
                  <td className={styles.td}>{t.projectTitle}</td>
                  <td className={styles.td}>{t.track ? t.track.replace(/_/g, ' ') : '—'}</td>
                  <td className={styles.td}>{t.mentorName || '—'}</td>
                  <td className={styles.td}>
                    <Tag tone={statusTone(t.projectStatus)}>{t.projectStatus === 'NONE' ? 'No Submission' : t.projectStatus}</Tag>
                  </td>
                  <td className={styles.td}>{t.feedbackCount}</td>
                  <td className={styles.td}>{t.completedTasks} / {t.taskCount}</td>
                  <td className={styles.td}>
                    {expanded === t.teamId ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </td>
                </tr>
                {expanded === t.teamId && (
                  <tr className={styles.tr}>
                    <td colSpan={8} style={{ padding: '1.5rem', backgroundColor: 'var(--surface-50)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                        <div>
                          <div className={styles.drillTitle}><Users size={14} /> Team Details</div>
                          <p className={styles.drillRow}><span>Team Code</span><strong>{t.teamCode || '—'}</strong></p>
                          <p className={styles.drillRow}><span>Institution</span><strong>{t.institution || '—'}</strong></p>
                          <p className={styles.drillRow}><span>Leader</span><strong>{t.leaderName}</strong></p>
                          <p className={styles.drillRow}><span>Roll No</span><strong>{t.leaderRollNo}</strong></p>
                          <p className={styles.drillRow}><span>Registered</span><strong>{new Date(t.createdAt).toLocaleDateString()}</strong></p>
                        </div>
                        <div>
                          <div className={styles.drillTitle}><FolderGit2 size={14} /> Project</div>
                          <p className={styles.drillRow}><span>Title</span><strong>{t.projectTitle}</strong></p>
                          <p className={styles.drillRow}><span>Track</span><strong>{t.track?.replace(/_/g, ' ') || '—'}</strong></p>
                          <p className={styles.drillRow}><span>Status</span><Tag tone={statusTone(t.projectStatus)}>{t.projectStatus}</Tag></p>
                          <p className={styles.drillRow}><span>Submitted</span><strong>{t.submittedAt ? new Date(t.submittedAt).toLocaleDateString() : '—'}</strong></p>
                          {t.projectId && (
                            <div style={{ marginTop: '1rem' }}>
                              <Button size="sm" variant="secondary" onClick={() => router.push(`/dashboard/mentor/team/${t.teamId}`)} style={{ width: '100%' }}>
                                <FolderGit2 size={13} style={{ marginRight: '0.4rem' }} /> View Project Workspace
                              </Button>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className={styles.drillTitle}><MessageSquareText size={14} /> Feedback</div>
                          <p className={styles.drillRow}><span>Reviews Attended</span><strong>{t.feedbackCount}</strong></p>
                          <div className={styles.drillTitle} style={{ marginTop: '1rem' }}><ListChecks size={14} /> Tasks</div>
                          <p className={styles.drillRow}><span>Completed</span><strong>{t.completedTasks} / {t.taskCount}</strong></p>
                          <div className={styles.drillTitle} style={{ marginTop: '1rem' }}><StickyNote size={14} /> Private Notes</div>
                          <p className={styles.drillRow}><span>Entries</span><strong>{t.noteCount}</strong></p>
                        </div>
                        <div>
                          <div className={styles.drillTitle}><UserRound size={14} /> Assigned Mentor</div>
                          <p className={styles.drillRow}><span>Mentor</span><strong>{t.mentorName || 'Unassigned'}</strong></p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className={styles.emptyState}>No teams match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
