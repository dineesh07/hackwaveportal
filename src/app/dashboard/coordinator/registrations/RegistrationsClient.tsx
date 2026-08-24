'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Search, Eye, Filter, CheckSquare } from 'lucide-react'
import RegistrationActions from '../RegistrationActions'
import RegistrationModal from './RegistrationModal'
import { bulkApproveTeams } from '../actions'
import { Team, TeamMember } from '@/generated/prisma/client'

type FullTeam = Team & { members: TeamMember[] }

export default function RegistrationsClient({ initialTeams }: { initialTeams: FullTeam[] }) {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<FullTeam | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const router = useRouter();

  const filteredTeams = initialTeams.filter(t => {
    let matchesStatus = false;
    if (filter === 'ALL') matchesStatus = true;
    else if (filter === 'PENDING') matchesStatus = t.registrationStatus === 'PENDING_VERIFICATION';
    else if (filter === 'APPROVED') matchesStatus = t.registrationStatus === 'ACCOUNT_CREATED' || t.registrationStatus === 'VERIFIED';
    else if (filter === 'REJECTED') matchesStatus = t.registrationStatus === 'REJECTED';

    const matchesSearch = t.teamName.toLowerCase().includes(search.toLowerCase()) || 
                          t.leaderName.toLowerCase().includes(search.toLowerCase()) || 
                          (t.institution && t.institution.toLowerCase().includes(search.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    const confirmed = confirm(`Are you sure you want to approve ${selectedIds.length} team(s)?`);
    if (!confirmed) return;

    setBulkLoading(true);
    const res = await bulkApproveTeams(selectedIds);
    setBulkLoading(false);

    if (res?.error) {
      alert(res.error);
    } else {
      alert(`Successfully approved ${res.successful} team(s). Failed: ${res.failed}.`);
      setSelectedIds([]);
      router.refresh();
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTeams.filter(t => t.registrationStatus === 'PENDING_VERIFICATION').length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTeams.filter(t => t.registrationStatus === 'PENDING_VERIFICATION').map(t => t.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Filters Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        backgroundColor: '#ffffff', 
        padding: '0.75rem 1rem', 
        borderRadius: '12px', 
        border: '1px solid var(--line)' 
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant={filter === 'PENDING' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('PENDING')}>
            Pending ({initialTeams.filter(t => t.registrationStatus === 'PENDING_VERIFICATION').length})
          </Button>
          <Button variant={filter === 'APPROVED' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('APPROVED')}>
            Approved ({initialTeams.filter(t => t.registrationStatus === 'ACCOUNT_CREATED' || t.registrationStatus === 'VERIFIED').length})
          </Button>
          <Button variant={filter === 'REJECTED' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('REJECTED')}>
            Rejected ({initialTeams.filter(t => t.registrationStatus === 'REJECTED').length})
          </Button>
          <Button variant={filter === 'ALL' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('ALL')}>
            All ({initialTeams.length})
          </Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', color: 'var(--ink-40)' }} />
          <input 
            type="text" 
            placeholder="Search teams..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ 
              padding: '0.5rem 1rem 0.5rem 2.5rem', 
              borderRadius: '8px', 
              border: '1px solid var(--line)', 
              outline: 'none' 
            }}
          />
        </div>
      </div>
      {selectedIds.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(31, 146, 84, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--success)' }}>
          <span style={{ fontWeight: 600, color: 'var(--success)' }}>{selectedIds.length} team(s) selected</span>
          <Button variant="success" onClick={handleBulkApprove} disabled={bulkLoading}>
            <CheckSquare size={16} style={{ marginRight: '0.5rem' }} />
            {bulkLoading ? 'Approving...' : 'Bulk Approve'}
          </Button>
        </div>
      )}

      {/* Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--line)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--paper)', borderBottom: '1px solid var(--line)' }}>
              <th style={{ padding: '1rem', width: '40px' }}>
                <input 
                  type="checkbox" 
                  onChange={toggleSelectAll} 
                  checked={selectedIds.length > 0 && selectedIds.length === filteredTeams.filter(t => t.registrationStatus === 'PENDING_VERIFICATION').length}
                  disabled={filteredTeams.filter(t => t.registrationStatus === 'PENDING_VERIFICATION').length === 0}
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Team Name</th>
              <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Leader</th>
              <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Institution</th>
              <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Date</th>
              <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeams.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink-60)' }}>
                  No teams found.
                </td>
              </tr>
            ) : (
              filteredTeams.map(team => (
                <tr key={team.id} style={{ borderBottom: '1px solid var(--line)', backgroundColor: selectedIds.includes(team.id) ? 'rgba(31, 146, 84, 0.05)' : 'transparent' }}>
                  <td style={{ padding: '1rem' }}>
                    {team.registrationStatus === 'PENDING_VERIFICATION' ? (
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(team.id)} 
                        onChange={() => toggleSelect(team.id)} 
                        style={{ cursor: 'pointer' }}
                      />
                    ) : null}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{team.teamName}</td>
                  <td style={{ padding: '1rem' }}>
                    {team.leaderName}
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-60)' }}>{team.leaderRollNo}</div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--ink-60)', fontSize: '0.875rem' }}>{team.institution || 'N/A'}</td>
                  <td style={{ padding: '1rem', color: 'var(--ink-60)', fontSize: '0.875rem' }}>{new Date(team.registeredAt).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Button variant="secondary" size="sm" onClick={() => setSelectedTeam(team)}>
                        <Eye size={16} style={{ marginRight: '4px' }} /> View Form
                      </Button>
                      {team.registrationStatus === 'PENDING_VERIFICATION' && (
                        <RegistrationActions teamId={team.id} />
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedTeam && (
        <RegistrationModal team={selectedTeam} onClose={() => setSelectedTeam(null)} />
      )}
    </div>
  )
}
