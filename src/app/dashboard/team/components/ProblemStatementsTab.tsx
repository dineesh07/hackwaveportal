'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { 
  Target, 
  Search, 
  X, 
  Filter, 
  Layers, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertTriangle, 
  Edit3, 
  Save, 
  ArrowRight, 
  ShieldCheck, 
  Loader2 
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { PROBLEM_STATEMENTS, DOMAIN_COLORS, ProblemStatement } from '@/data/problem-statements'
import { updateProblemStatementLimit, batchUpdateProblemStatementLimits } from '@/app/dashboard/coordinator/actions'
export { PROBLEM_STATEMENTS, DOMAIN_COLORS }
export type { ProblemStatement }

interface ProblemStatementsTabProps {
  role?: string;
  initialIsLeader?: boolean;
  initialLeaderName?: string;
  initialLockedPsId?: string | null;
  initialTeamId?: string | null;
  initialIsSubmissionCompleted?: boolean;
  initialLimits?: Record<string, number>;
  initialCounts?: Record<string, number>;
  initialTeamsByPs?: Record<string, Array<{ teamId: string; teamName: string; teamCode: string | null }>>;
}

export default function ProblemStatementsTab({
  role: propRole,
  initialIsLeader,
  initialLeaderName,
  initialLockedPsId,
  initialTeamId,
  initialIsSubmissionCompleted,
  initialLimits,
  initialCounts,
  initialTeamsByPs,
}: ProblemStatementsTabProps = {}) {
  const [selectedPS, setSelectedPS] = useState<ProblemStatement | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL')

  // Initialize limits with defaults + initialLimits
  const defaultLimits: Record<string, number> = {}
  PROBLEM_STATEMENTS.forEach(ps => {
    defaultLimits[ps.id] = initialLimits?.[ps.id] ?? 5
  })

  // Stats from database (counts, limits, team assignments, current team lock)
  const [stats, setStats] = useState<{
    counts: Record<string, number>;
    limits: Record<string, number>;
    teamsByPs: Record<string, Array<{ teamId: string; teamName: string; teamCode: string | null }>>;
    myLockedPsId: string | null;
    myTeamId: string | null;
    isSubmissionCompleted: boolean;
    isLeader: boolean;
    leaderName: string;
    role: string;
  }>({
    counts: initialCounts || {},
    limits: defaultLimits,
    teamsByPs: initialTeamsByPs || {},
    myLockedPsId: initialLockedPsId ?? null,
    myTeamId: initialTeamId ?? null,
    isSubmissionCompleted: initialIsSubmissionCompleted ?? false,
    isLeader: initialIsLeader ?? false,
    leaderName: initialLeaderName ?? '',
    role: propRole || ''
  })
  const [loading, setLoading] = useState(!initialLimits)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  
  // Coordinator edit limit states (per-item editing map)
  const [editingLimitId, setEditingLimitId] = useState<string | null>(null)
  const [editingValues, setEditingValues] = useState<Record<string, number>>({})
  const [batchLimitValue, setBatchLimitValue] = useState<number>(5)
  const [isBatchSaving, setIsBatchSaving] = useState(false)


  const loadStats = async () => {
    try {
      const res = await fetch('/api/problem-statements/stats', { cache: 'no-store' })
      const data = await res.json()
      if (res.ok) {
        setStats(prev => ({
          ...data,
          role: data.role || propRole || prev.role
        }))
      }
    } catch (err) {
      console.error('Failed to load PS stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const domains = useMemo(() => {
    const list = Array.from(new Set(PROBLEM_STATEMENTS.map(ps => ps.domain)))
    return ['ALL', ...list]
  }, [])

  const filteredPS = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return PROBLEM_STATEMENTS.filter(ps => {
      const matchesDomain = selectedDomain === 'ALL' || ps.domain === selectedDomain
      const matchesSearch = !q || (
        ps.id.toLowerCase().includes(q) ||
        ps.title.toLowerCase().includes(q) ||
        ps.domain.toLowerCase().includes(q) ||
        ps.description.toLowerCase().includes(q)
      )
      return matchesDomain && matchesSearch
    })
  }, [searchQuery, selectedDomain])

  const groupedPS = useMemo(() => {
    return filteredPS.reduce((acc, ps) => {
      if (!acc[ps.domain]) acc[ps.domain] = []
      acc[ps.domain].push(ps)
      return acc
    }, {} as Record<string, ProblemStatement[]>)
  }, [filteredPS])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedDomain('ALL')
  }

  const activeRole = stats.role || propRole || ''
  const isCoordinator = activeRole === 'COORDINATOR' || activeRole === 'ADMIN'
  const isTeam = activeRole === 'TEAM'

  // Find currently locked problem statement object
  const lockedPSObject = useMemo(() => {
    if (!stats.myLockedPsId) return null
    return PROBLEM_STATEMENTS.find(ps => ps.id === stats.myLockedPsId) || null
  }, [stats.myLockedPsId])

  // Team lock action handler (Locked PS is immutable/permanent)
  const handleLockToggle = async (ps: ProblemStatement, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!stats.isLeader) {
      alert(`Only the Team Leader (${stats.leaderName || 'Team Leader'}) can lock a problem statement for your team.`)
      return
    }
    if (stats.myLockedPsId) {
      if (stats.myLockedPsId === ps.id) {
        alert(`Problem Statement ${ps.id} is already locked for your team.\n\nNote: Once locked, your problem statement selection is permanent and cannot be changed or unlocked.`)
      } else {
        alert(`Your team has already locked Problem Statement ${stats.myLockedPsId}.\n\nNote: Problem statement selection is final and cannot be changed.`)
      }
      return
    }

    if (!confirm(`⚠️ IMPORTANT: Permanent Selection\n\nLock Problem Statement "${ps.id}: ${ps.title}" for your team?\n\nOnce locked, this choice is PERMANENT and CANNOT be changed or unlocked. Are you sure?`)) {
      return
    }

    setActionLoadingId(ps.id)
    try {
      const res = await fetch('/api/team/lock-problem-statement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemStatementId: ps.id, problemStatementTitle: ps.title, action: 'LOCK' })
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to lock problem statement.')
      } else {
        await loadStats()
        alert(`🎉 Success! Problem statement ${ps.id} is now permanently locked for your team. You can proceed with your submission.`)
      }
    } catch {
      alert('Failed to lock problem statement.')
    } finally {
      setActionLoadingId(null)
    }
  }


  // Coordinator save single PS limit (0 or >=999 means Unlimited / No Limit)
  const handleSaveLimit = async (psId: string, limitOverride?: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const newLimit = limitOverride !== undefined ? limitOverride : (editingValues[psId] ?? stats.limits[psId] ?? 5)
    if (isNaN(newLimit) || newLimit < 0) {
      alert('Limit must be 0 (for No Limit) or a positive integer.')
      return
    }

    setActionLoadingId(psId)
    // Optimistically update local limits
    setStats(prev => ({
      ...prev,
      limits: { ...prev.limits, [psId]: newLimit }
    }))
    setEditingLimitId(null)

    try {
      // 1. Call server action
      const res = await updateProblemStatementLimit(psId, newLimit)
      if (res?.error) {
        // 2. Fallback to API route
        const apiRes = await fetch('/api/coordinator/problem-statement-limit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ psId, maxLimit: newLimit })
        })
        const data = await apiRes.json()
        if (!apiRes.ok) {
          alert(data.details ? `Error: ${data.details}` : (data.error || res.error || 'Failed to update limit.'))
          await loadStats() // Revert on failure
          return
        }
      }
      await loadStats()
    } catch (err: any) {
      console.error('Failed to update limit:', err)
      alert(`Failed to update limit: ${err?.message || String(err)}`)
      await loadStats()
    } finally {
      setActionLoadingId(null)
    }
  }

  // Coordinator batch update all limits to specific number
  const handleBatchUpdateLimit = async () => {
    if (!confirm(`Set max team limit to ${batchLimitValue} for ALL ${PROBLEM_STATEMENTS.length} problem statements?`)) return
    setIsBatchSaving(true)
    const newBatchLimit = batchLimitValue

    // Optimistically update all limits
    setStats(prev => {
      const updatedLimits: Record<string, number> = { ...prev.limits }
      PROBLEM_STATEMENTS.forEach(ps => {
        updatedLimits[ps.id] = newBatchLimit
      })
      return { ...prev, limits: updatedLimits }
    })

    try {
      const res = await batchUpdateProblemStatementLimits(newBatchLimit)
      if (res?.error) {
        const apiRes = await fetch('/api/coordinator/problem-statement-limit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ defaultLimitAll: newBatchLimit })
        })
        const data = await apiRes.json()
        if (!apiRes.ok) {
          alert(data.details ? `Error: ${data.details}` : (data.error || res.error || 'Failed to batch update limits.'))
          await loadStats()
          return
        }
      }
      await loadStats()
      alert(`✓ All problem statements successfully updated to max capacity of ${newBatchLimit} teams.`)
    } catch (err: any) {
      console.error('Failed to batch update limits:', err)
      alert('Failed to batch update limits.')
      await loadStats()
    } finally {
      setIsBatchSaving(false)
    }
  }

  // Coordinator set No Limit (Unlimited) for ALL problem statements
  const handleBatchSetNoLimit = async () => {
    if (!confirm(`Remove limits and allow UNLIMITED team capacity for ALL ${PROBLEM_STATEMENTS.length} problem statements?`)) return
    setIsBatchSaving(true)

    // Optimistically set all limits to 0
    setStats(prev => {
      const updatedLimits: Record<string, number> = { ...prev.limits }
      PROBLEM_STATEMENTS.forEach(ps => {
        updatedLimits[ps.id] = 0
      })
      return { ...prev, limits: updatedLimits }
    })

    try {
      const res = await batchUpdateProblemStatementLimits(0)
      if (res?.error) {
        const apiRes = await fetch('/api/coordinator/problem-statement-limit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ defaultLimitAll: 0 })
        })
        const data = await apiRes.json()
        if (!apiRes.ok) {
          alert(data.details ? `Error: ${data.details}` : (data.error || res.error || 'Failed to set no limit.'))
          await loadStats()
          return
        }
      }
      await loadStats()
      alert('✓ All problem statements successfully updated to No Limit (Unlimited Capacity).')
    } catch (err: any) {
      console.error('Failed to set no limits:', err)
      alert('Failed to set no limits.')
      await loadStats()
    } finally {
      setIsBatchSaving(false)
    }
  }



  // Total enrolled count calculation
  const totalEnrolledTeams = useMemo(() => {
    return Object.values(stats.counts).reduce((sum, c) => sum + c, 0)
  }, [stats.counts])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <style>{`
        .ps-tab-card {
          cursor: pointer;
          border: 1.5px solid var(--line) !important;
          border-radius: 0.85rem;
          background: var(--surface);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
          box-shadow: 0 4px 15px -5px rgba(0,0,0,0.05) !important;
          position: relative;
        }
        .ps-tab-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 28px -10px rgba(0,0,0,0.12) !important;
          border-color: var(--ink-30) !important;
        }
        .ps-tab-card.locked-by-me {
          border-color: var(--success) !important;
          background: linear-gradient(180deg, rgba(31, 146, 84, 0.04) 0%, var(--surface) 100%) !important;
          box-shadow: 0 6px 20px rgba(31, 146, 84, 0.15) !important;
        }
        .ps-domain-pill {
          padding: 0.5rem 1rem;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1.5px solid var(--line);
          background: var(--surface);
          color: var(--ink-70);
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          white-space: nowrap;
        }
        .ps-domain-pill:hover {
          border-color: var(--flame-red);
          color: var(--flame-red);
        }
        .ps-domain-pill.active {
          background: var(--flame-red);
          color: #fff;
          border-color: var(--flame-red);
          box-shadow: 0 4px 12px rgba(232, 40, 63, 0.25);
        }
        .btn-lock {
          background: var(--flame-red);
          color: #fff;
          border: none;
          padding: 0.55rem 1rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          transition: all 0.2s ease;
        }
        .btn-lock:hover {
          background: #c81e3a;
          transform: scale(1.02);
        }
        .btn-unlocked {
          background: rgba(31, 146, 84, 0.12);
          color: var(--success);
          border: 1.5px solid var(--success);
          padding: 0.55rem 1rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          transition: all 0.2s ease;
        }
        .btn-unlocked:hover {
          background: rgba(31, 146, 84, 0.2);
        }
        .btn-full {
          background: var(--surface-sunken);
          color: var(--ink-40);
          border: 1px solid var(--line);
          padding: 0.55rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: not-allowed;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
        }
      `}</style>

      {/* TEAM STATUS BANNER */}
      {isTeam && (
        stats.myLockedPsId ? (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(135deg, rgba(31, 146, 84, 0.1) 0%, rgba(31, 146, 84, 0.04) 100%)',
            borderRadius: '12px',
            border: '1.5px solid rgba(31, 146, 84, 0.4)',
            boxShadow: '0 4px 16px rgba(31, 146, 84, 0.1)',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                flexShrink: 0
              }}>
                <Lock size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', background: 'var(--success)', color: '#fff', padding: '0.15rem 0.55rem', borderRadius: '12px' }}>
                    Locked & Final
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink)' }}>
                    [{stats.myLockedPsId}] {lockedPSObject?.title}
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--ink-70)', margin: 0 }}>
                  This problem statement is permanently locked for your team. You can now complete your project details in the submission form.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                href="/dashboard/team/submission"
                style={{
                  background: 'var(--flame-red)',
                  color: '#fff',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  textDecoration: 'none'
                }}
              >
                Go to Submission <ArrowRight size={16} />
              </Link>
            </div>
          </div>

        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(135deg, rgba(255, 201, 74, 0.15) 0%, rgba(255, 107, 53, 0.08) 100%)',
            borderRadius: '12px',
            border: '1.5px solid rgba(255, 201, 74, 0.5)',
            boxShadow: '0 4px 16px rgba(255, 201, 74, 0.1)'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffc94a, #ff6b35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              flexShrink: 0
            }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '0.2rem' }}>
                {stats.isLeader ? 'Please Lock Your Problem Statement' : 'Problem Statement Not Yet Locked'}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-80)', margin: 0 }}>
                {stats.isLeader 
                  ? 'Explore the statements below and click "Lock for Team" to reserve your choice. Each statement has limited slots.'
                  : `Problem statements must be locked by your Team Leader (${stats.leaderName || 'Team Leader'}). Please ask your leader to lock a statement before submitting.`}
              </p>
            </div>
          </div>
        )
      )}

      {/* COORDINATOR MANAGEMENT CONTROL PANEL */}
      {isCoordinator && (
        <Card style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(232, 40, 63, 0.04) 0%, var(--surface) 100%)', border: '1.5px solid rgba(232, 40, 63, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <ShieldCheck size={20} color="var(--flame-red)" />
                Coordinator Control: Problem Statement Quotas & Allocations
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-60)', marginTop: '0.25rem', marginBottom: 0 }}>
                Manage team capacity limits per problem statement and monitor which teams locked which challenges.
              </p>
            </div>
            
            {/* Quick Metrics */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ background: 'var(--surface)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink)' }}>
                Total PS: <span style={{ color: 'var(--flame-red)' }}>{PROBLEM_STATEMENTS.length}</span>
              </div>
              <div style={{ background: 'var(--surface)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink)' }}>
                Teams Locked: <span style={{ color: 'var(--success)' }}>{totalEnrolledTeams}</span>
              </div>
            </div>
          </div>

          {/* Batch limit controller */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '0.85rem 1.25rem', background: 'var(--surface-sunken)', borderRadius: '8px', border: '1px solid var(--line)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)' }}>
                Set Default Limit for All Problem Statements:
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={batchLimitValue}
                  onChange={(e) => setBatchLimitValue(parseInt(e.target.value, 10) || 1)}
                  style={{
                    width: '64px',
                    padding: '0.35rem 0.5rem',
                    borderRadius: '6px',
                    border: '1px solid var(--line)',
                    background: 'var(--surface)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    textAlign: 'center'
                  }}
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--ink-60)' }}>Teams / PS</span>
                <button
                  type="button"
                  onClick={handleBatchUpdateLimit}
                  disabled={isBatchSaving}
                  style={{
                    background: 'var(--flame-red)',
                    color: '#fff',
                    border: 'none',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  {isBatchSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Apply Limit to All
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBatchSetNoLimit}
              disabled={isBatchSaving}
              style={{
                background: 'var(--surface)',
                color: 'var(--ink)',
                border: '1.5px solid var(--line)',
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
              title="Remove capacity limits across all problem statements"
            >
              ♾️ Set No Limit (All PS)
            </button>
          </div>
        </Card>
      )}


      {/* Search & Domain Filter Toolbar */}
      <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
            <Layers size={22} color="var(--flame-red)" />
            Problem Statements Repository
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-60)', margin: 0 }}>
            Search by statement ID (e.g. <strong>AG001</strong>, <strong>WD001</strong>, <strong>CS001</strong>), title or keywords, or filter by domain.
          </p>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-40)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID (e.g. AG001, CS002), title, or keywords..."
            style={{
              width: '100%',
              padding: '0.85rem 2.75rem 0.85rem 2.75rem',
              borderRadius: '10px',
              border: '1.5px solid var(--line)',
              background: 'var(--surface-sunken)',
              color: 'var(--ink)',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--ink-40)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.25rem'
              }}
              title="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Domain Filter Pills */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--ink-50)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginRight: '0.25rem' }}>
            <Filter size={14} /> Domain:
          </span>
          {domains.map(d => {
            const count = d === 'ALL' 
              ? PROBLEM_STATEMENTS.length 
              : PROBLEM_STATEMENTS.filter(ps => ps.domain === d).length;
            const label = d === 'ALL' ? 'All Domains' : d;
            const isActive = selectedDomain === d;
            return (
              <button
                key={d}
                onClick={() => setSelectedDomain(d)}
                className={`ps-domain-pill ${isActive ? 'active' : ''}`}
              >
                <span>{label}</span>
                <span style={{ 
                  fontSize: '0.75rem', 
                  opacity: isActive ? 0.9 : 0.6,
                  background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--surface-sunken)',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '10px',
                  marginLeft: '0.2rem'
                }}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Active Filter Summary */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--ink-60)', borderTop: '1px solid var(--line)', paddingTop: '0.75rem' }}>
          <span>
            Showing <strong>{filteredPS.length}</strong> of {PROBLEM_STATEMENTS.length} problem statements
            {selectedDomain !== 'ALL' && ` in ${selectedDomain}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </span>
          {(searchQuery || selectedDomain !== 'ALL') && (
            <button
              onClick={clearFilters}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--flame-red)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <X size={14} /> Reset Filters
            </button>
          )}
        </div>
      </Card>
      
      {/* Problem Statement Grid by Domain */}
      {filteredPS.length > 0 ? (
        Object.entries(groupedPS).map(([domain, items]) => {
          const theme = DOMAIN_COLORS[domain] || DOMAIN_COLORS['AGENTIC & GENERATIVE AI'];
          return (
            <div key={domain} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '2px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Target size={22} style={{ color: theme.icon }} />
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--ink)' }}>{domain}</h2>
                </div>
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--ink-50)', background: 'var(--surface-sunken)', padding: '0.2rem 0.6rem', borderRadius: '12px', border: '1px solid var(--line)' }}>
                  {items.length} {items.length === 1 ? 'Challenge' : 'Challenges'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {items.map((ps) => {
                  const count = stats.counts[ps.id] || 0

                  const limit = stats.limits[ps.id] ?? 5
                  const isUnlimited = limit === 0 || limit >= 999
                  const isLockedByMe = stats.myLockedPsId === ps.id
                  const isFull = !isUnlimited && count >= limit && !isLockedByMe
                  const enrolledTeams = stats.teamsByPs[ps.id] || []
                  const isEditingThisLimit = editingLimitId === ps.id

                  return (
                    <Card 
                      key={ps.id} 
                      className={`ps-tab-card ${isLockedByMe ? 'locked-by-me' : ''}`}
                      onClick={() => setSelectedPS(ps)}
                      style={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '1.5rem',
                        position: 'relative'
                      }}
                    >
                      {/* Top Badges Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span style={{ 
                          background: theme.badgeBg, 
                          color: theme.badgeText, 
                          padding: '0.35rem 0.85rem', 
                          borderRadius: '999px', 
                          fontSize: '0.8rem', 
                          fontWeight: 800,
                          letterSpacing: '0.04em'
                        }}>
                          {ps.id}
                        </span>

                        {/* Capacity / Locked Badge */}
                        {isLockedByMe ? (
                          <span style={{ 
                            background: 'rgba(31, 146, 84, 0.15)', 
                            color: 'var(--success)', 
                            padding: '0.3rem 0.75rem', 
                            borderRadius: '999px', 
                            fontSize: '0.75rem', 
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}>
                            <CheckCircle2 size={13} /> Locked by You
                          </span>
                        ) : isFull ? (
                          <span style={{ 
                            background: 'rgba(200, 30, 58, 0.1)', 
                            color: 'var(--danger)', 
                            padding: '0.3rem 0.75rem', 
                            borderRadius: '999px', 
                            fontSize: '0.75rem', 
                            fontWeight: 800 
                          }}>
                            ● Full ({count}/{limit})
                          </span>
                        ) : (
                          <span style={{ 
                            background: 'var(--surface-sunken)', 
                            color: 'var(--ink-70)', 
                            padding: '0.3rem 0.75rem', 
                            borderRadius: '999px', 
                            fontSize: '0.75rem', 
                            fontWeight: 700, 
                            border: '1px solid var(--line)' 
                          }}>
                            {isUnlimited ? `${count} Teams (No Limit)` : `${count} / ${limit} Teams`}
                          </span>
                        )}
                      </div>

                      <h3 style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: 700, 
                        color: 'var(--ink)',
                        lineHeight: 1.4,
                        marginBottom: '0.75rem'
                      }}>
                        {ps.title}
                      </h3>

                      <p style={{
                        fontSize: '0.85rem',
                        color: 'var(--ink-60)',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        marginBottom: '1rem'
                      }}>
                        {ps.description.slice(0, 180)}...
                      </p>

                      {/* COORDINATOR CONTROLS ON CARD */}
                      {isCoordinator && (
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            background: 'var(--surface-sunken)',
                            padding: '0.85rem',
                            borderRadius: '8px',
                            border: '1px solid var(--line)',
                            marginBottom: '1rem',
                            fontSize: '0.8rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', minHeight: '32px' }}>
                            {!isEditingThisLimit ? (
                              <>
                                <span style={{ fontWeight: 700, color: 'var(--ink)' }}>
                                  Capacity Limit: <strong>{isUnlimited ? '♾️ No Limit' : `${limit} teams`}</strong>
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingLimitId(ps.id)
                                    setEditingValues(prev => ({ ...prev, [ps.id]: isUnlimited ? 0 : limit }))
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--flame-red)',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    fontSize: '0.75rem',
                                    padding: '0.2rem 0.4rem',
                                    borderRadius: '4px'
                                  }}
                                >
                                  <Edit3 size={12} /> Edit Limit
                                </button>
                              </>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.35rem', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 700, color: 'var(--flame-red)', fontSize: '0.75rem' }}>
                                  New Limit:
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
                                  <input
                                    type="number"
                                    min="0"
                                    max="500"
                                    value={editingValues[ps.id] !== undefined ? editingValues[ps.id] : (isUnlimited ? 0 : limit)}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value, 10)
                                      setEditingValues(prev => ({ ...prev, [ps.id]: isNaN(val) ? 0 : val }))
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleSaveLimit(ps.id, editingValues[ps.id] ?? limit)
                                      } else if (e.key === 'Escape') {
                                        setEditingLimitId(null)
                                      }
                                    }}
                                    autoFocus
                                    style={{
                                      width: '48px',
                                      padding: '0.2rem 0.35rem',
                                      borderRadius: '4px',
                                      border: '1.5px solid var(--flame-red)',
                                      background: 'var(--surface)',
                                      color: 'var(--ink)',
                                      fontWeight: 800,
                                      fontSize: '0.85rem',
                                      textAlign: 'center'
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSaveLimit(ps.id, 0)}
                                    style={{
                                      background: 'var(--surface)',
                                      color: 'var(--ink-70)',
                                      border: '1px solid var(--line)',
                                      padding: '0.2rem 0.4rem',
                                      borderRadius: '4px',
                                      fontWeight: 700,
                                      fontSize: '0.7rem',
                                      cursor: 'pointer'
                                    }}
                                    title="Set No Limit for this problem statement"
                                  >
                                    ♾️ No Limit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveLimit(ps.id, editingValues[ps.id] ?? limit)}
                                    disabled={actionLoadingId === ps.id}
                                    style={{
                                      background: 'var(--success)',
                                      color: '#fff',
                                      border: 'none',
                                      padding: '0.2rem 0.5rem',
                                      borderRadius: '4px',
                                      fontWeight: 700,
                                      fontSize: '0.75rem',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.2rem'
                                    }}
                                  >
                                    {actionLoadingId === ps.id ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingLimitId(null)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'var(--ink-40)',
                                      cursor: 'pointer',
                                      fontSize: '0.85rem',
                                      padding: '0.2rem 0.35rem'
                                    }}
                                    title="Cancel"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Enrolled Teams Badges */}

                          <div>
                            <span style={{ color: 'var(--ink-50)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                              Enrolled Teams ({enrolledTeams.length}):
                            </span>
                            {enrolledTeams.length > 0 ? (
                              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                {enrolledTeams.map(t => (
                                  <span 
                                    key={t.teamId}
                                    style={{
                                      background: 'var(--surface)',
                                      border: '1px solid var(--line)',
                                      padding: '0.15rem 0.5rem',
                                      borderRadius: '6px',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      color: 'var(--ink)'
                                    }}
                                  >
                                    {t.teamName} {t.teamCode ? `(${t.teamCode})` : ''}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: 'var(--ink-40)', fontStyle: 'italic', fontSize: '0.75rem' }}>No teams enrolled yet</span>
                            )}
                          </div>
                        </div>
                      )}


                      {/* CARD FOOTER ACTION */}
                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--line)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--ink-50)', fontWeight: 600 }}>
                          Click card to view details
                        </span>

                        {isTeam && (
                          isLockedByMe ? (
                            <button
                              type="button"
                              disabled
                              className="btn-unlocked"
                              style={{ cursor: 'default' }}
                            >
                              <CheckCircle2 size={15} /> Locked for Your Team
                            </button>
                          ) : stats.myLockedPsId ? (
                            <button
                              type="button"
                              disabled
                              style={{
                                background: 'var(--surface-sunken)',
                                color: 'var(--ink-40)',
                                border: '1px solid var(--line)',
                                padding: '0.4rem 0.85rem',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'not-allowed',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}
                            >
                              <Lock size={13} /> Selection Final
                            </button>
                          ) : isFull ? (
                            <button
                              type="button"
                              disabled
                              className="btn-full"
                            >
                              Capacity Full
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => handleLockToggle(ps, e)}
                              disabled={actionLoadingId === ps.id || !stats.isLeader}
                              className="btn-lock"
                              style={!stats.isLeader ? { opacity: 0.65, cursor: 'not-allowed', background: 'var(--surface-sunken)', color: 'var(--ink-60)', border: '1px solid var(--line)' } : {}}
                              title={!stats.isLeader ? `Only Team Leader (${stats.leaderName || 'Leader'}) can lock statement` : 'Lock this statement for your team (Permanent)'}
                            >
                              {actionLoadingId === ps.id ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : (
                                <Lock size={15} />
                              )}
                              {stats.isLeader ? 'Lock for Team' : 'Leader Only'}
                            </button>
                          )
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })
      ) : (
        <Card style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Search size={44} style={{ opacity: 0.35, color: 'var(--ink)' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>No Problem Statements Found</h3>
          <p style={{ color: 'var(--ink-60)', maxWidth: '450px', margin: 0, fontSize: '0.925rem' }}>
            No problem statements match your search <strong>&quot;{searchQuery}&quot;</strong> {selectedDomain !== 'ALL' && `in domain "${selectedDomain}"`}.
          </p>
          <button
            onClick={clearFilters}
            style={{
              marginTop: '0.5rem',
              background: 'var(--flame-red)',
              color: '#fff',
              border: 'none',
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Clear Search & Filters
          </button>
        </Card>
      )}

      {/* Detail Modal */}
      <Modal 
        open={!!selectedPS} 
        onClose={() => setSelectedPS(null)} 
        title={selectedPS?.title}
        maxWidth={800}
      >
        {selectedPS && (() => {
          const theme = DOMAIN_COLORS[selectedPS.domain] || DOMAIN_COLORS['AGENTIC & GENERATIVE AI']
          const count = stats.counts[selectedPS.id] || 0
          const limit = stats.limits[selectedPS.id] ?? 5
          const isUnlimited = limit === 0 || limit >= 999
          const isLockedByMe = stats.myLockedPsId === selectedPS.id
          const isFull = !isUnlimited && count >= limit && !isLockedByMe
          const enrolledTeams = stats.teamsByPs[selectedPS.id] || []

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
              {/* Modal Header details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span style={{ 
                    background: theme.badgeBg, 
                    color: theme.badgeText, 
                    padding: '0.35rem 1rem', 
                    borderRadius: '999px', 
                    fontSize: '0.85rem', 
                    fontWeight: 800 
                  }}>
                    {selectedPS.id}
                  </span>
                  <span style={{ color: 'var(--ink-50)', fontSize: '0.95rem', fontWeight: 600 }}>
                    {selectedPS.domain}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ 
                    background: isLockedByMe ? 'rgba(31, 146, 84, 0.15)' : isFull ? 'rgba(200, 30, 58, 0.1)' : 'var(--surface-sunken)', 
                    color: isLockedByMe ? 'var(--success)' : isFull ? 'var(--danger)' : 'var(--ink-70)', 
                    padding: '0.35rem 0.85rem', 
                    borderRadius: '999px', 
                    fontSize: '0.8rem', 
                    fontWeight: 800,
                    border: '1px solid var(--line)'
                  }}>
                    {isLockedByMe ? '✓ Locked by Your Team' : isFull ? `● Full (${count}/${limit})` : isUnlimited ? `Capacity: ${count} Teams (No Limit)` : `Capacity: ${count}/${limit} Teams`}
                  </span>

                  {isTeam && (
                    isLockedByMe ? (
                      <span style={{
                        background: 'rgba(31, 146, 84, 0.15)',
                        color: 'var(--success)',
                        padding: '0.4rem 0.9rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}>
                        <CheckCircle2 size={15} /> Locked (Final)
                      </span>
                    ) : stats.myLockedPsId ? (
                      <span style={{
                        background: 'var(--surface-sunken)',
                        color: 'var(--ink-50)',
                        padding: '0.4rem 0.9rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        border: '1px solid var(--line)'
                      }}>
                        Locked on {stats.myLockedPsId}
                      </span>
                    ) : isFull ? (
                      <button type="button" disabled className="btn-full">
                        Capacity Full
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleLockToggle(selectedPS)}
                        disabled={actionLoadingId === selectedPS.id || !stats.isLeader}
                        className="btn-lock"
                        style={!stats.isLeader ? { opacity: 0.65, cursor: 'not-allowed', background: 'var(--surface-sunken)', color: 'var(--ink-60)', border: '1px solid var(--line)' } : {}}
                      >
                        {actionLoadingId === selectedPS.id ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                        {stats.isLeader ? 'Lock for My Team (Permanent)' : 'Leader Only'}
                      </button>
                    )
                  )}
                </div>
              </div>


              {/* Coordinator Info in Modal */}
              {isCoordinator && (
                <div style={{ background: 'var(--surface-sunken)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)' }}>
                      Enrolled Teams ({enrolledTeams.length} {isUnlimited ? '/ ∞' : `/ ${limit}`}):
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink-70)' }}>Max Limit:</span>
                      <input
                        type="number"
                        min="0"
                        max="500"
                        value={editingValues[selectedPS.id] !== undefined ? editingValues[selectedPS.id] : (isUnlimited ? 0 : limit)}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10)
                          setEditingValues(prev => ({ ...prev, [selectedPS.id]: isNaN(val) ? 0 : val }))
                        }}
                        style={{
                          width: '50px',
                          padding: '0.2rem 0.4rem',
                          borderRadius: '4px',
                          border: '1.5px solid var(--flame-red)',
                          background: 'var(--surface)',
                          color: 'var(--ink)',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          textAlign: 'center'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveLimit(selectedPS.id, 0)}
                        style={{
                          background: 'var(--surface)',
                          color: 'var(--ink-70)',
                          border: '1px solid var(--line)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                        title="Remove limit for this problem statement"
                      >
                        ♾️ No Limit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveLimit(selectedPS.id, editingValues[selectedPS.id] ?? limit)}
                        disabled={actionLoadingId === selectedPS.id}
                        style={{
                          background: 'var(--success)',
                          color: '#fff',
                          border: 'none',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '4px',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        {actionLoadingId === selectedPS.id ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                        Save Limit
                      </button>
                    </div>
                  </div>

                  {enrolledTeams.length > 0 ? (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {enrolledTeams.map(t => (
                        <span 
                          key={t.teamId}
                          style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--line)',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: 'var(--ink)'
                          }}
                        >
                          {t.teamName} {t.teamCode ? `(${t.teamCode})` : ''}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--ink-40)', fontStyle: 'italic', fontSize: '0.85rem' }}>No teams enrolled yet</span>
                  )}
                </div>
              )}
              
              {/* Full Description / Brief */}
              <div style={{ 
                color: 'var(--ink-80)', 
                fontSize: '1.025rem', 
                lineHeight: 1.8, 
                whiteSpace: 'pre-wrap',
                background: 'var(--surface-sunken)',
                padding: '1.25rem',
                borderRadius: '8px',
                border: '1px solid var(--line)'
              }}>
                {selectedPS.description}
              </div>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
