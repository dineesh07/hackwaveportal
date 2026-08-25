'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Tag } from '@/components/ui/Tag'
import { Medal, Unlock, Search, Trophy, CheckSquare, Square, Award, Plus, Trash2, Sparkles, CheckCircle2, X, Users } from 'lucide-react'
import { Input } from '@/components/ui/FormControls'
import { Modal } from '@/components/ui/Modal'
import styles from '../../dashboard.module.css'

type LockedEvaluation = {
  id: string;
  juryName: string;
  juryRollNo: string;
  totalScore: number;
  submittedAt: string | null;
  reopenReason: string | null;
};

export type LeaderboardEntry = {
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

type WinnerPlaceSlot = {
  id: string;
  rank: number;
  placeLabel: string;
  projectIds: string[]; // Supports multiple teams per place (joint winners / joint runners-up)
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

  // Phase Results Modal State
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  
  // Sorted leaderboard by score to help suggestions
  const sortedByScore = [...leaderboard].sort((a, b) => b.avgScore - a.avgScore);

  // Initialize winner slots from published data or defaults
  const [winnerSlots, setWinnerSlots] = useState<WinnerPlaceSlot[]>(() => {
    const publishedWithRank = leaderboard.filter(l => l.isPublished && l.rank && l.rank <= 3);
    
    if (publishedWithRank.length > 0) {
      // Group by rank
      const rankGroups = new Map<number, string[]>();
      publishedWithRank.forEach(item => {
        const r = item.rank!;
        const existing = rankGroups.get(r) || [];
        existing.push(item.projectId);
        rankGroups.set(r, existing);
      });

      const slots: WinnerPlaceSlot[] = [];
      const sortedRanks = Array.from(rankGroups.keys()).sort((a, b) => a - b);
      
      sortedRanks.forEach(rank => {
        slots.push({
          id: `slot-${rank}`,
          rank,
          placeLabel: rank === 1 ? '1st Place (Winner)' : rank === 2 ? '2nd Place (1st Runner-Up)' : '3rd Place (2nd Runner-Up)',
          projectIds: rankGroups.get(rank) || [],
        });
      });

      // Ensure at least 1st, 2nd, 3rd exist
      [1, 2, 3].forEach(r => {
        if (!slots.some(s => s.rank === r)) {
          slots.push({
            id: `slot-${r}`,
            rank: r,
            placeLabel: r === 1 ? '1st Place (Winner)' : r === 2 ? '2nd Place (1st Runner-Up)' : '3rd Place (2nd Runner-Up)',
            projectIds: [],
          });
        }
      });

      return slots.sort((a, b) => a.rank - b.rank);
    }

    // Default 3 slots with top-scored teams
    return [
      {
        id: 'slot-1',
        rank: 1,
        placeLabel: '1st Place (Winner)',
        projectIds: sortedByScore[0] ? [sortedByScore[0].projectId] : [],
      },
      {
        id: 'slot-2',
        rank: 2,
        placeLabel: '2nd Place (1st Runner-Up)',
        projectIds: sortedByScore[1] ? [sortedByScore[1].projectId] : [],
      },
      {
        id: 'slot-3',
        rank: 3,
        placeLabel: '3rd Place (2nd Runner-Up)',
        projectIds: sortedByScore[2] ? [sortedByScore[2].projectId] : [],
      },
    ];
  });

  // Re-sync slots when leaderboard updates
  useEffect(() => {
    const publishedWithRank = leaderboard.filter(l => l.isPublished && l.rank && l.rank <= 3);
    if (publishedWithRank.length > 0) {
      const rankGroups = new Map<number, string[]>();
      publishedWithRank.forEach(item => {
        const r = item.rank!;
        const existing = rankGroups.get(r) || [];
        existing.push(item.projectId);
        rankGroups.set(r, existing);
      });

      const slots: WinnerPlaceSlot[] = [];
      const sortedRanks = Array.from(rankGroups.keys()).sort((a, b) => a - b);
      sortedRanks.forEach(rank => {
        slots.push({
          id: `slot-${rank}`,
          rank,
          placeLabel: rank === 1 ? '1st Place (Winner)' : rank === 2 ? '2nd Place (1st Runner-Up)' : '3rd Place (2nd Runner-Up)',
          projectIds: rankGroups.get(rank) || [],
        });
      });

      [1, 2, 3].forEach(r => {
        if (!slots.some(s => s.rank === r)) {
          slots.push({
            id: `slot-${r}`,
            rank: r,
            placeLabel: r === 1 ? '1st Place (Winner)' : r === 2 ? '2nd Place (1st Runner-Up)' : '3rd Place (2nd Runner-Up)',
            projectIds: [],
          });
        }
      });

      setWinnerSlots(slots.sort((a, b) => a.rank - b.rank));
    }
  }, [leaderboard]);

  const anyPublished = leaderboard.some(l => l.isPublished);

  // Set of all currently selected project IDs across all places
  const allSelectedProjectIds = new Set(winnerSlots.flatMap(s => s.projectIds));
  const totalSelectedWinnersCount = allSelectedProjectIds.size;

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

  // Add team to a specific place slot
  const handleAddTeamToSlot = (slotId: string, projectId: string) => {
    if (!projectId) return;
    setWinnerSlots(prev => prev.map(s => {
      if (s.id === slotId) {
        if (s.projectIds.includes(projectId)) return s;
        return { ...s, projectIds: [...s.projectIds, projectId] };
      }
      // Remove from any other slot if present so a team is in only one place
      return { ...s, projectIds: s.projectIds.filter(id => id !== projectId) };
    }));
  };

  // Remove team from a place slot
  const handleRemoveTeamFromSlot = (slotId: string, projectId: string) => {
    setWinnerSlots(prev => prev.map(s => {
      if (s.id === slotId) {
        return { ...s, projectIds: s.projectIds.filter(id => id !== projectId) };
      }
      return s;
    }));
  };

  // Auto fill top 3 by highest scores
  const autoFillTopByScore = () => {
    setWinnerSlots([
      {
        id: 'slot-1',
        rank: 1,
        placeLabel: '1st Place (Winner)',
        projectIds: sortedByScore[0] ? [sortedByScore[0].projectId] : [],
      },
      {
        id: 'slot-2',
        rank: 2,
        placeLabel: '2nd Place (1st Runner-Up)',
        projectIds: sortedByScore[1] ? [sortedByScore[1].projectId] : [],
      },
      {
        id: 'slot-3',
        rank: 3,
        placeLabel: '3rd Place (2nd Runner-Up)',
        projectIds: sortedByScore[2] ? [sortedByScore[2].projectId] : [],
      },
    ]);
  };

  // Clear all selections
  const handleClearAll = () => {
    setWinnerSlots(prev => prev.map(s => ({ ...s, projectIds: [] })));
  };

  // Add custom place slot
  const addPlaceSlot = () => {
    const nextRank = winnerSlots.length + 1;
    setWinnerSlots(prev => [
      ...prev,
      {
        id: `slot-${Date.now()}`,
        rank: nextRank,
        placeLabel: `${nextRank}${getOrdinalSuffix(nextRank)} Place`,
        projectIds: [],
      }
    ]);
  };

  // Remove place slot
  const removePlaceSlot = (slotId: string) => {
    setWinnerSlots(prev => prev.filter(s => s.id !== slotId));
  };

  function getOrdinalSuffix(n: number) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  }

  const announcePhaseResults = async () => {
    // Collect all winner teams across all slots
    const winnerRanks: { projectId: string; rank: number; placeLabel: string }[] = [];
    
    winnerSlots.forEach(slot => {
      slot.projectIds.forEach(pId => {
        winnerRanks.push({
          projectId: pId,
          rank: slot.rank,
          placeLabel: slot.placeLabel,
        });
      });
    });

    if (winnerRanks.length === 0) {
      alert('Please select at least one winning team before announcing results.');
      return;
    }

    // Build confirmation summary
    const summaryLines = winnerSlots
      .filter(s => s.projectIds.length > 0)
      .map(s => {
        const teamNames = s.projectIds.map(pId => {
          const t = leaderboard.find(l => l.projectId === pId);
          return t ? `${t.teamName} (${t.teamCode || 'No ID'}, Avg: ${t.avgScore.toFixed(2)})` : 'Unknown';
        }).join(', ');
        return `• ${s.placeLabel}: ${teamNames}`;
      })
      .join('\n');

    if (!confirm(`Are you sure you want to announce the Phase Results & Winners?\n\n${summaryLines}\n\nThis will publish the leaderboard, average scores, and ranks for all teams.`)) {
      return;
    }

    setIsPublishing(true);
    try {
      const res = await fetch('/api/coordinator/publish-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'PHASE_RESULTS',
          winnerRanks,
          leaderboard: leaderboard.map(l => ({
            projectId: l.projectId,
            avgScore: l.avgScore,
          }))
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to announce phase results.');
        setIsPublishing(false);
        return;
      }

      setIsPhaseModalOpen(false);
      router.refresh();
      alert('🎉 Phase Results & Winners announced successfully! All scores, places, and rankings are now published.');
    } catch {
      alert('Failed to announce phase results.');
    }
    setIsPublishing(false);
  };

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
  };

  // Helper to get winner label for table row
  const getWinnerBadge = (entry: LeaderboardEntry) => {
    if (!entry.rank) return <span style={{ color: 'var(--ink-30)', fontSize: '0.85rem' }}>—</span>;
    if (entry.rank === 1) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.3rem 0.65rem',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
          color: '#b45309',
          border: '1px solid #f59e0b',
          boxShadow: '0 2px 4px rgba(245, 158, 11, 0.2)'
        }}>
          <Trophy size={13} fill="#b45309" /> 1st (Winner)
        </span>
      );
    }
    if (entry.rank === 2) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.3rem 0.65rem',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
          color: '#374151',
          border: '1px solid #9ca3af'
        }}>
          <Medal size={13} fill="#9ca3af" /> 2nd (Runner-Up)
        </span>
      );
    }
    if (entry.rank === 3) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.3rem 0.65rem',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
          color: '#c2410c',
          border: '1px solid #fdba74'
        }}>
          <Medal size={13} fill="#fdba74" /> 3rd (2nd Runner-Up)
        </span>
      );
    }
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.2rem 0.5rem',
        borderRadius: '6px',
        fontSize: '0.75rem',
        color: 'var(--ink-50)',
        background: 'var(--surface-sunken)',
        border: '1px solid var(--line)'
      }}>
        Rank {entry.rank}
      </span>
    );
  };

  return (
    <section>
      {/* Action Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button 
            onClick={publishShortlist} 
            variant="secondary" 
            disabled={isPublishing || selectedShortlist.size === 0}
          >
            <CheckSquare size={15} style={{ marginRight: '0.4rem' }} />
            Shortlist Selected ({selectedShortlist.size})
          </Button>

          {/* Phase Results Action Button */}
          <Button 
            onClick={() => setIsPhaseModalOpen(true)} 
            disabled={isPublishing}
            style={{
              background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              color: '#ffffff',
              border: 'none',
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              fontWeight: 700
            }}
          >
            <Trophy size={16} style={{ marginRight: '0.45rem' }} />
            {anyPublished ? 'Phase Results & Winners' : 'Phase Results'}
          </Button>

          {anyPublished && (
            <Tag tone="success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={13} /> Scores & Placements Published
            </Tag>
          )}
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
        Check rows to shortlist teams for Phase 2. Click <strong>&quot;Phase Results&quot;</strong> to configure winners (supports joint winners / multiple teams per place) and announce results.
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
              <th className={styles.th}>Winner / Place</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => {
              const isShortlistChecked = selectedShortlist.has(entry.projectId);
              const isTopThree = entry.rank && entry.rank <= 3;
              return (
                <tr 
                  key={entry.projectId} 
                  className={styles.tr} 
                  style={{ 
                    background: entry.rank === 1 
                      ? 'rgba(245, 158, 11, 0.07)' 
                      : entry.rank === 2 
                      ? 'rgba(156, 163, 175, 0.07)'
                      : entry.rank === 3
                      ? 'rgba(251, 146, 60, 0.07)'
                      : undefined 
                  }}
                >
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
                    <span className="tabular-nums" style={{ fontWeight: isTopThree ? 700 : 400 }}>{entry.rank}</span>
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
                  <td className={styles.td} style={{ color: 'var(--accent)', fontWeight: 700 }}>
                    {entry.avgScore.toFixed(2)}
                  </td>

                  {/* Evaluations */}
                  <td className={styles.td}>{entry.evalCount} / {entry.totalAssigned} Completed</td>

                  {/* Shortlisted Status */}
                  <td className={styles.td}>
                    {entry.isShortlisted
                      ? <Tag tone="success">Phase 2 ✓</Tag>
                      : <Tag tone="neutral">Not yet</Tag>
                    }
                  </td>

                  {/* Winner / Place */}
                  <td className={styles.td}>
                    {getWinnerBadge(entry)}
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

      {/* Phase Results & Multi-Team Winner Selection Modal */}
      <Modal
        open={isPhaseModalOpen}
        onClose={() => !isPublishing && setIsPhaseModalOpen(false)}
        title="Announce Phase Results & Winners"
        maxWidth={680}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.08) 0%, rgba(245, 158, 11, 0.05) 100%)',
            border: '1px solid rgba(234, 88, 12, 0.2)',
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            fontSize: '0.875rem',
            color: 'var(--ink-80)',
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            <div style={{
              background: '#ea580c',
              color: '#ffffff',
              padding: '0.4rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Trophy size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: '0.2rem' }}>
                Select Winners & Placements (Multiple Teams Supported)
              </div>
              <div>
                You can assign one or <strong>multiple teams</strong> (joint winners / joint runners-up) to any place. When you announce results, scores and rankings will be officially published.
              </div>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)' }}>
              <Users size={16} color="var(--accent)" />
              <span>{winnerSlots.length} Places Configured</span>
              <span style={{ color: 'var(--ink-40)' }}>•</span>
              <span style={{ color: totalSelectedWinnersCount > 0 ? '#ea580c' : 'var(--ink-50)' }}>
                {totalSelectedWinnersCount} Winning Team{totalSelectedWinnersCount !== 1 ? 's' : ''} Selected
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button size="sm" variant="secondary" onClick={autoFillTopByScore} disabled={isPublishing}>
                <Sparkles size={13} style={{ marginRight: '0.3rem' }} /> Auto-fill Top by Score
              </Button>
              <Button size="sm" variant="secondary" onClick={handleClearAll} disabled={isPublishing || totalSelectedWinnersCount === 0}>
                Clear
              </Button>
              <Button size="sm" variant="secondary" onClick={addPlaceSlot} disabled={isPublishing}>
                <Plus size={13} style={{ marginRight: '0.3rem' }} /> Add Place
              </Button>
            </div>
          </div>

          {/* Place Slots Container */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '0.35rem' }}>
            {winnerSlots.map((slot) => {
              const isFirst = slot.rank === 1;
              const isSecond = slot.rank === 2;
              const isThird = slot.rank === 3;

              const borderColor = isFirst ? '#f59e0b' : isSecond ? '#94a3b8' : isThird ? '#fb923c' : '#818cf8';
              const cardBg = isFirst 
                ? 'linear-gradient(135deg, rgba(254, 243, 199, 0.35) 0%, rgba(255, 251, 235, 0.8) 100%)' 
                : isSecond 
                ? 'linear-gradient(135deg, rgba(241, 245, 249, 0.5) 0%, rgba(248, 250, 252, 0.8) 100%)' 
                : isThird 
                ? 'linear-gradient(135deg, rgba(255, 237, 213, 0.35) 0%, rgba(255, 247, 237, 0.8) 100%)' 
                : 'linear-gradient(135deg, rgba(238, 242, 255, 0.4) 0%, rgba(245, 243, 255, 0.8) 100%)';
              
              const badgeBg = isFirst ? '#f59e0b' : isSecond ? '#64748b' : isThird ? '#ea580c' : '#6366f1';

              // Teams not yet in this slot (available to add)
              const availableToAdd = sortedByScore.filter(t => !slot.projectIds.includes(t.projectId));

              return (
                <div 
                  key={slot.id}
                  style={{
                    padding: '1rem 1.15rem',
                    borderRadius: '12px',
                    border: `1.5px solid ${borderColor}`,
                    background: cardBg,
                    boxShadow: isFirst ? '0 4px 12px rgba(245, 158, 11, 0.12)' : '0 2px 6px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Slot Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '20px',
                        background: badgeBg,
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        {isFirst ? <Trophy size={13} fill="#ffffff" /> : <Award size={13} />}
                        {slot.placeLabel}
                      </span>

                      {slot.projectIds.length > 1 && (
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: isFirst ? '#b45309' : '#475569',
                          background: 'rgba(255,255,255,0.7)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '12px',
                          border: '1px solid rgba(0,0,0,0.08)'
                        }}>
                          Joint ({slot.projectIds.length} Teams)
                        </span>
                      )}
                    </div>

                    {winnerSlots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePlaceSlot(slot.id)}
                        disabled={isPublishing}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--ink-40)',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          fontSize: '0.8rem'
                        }}
                        title="Remove this place category"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  {/* Selected Teams List in this Place */}
                  {slot.projectIds.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {slot.projectIds.map(pId => {
                        const team = leaderboard.find(l => l.projectId === pId);
                        if (!team) return null;
                        return (
                          <div 
                            key={pId}
                            style={{
                              background: '#ffffff',
                              border: '1px solid var(--line)',
                              borderRadius: '8px',
                              padding: '0.55rem 0.85rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                              {team.teamCode && (
                                <span style={{
                                  background: 'var(--surface-sunken)',
                                  color: 'var(--ink-70)',
                                  padding: '0.15rem 0.45rem',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  border: '1px solid var(--line)',
                                  flexShrink: 0
                                }}>
                                  {team.teamCode}
                                </span>
                              )}
                              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                <strong style={{ fontSize: '0.9rem', color: 'var(--ink)', marginRight: '0.5rem' }}>
                                  {team.teamName}
                                </strong>
                                <span style={{ fontSize: '0.8rem', color: 'var(--ink-60)' }}>
                                  — {team.projectTitle}
                                </span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                              <span style={{
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                color: '#ea580c',
                                background: 'rgba(234, 88, 12, 0.08)',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '6px'
                              }}>
                                Avg: {team.avgScore.toFixed(2)}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleRemoveTeamFromSlot(slot.id, pId)}
                                disabled={isPublishing}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--ink-40)',
                                  cursor: 'pointer',
                                  padding: '0.2rem',
                                  borderRadius: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title="Remove team from this place"
                              >
                                <X size={15} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.6)',
                      border: '1px dashed var(--line)',
                      fontSize: '0.8rem',
                      color: 'var(--ink-50)',
                      textAlign: 'center'
                    }}>
                      No teams selected for this place yet. Choose a team below.
                    </div>
                  )}

                  {/* Add Team Dropdown */}
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <select
                      value=""
                      onChange={(e) => handleAddTeamToSlot(slot.id, e.target.value)}
                      disabled={isPublishing}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid var(--line)',
                        background: '#ffffff',
                        color: 'var(--ink)',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    >
                      <option value="">+ Add {slot.projectIds.length > 0 ? 'another team (joint winner)' : 'team'} to {slot.placeLabel}...</option>
                      {availableToAdd.map((team) => {
                        const isSelectedElsewhere = allSelectedProjectIds.has(team.projectId);
                        return (
                          <option key={team.projectId} value={team.projectId}>
                            {team.teamCode ? `[${team.teamCode}] ` : ''}{team.teamName} — Score: {team.avgScore.toFixed(2)} / 100 {isSelectedElsewhere ? '(Currently selected in another place)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--line)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--ink-60)' }}>
              {totalSelectedWinnersCount > 0 ? (
                <span>Ready to announce <strong>{totalSelectedWinnersCount}</strong> team{totalSelectedWinnersCount !== 1 ? 's' : ''}</span>
              ) : (
                <span>Please select at least one winning team</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button variant="secondary" onClick={() => setIsPhaseModalOpen(false)} disabled={isPublishing}>
                Cancel
              </Button>
              <Button 
                onClick={announcePhaseResults} 
                disabled={isPublishing || totalSelectedWinnersCount === 0}
                style={{
                  background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
                }}
              >
                <Trophy size={15} style={{ marginRight: '0.4rem' }} />
                {isPublishing ? 'Announcing & Publishing...' : 'Announce & Publish Results'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

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
