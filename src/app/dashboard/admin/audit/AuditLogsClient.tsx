'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { Select, Input } from '@/components/ui/FormControls'
import { ScrollText, Calendar } from 'lucide-react'
import styles from '../../dashboard.module.css'

type AuditLogItem = {
  id: string;
  action: string;
  actorId: string;
  targetType: string | null;
  targetId: string | null;
  metadata: unknown;
  ipAddress: string | null;
  createdAt: string;
};

type Actor = {
  id: string;
  name: string;
  rollNo: string;
  role: string;
};

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'USER_CREATE', label: 'User Created' },
  { value: 'USER_UPDATE_ROLE', label: 'User Role Changed' },
  { value: 'USER_UPDATE_STATUS', label: 'User Status Changed' },
  { value: 'USER_RESET_PASSWORD', label: 'Password Reset' },
  { value: 'USER_DELETE', label: 'User Deleted' },
  { value: 'SETTINGS_UPDATE', label: 'Platform Settings Updated' },
  { value: 'MENTOR_ASSIGN', label: 'Mentor Assigned' },
  { value: 'MENTOR_UNASSIGN', label: 'Mentor Unassigned' },
  { value: 'AWARD_CREATE', label: 'Award Created' },
  { value: 'AWARD_ASSIGN', label: 'Award Assigned' },
  { value: 'AWARD_UNASSIGN', label: 'Award Unassigned' },
  { value: 'AWARD_DELETE', label: 'Award Deleted' },
  { value: 'PUBLISH_AWARDS', label: 'Awards Published' },
  { value: 'PUBLISH_PHASE1_SCORES', label: 'Phase 1 Scores Published' },
  { value: 'PUBLISH_SHORTLIST', label: 'Shortlist Published' },
  { value: 'PUBLISH_FINAL_RESULTS', label: 'Final Results Published' },
];

const ACTION_TONES: Record<string, "neutral" | "success" | "danger" | "gold" | "blue" | "accent"> = {
  USER_DELETE: 'danger',
  USER_RESET_PASSWORD: 'danger',
  USER_UPDATE_STATUS: 'neutral',
  USER_UPDATE_ROLE: 'blue',
  USER_CREATE: 'success',
  SETTINGS_UPDATE: 'blue',
  MENTOR_ASSIGN: 'success',
  MENTOR_UNASSIGN: 'danger',
  AWARD_CREATE: 'success',
  AWARD_ASSIGN: 'gold',
  AWARD_UNASSIGN: 'danger',
  AWARD_DELETE: 'danger',
  PUBLISH_AWARDS: 'gold',
  PUBLISH_PHASE1_SCORES: 'gold',
  PUBLISH_SHORTLIST: 'gold',
  PUBLISH_FINAL_RESULTS: 'gold',
};

function formatMetadata(metadata: unknown): string {
  if (!metadata) return '—';
  try {
    return JSON.stringify(metadata);
  } catch {
    return '—';
  }
}

export default function AuditLogsClient({ initialLogs, actors }: { initialLogs: AuditLogItem[]; actors: Actor[] }) {
  const [actionFilter, setActionFilter] = useState('');
  const [search, setSearch] = useState('');

  const actorMap = new Map(actors.map(a => [a.id, a]));

  const filtered = initialLogs.filter(l => {
    if (actionFilter && l.action !== actionFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const actor = actorMap.get(l.actorId);
      const haystack = `${l.action} ${l.targetType || ''} ${actor?.name || ''} ${actor?.rollNo || ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return (
    <Card style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ width: '240px' }}>
          <Select value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
            {ACTION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </div>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <Input placeholder="Search by actor, action, or target..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.muted} style={{ padding: '2rem', textAlign: 'center' }}>
          <ScrollText size={32} style={{ opacity: 0.3, margin: '0 auto 0.75rem' }} />
          No audit entries match your filters.
        </div>
      ) : (
        <div className={styles.tableContainer} style={{ marginBottom: 0 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Action</th>
                <th className={styles.th}>Actor</th>
                <th className={styles.th}>Target</th>
                <th className={styles.th}>Metadata</th>
                <th className={styles.th}>IP</th>
                <th className={styles.th}>When</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => {
                const actor = actorMap.get(l.actorId);
                return (
                  <tr key={l.id} className={styles.tr}>
                    <td className={styles.td}>
                      <Tag tone={ACTION_TONES[l.action] || 'neutral'}>{l.action.replace(/_/g, ' ')}</Tag>
                    </td>
                    <td className={styles.td}>
                      <strong>{actor?.name || 'Deleted User'}</strong>
                      <div className={styles.muted}>{actor?.rollNo || l.actorId.slice(0, 8)}</div>
                    </td>
                    <td className={styles.td}>
                      {l.targetType || '—'}
                      {l.targetId && <div className={styles.muted}>{l.targetId.slice(0, 12)}...</div>}
                    </td>
                    <td className={styles.td}><code style={{ fontSize: '0.75rem', color: 'var(--ink-60)' }}>{formatMetadata(l.metadata)}</code></td>
                    <td className={styles.td}>{l.ipAddress || '—'}</td>
                    <td className={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={13} style={{ color: 'var(--ink-60)' }} />
                        {new Date(l.createdAt).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
