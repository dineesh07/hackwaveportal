'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Tag } from '@/components/ui/Tag'
import { Medal, Unlock, Search, Trophy, CheckSquare, Square } from 'lucide-react'
import { Input } from '@/components/ui/FormControls'
import styles from '../../dashboard.module.css'

type LockedEvaluation = {
  id: string;
  juryName: string;
  juryRollNo: string;
  totalScore: number;
  submittedAt: string | null;
  reopenReason: string | null;
};

type LeaderboardEntry = {
  projectId: string;
  teamName: string;
  teamCode: string | null;
  projectTitle: string;
  avgScore: number;
  evalCount: number;
  totalAssigned: number;
  isPublished: boolean;
  isShortlisted: boolean;
  rank: number | null;
  lockedEvaluations: LockedEvaluation[];
};

export default function ResultsClient({ leaderboard }: { leaderboard: LeaderboardEntry[] }) {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [reopenEval, setReopenEval] = useState<LockedEvaluation | null>(null);
  const [reopenReason, setReopenReason] = useState('');
  const [search, setSearch] = useState('');
  const [selectedShortlist, setSelectedShortlist] = useState<Set<string>>(
    new Set(leaderboard.filter(l => l.isShortlisted).map(l => l.projectId))
  );
  const [winnerId, setWinnerId] = useState<string | null>(
    leaderboard.find(l => l.rank === 1)?.projectId || null
  );

  const filtered = leaderboard.filter(entry => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (entry.teamCode?.toLowerCase().includes(q)) ||
      entry.teamName.toLowerCase().includes(q) ||
      entry.projectTitle.toLowerCase().includes(q)
    );
  });

  const toggleShortlist = (projectId: string) => {
    setSelectedShortlist(prev => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };

  const publishShortlist = async () => {
    if (selectedShortlist.size === 0) {
      alert('Please select at least one team to shortlist.');
      return;
    }
    if (!confirm(`Shortlist ${selectedShortlist.size} selected team(s) for Phase 2?`)) return;
    setIsPublishing(true);
    try {
      const shortlistedIds = Array.from(selectedShortlist);
      await fetch('/api/coordinator/publish-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shortlistedIds, action: 'SHORTLIST' })
      });
      router.refresh();
      alert(`${selectedShortlist.size} team(s) shortlisted for Phase 2.`);
    } catch {
      alert('Failed to publish shortlisting.');
    }
    setIsPublishing(false);
  }

  const publishFinal = async () => {
    if (!winnerId) {
      alert('Please select a winner before publishing final results.');
      return;
    }
    if (!confirm('This will publish the Final Public Leaderboard and reveal Winners. Proceed?')) return;
    setIsPublishing(true);
    try {
      await fetch('/api/coordinator/publish-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'FINAL', winnerId })
      });
      router.refresh();
      alert('Final Results published.');
    } catch {
      alert('Failed to publish final results.');
    }
    setIsPublishing(false);
  }

  const confirmReopen = async () => {
    if (!reopenEval) return;
    if (!reopenReason.trim()) {
      alert('A reason is required to reopen an evaluation.');
      return;
    }
    setIsPublishing(true);
    try {
      const res = await fetch('/api/coordinator/publish-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REOPEN_EVALUATION', evaluationId: reopenEval.id, reason: reopenReason.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to reopen evaluation.');
        return;
      }
      setReopenEval(null);
      setReopenReason('');
      router.refresh();
      alert('Evaluation reopened. The jury member can now edit it.');
    } catch {
      alert('Failed to reopen evaluation.');
    }
    setIsPublishing(false);
  }

  return (
    <section>
      {/* Action Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button 
            onClick={publishShortlist} 
            variant="secondary" 
            disabled={isPublishing || selectedShortlist.size === 0}
          >
            <CheckSquare size={15} style={{ marginRight: '0.4rem' }} />
            Shortlist Selected ({selectedShortlist.size})
          </Button>
          <Button onClick={publishFinal} variant="secondary" disabled={isPublishing}>
            <Trophy size={15} style={{ marginRight: '0.4rem' }} />
            Publish Final Results
          </Button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-40)' }} />
          <Input
            placeholder="Search by Team ID, name or project..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--ink-50)' }}>
        Check rows to shortlist teams for Phase 2. Click a row's trophy icon to mark as winner.
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th} style={{ width: '40px' }}>✓</th>
              <th className={styles.th}>Rank</th>
              <th className={styles.th}>Team ID</th>
              <th className={styles.th}>Team Name</th>
              <th className={styles.th}>Project Title</th>
              <th className={styles.th}>Avg Score</th>
              <th className={styles.th}>Evaluations</th>
              <th className={styles.th}>Shortlisted</th>
              <th className={styles.th}>Winner</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => {
              const isShortlistChecked = selectedShortlist.has(entry.projectId);
              const isWinner = winnerId === entry.projectId;
              return (
                <tr key={entry.projectId} className={styles.tr} style={{ background: isWinner ? 'rgba(245, 158, 11, 0.05)' : undefined }}>
                  {/* Shortlist checkbox */}
                  <td className={styles.td} onClick={() => toggleShortlist(entry.projectId)} style={{ cursor: 'pointer', textAlign: 'center' }}>
                    {isShortlistChecked
                      ? <CheckSquare size={18} style={{ color: '#0284c7' }} />
                      : <Square size={18} style={{ color: 'var(--ink-30)' }} />
                    }
                  </td>

                  {/* Rank */}
                  <td className={styles.td}>
                    {entry.rank === 1 && <Medal size={16} color="var(--flame-gold)" style={{ marginRight: '0.35rem', verticalAlign: '-2px' }} />}
                    {entry.rank === 2 && <Medal size={16} color="#9ca3af" style={{ marginRight: '0.35rem', verticalAlign: '-2px' }} />}
                    {entry.rank === 3 && <Medal size={16} color="#cd7f32" style={{ marginRight: '0.35rem', verticalAlign: '-2px' }} />}
                    <span className="tabular-nums">{entry.rank}</span>
                  </td>

                  {/* Team Code */}
                  <td className={styles.td}>
                    {entry.teamCode ? (
                      <span style={{
                        background: 'var(--surface-sunken)',
                        color: 'var(--ink-60)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '5px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        border: '1px solid var(--line)'
                      }}>
                        {entry.teamCode}
                      </span>
                    ) : <span style={{ color: 'var(--ink-30)' }}>—</span>}
                  </td>

                  {/* Team Name */}
                  <td className={styles.td}><strong>{entry.teamName}</strong></td>

                  {/* Project Title */}
                  <td className={styles.td}>{entry.projectTitle}</td>

                  {/* Avg Score */}
                  <td className={styles.td} style={{ color: 'var(--accent)', fontWeight: 700 }}>{entry.avgScore.toFixed(2)}</td>

                  {/* Evaluations */}
                  <td className={styles.td}>{entry.evalCount} / {entry.totalAssigned} Completed</td>

                  {/* Shortlisted Status */}
                  <td className={styles.td}>
                    {entry.isShortlisted
                      ? <Tag tone="success">Phase 2 ✓</Tag>
                      : <Tag tone="neutral">Not yet</Tag>
                    }
                  </td>

                  {/* Winner toggle */}
                  <td className={styles.td}>
                    <button
                      onClick={() => setWinnerId(isWinner ? null : entry.projectId)}
                      title={isWinner ? 'Remove winner' : 'Mark as winner'}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        color: isWinner ? 'var(--flame-gold)' : 'var(--ink-30)',
                        fontWeight: isWinner ? 700 : 400,
                        fontSize: '0.85rem'
                      }}
                    >
                      <Trophy size={16} fill={isWinner ? 'var(--flame-gold)' : 'none'} />
                      {isWinner ? 'Winner' : ''}
                    </button>
                  </td>

                  {/* Reopen Actions */}
                  <td className={styles.td}>
                    {entry.lockedEvaluations.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {entry.lockedEvaluations.map(e => (
                          <Button key={e.id} size="sm" variant="ghost" disabled={isPublishing} onClick={() => { setReopenEval(e); setReopenReason(''); }}>
                            <Unlock size={13} /> Reopen: {e.juryRollNo}
                          </Button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className={styles.emptyState}>No projects match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reopen Modal */}
      {reopenEval && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: '#ffffff', padding: '2rem', borderRadius: '16px',
            maxWidth: '480px', width: '100%', border: '1px solid var(--line)'
          }}>
            <h3 style={{ fontWeight: 800, marginBottom: '0.5rem', color: 'var(--ink)' }}>Reopen Evaluation</h3>
            <p style={{ color: 'var(--ink-60)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              Unlock the submitted evaluation by <strong>{reopenEval.juryName}</strong> ({reopenEval.juryRollNo}, score {reopenEval.totalScore}).
              The jury member will be able to edit and resubmit it.
            </p>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: '0.5rem' }}>
              Reason (required) <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <textarea
              value={reopenReason}
              onChange={e => setReopenReason(e.target.value)}
              rows={3}
              placeholder="e.g. Score entry error noticed during audit"
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                border: '1px solid var(--line)', outline: 'none', fontSize: '1rem',
                fontFamily: 'inherit', marginBottom: '1rem', resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setReopenEval(null)} disabled={isPublishing}>Cancel</Button>
              <Button onClick={confirmReopen} disabled={isPublishing}>
                <Unlock size={15} /> {isPublishing ? 'Reopening...' : 'Reopen Evaluation'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
