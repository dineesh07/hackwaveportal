'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Tag } from '@/components/ui/Tag'
import { Medal, Unlock } from 'lucide-react'
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
  projectTitle: string;
  avgScore: number;
  evalCount: number;
  totalAssigned: number;
  isPublished: boolean;
  rank: number | null;
  lockedEvaluations: LockedEvaluation[];
};

export default function ResultsClient({ leaderboard }: { leaderboard: LeaderboardEntry[] }) {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [reopenEval, setReopenEval] = useState<LockedEvaluation | null>(null);
  const [reopenReason, setReopenReason] = useState('');

  const anyPublished = leaderboard.some(l => l.isPublished);

  const publishPhase1 = async () => {
    if (!confirm("Are you sure you want to publish Phase 1 Results? This will make scores visible to teams.")) return;
    setIsPublishing(true);
    try {
      await fetch('/api/coordinator/publish-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaderboard, action: 'PHASE_1' })
      });
      router.refresh();
      alert("Phase 1 Results published successfully.");
    } catch {
      alert("Failed to publish results.");
    }
    setIsPublishing(false);
  }

  const publishShortlist = async () => {
    if (!confirm("This will shortlist the top 50% of the leaderboard. Proceed?")) return;
    setIsPublishing(true);
    try {
      const topN = Math.max(1, Math.floor(leaderboard.length / 2));
      const shortlistedIds = leaderboard.slice(0, topN).map(l => l.projectId);

      await fetch('/api/coordinator/publish-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shortlistedIds, action: 'SHORTLIST' })
      });
      router.refresh();
      alert("Shortlisted teams published.");
    } catch {
      alert("Failed to publish shortlisting.");
    }
    setIsPublishing(false);
  }

  const publishFinal = async () => {
    if (!confirm("This will publish the Final Public Leaderboard and reveal Winners. Proceed?")) return;
    setIsPublishing(true);
    try {
      await fetch('/api/coordinator/publish-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'FINAL' })
      });
      router.refresh();
      alert("Final Results published.");
    } catch {
      alert("Failed to publish final results.");
    }
    setIsPublishing(false);
  }

  const confirmReopen = async () => {
    if (!reopenEval) return;
    if (!reopenReason.trim()) {
      alert("A reason is required to reopen an evaluation.");
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
        alert(data.error || "Failed to reopen evaluation.");
        return;
      }
      setReopenEval(null);
      setReopenReason('');
      router.refresh();
      alert("Evaluation reopened. The jury member can now edit it.");
    } catch {
      alert("Failed to reopen evaluation.");
    }
    setIsPublishing(false);
  }

  return (
    <section>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <Button onClick={publishPhase1} disabled={isPublishing || anyPublished}>Publish Phase 1 Results</Button>
        <Button onClick={publishShortlist} variant="secondary" disabled={isPublishing}>Publish Shortlisted Teams</Button>
        <Button onClick={publishFinal} variant="secondary" disabled={isPublishing}>Publish Final Results</Button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Rank</th>
              <th className={styles.th}>Team Name</th>
              <th className={styles.th}>Project Title</th>
              <th className={styles.th}>Avg Score</th>
              <th className={styles.th}>Evaluations</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry) => (
              <tr key={entry.projectId} className={styles.tr}>
                <td className={styles.td}>
                  {entry.rank === 1 && <Medal size={16} color="var(--flame-gold)" style={{ marginRight: '0.35rem', verticalAlign: '-2px' }} />}
                  {entry.rank === 2 && <Medal size={16} color="#9ca3af" style={{ marginRight: '0.35rem', verticalAlign: '-2px' }} />}
                  {entry.rank === 3 && <Medal size={16} color="#cd7f32" style={{ marginRight: '0.35rem', verticalAlign: '-2px' }} />}
                  <span className="tabular-nums">{entry.rank}</span>
                </td>
                <td className={styles.td}><strong>{entry.teamName}</strong></td>
                <td className={styles.td}>{entry.projectTitle}</td>
                <td className={styles.td} style={{ color: 'var(--accent)', fontWeight: 700 }}>{entry.avgScore.toFixed(2)}</td>
                <td className={styles.td}>{entry.evalCount} / {entry.totalAssigned} Completed</td>
                <td className={styles.td}>
                  {entry.isPublished ? <Tag tone="success">Published</Tag> : <Tag tone="neutral">Pending</Tag>}
                </td>
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
            ))}
            {leaderboard.length === 0 && (
              <tr><td colSpan={7} className={styles.emptyState}>No projects available for evaluation yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

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
