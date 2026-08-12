'use client'

import React from 'react'
import { X, CheckCircle2, AlertCircle } from 'lucide-react'
import { Team, TeamMember } from '@/generated/prisma/client'
import { Button } from '@/components/ui/Button'
import RegistrationActions from '../RegistrationActions'

type FullTeam = Team & { members: TeamMember[] }

export default function RegistrationModal({ team, onClose }: { team: FullTeam, onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '700px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-md)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--line)' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Registration Details</h2>
            <p style={{ color: 'var(--ink-60)', fontSize: '0.875rem', margin: 0 }}>Submitted on {new Date(team.registeredAt).toLocaleString()}</p>
          </div>
          <button onClick={onClose} style={{ padding: '0.5rem', borderRadius: '50%', backgroundColor: 'var(--paper)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Status Alert */}
          {team.registrationStatus === 'PENDING_VERIFICATION' ? (
            <div style={{ background: 'rgba(239, 160, 11, 0.1)', color: '#d97706', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertCircle size={20} />
              <div>
                <strong>Pending Verification</strong>
                <div style={{ fontSize: '0.875rem' }}>This team is waiting for coordinator approval.</div>
              </div>
            </div>
          ) : team.registrationStatus === 'REJECTED' ? (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <X size={20} />
              <div>
                <strong>Rejected</strong>
                <div style={{ fontSize: '0.875rem' }}>This team registration was rejected.</div>
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle2 size={20} />
              <div>
                <strong>Approved</strong>
                <div style={{ fontSize: '0.875rem' }}>Verified on {team.verifiedAt ? new Date(team.verifiedAt).toLocaleString() : 'N/A'}</div>
              </div>
            </div>
          )}

          {/* Team Info */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, borderBottom: '1px solid var(--line)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Team Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ink-60)', fontWeight: 600, textTransform: 'uppercase' }}>Team Name</div>
                <div style={{ fontWeight: 500 }}>{team.teamName}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ink-60)', fontWeight: 600, textTransform: 'uppercase' }}>Institution</div>
                <div style={{ fontWeight: 500 }}>{team.institution || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Leader Info */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, borderBottom: '1px solid var(--line)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Leader Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ink-60)', fontWeight: 600, textTransform: 'uppercase' }}>Name</div>
                <div>{team.leaderName}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ink-60)', fontWeight: 600, textTransform: 'uppercase' }}>Roll Number</div>
                <div>{team.leaderRollNo}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ink-60)', fontWeight: 600, textTransform: 'uppercase' }}>Email</div>
                <div>{team.leaderEmail || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ink-60)', fontWeight: 600, textTransform: 'uppercase' }}>Phone</div>
                <div>{team.leaderPhone}</div>
              </div>
            </div>
          </div>

          {/* Members Info */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, borderBottom: '1px solid var(--line)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Team Members ({team.members.length})</h3>
            {team.members.length === 0 ? (
              <div style={{ color: 'var(--ink-60)', fontSize: '0.875rem' }}>No additional members.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {team.members.map((m, idx) => (
                  <div key={m.id} style={{ backgroundColor: 'var(--paper)', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Member {idx + 1}: {m.name}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <div><span style={{ color: 'var(--ink-60)' }}>Roll No:</span> {m.rollNo || 'N/A'}</div>
                      <div><span style={{ color: 'var(--ink-60)' }}>Phone:</span> {m.phone}</div>
                      <div style={{ gridColumn: 'span 2' }}><span style={{ color: 'var(--ink-60)' }}>Email:</span> {m.email || 'N/A'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', backgroundColor: 'var(--paper)', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          {team.registrationStatus === 'PENDING_VERIFICATION' && (
            <RegistrationActions teamId={team.id} />
          )}
        </div>
      </div>
    </div>
  )
}
