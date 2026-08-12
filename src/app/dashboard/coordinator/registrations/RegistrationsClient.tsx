'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Search, Eye, Filter } from 'lucide-react'
import RegistrationActions from '../RegistrationActions'
import RegistrationModal from './RegistrationModal'
import { Team, TeamMember } from '@prisma/client'

type FullTeam = Team & { members: TeamMember[] }

export default function RegistrationsClient({ initialTeams }: { initialTeams: FullTeam[] }) {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<FullTeam | null>(null);

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

      {/* Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--line)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--paper)', borderBottom: '1px solid var(--line)' }}>
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
                <tr key={team.id} style={{ borderBottom: '1px solid var(--line)' }}>
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
