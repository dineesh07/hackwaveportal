'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Users, User, Shield, GraduationCap, Building } from 'lucide-react'
import styles from '../../dashboard.module.css'

export default function MyTeamTab({ team }: any) {
  const members = (team?.members || []).filter((m: any) => m.rollNo !== team.leaderRollNo);
  const mentors = team?.mentorAssignments || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Team Info Card */}
      <Card style={{ padding: '2rem' }}>
        <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Building size={20} /> Team Details
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div>
            <span className={styles.muted}>Team Name</span>
            <p style={{ fontWeight: 600, fontSize: '1.125rem', marginTop: '0.25rem' }}>{team.teamName}</p>
          </div>
          <div>
            <span className={styles.muted}>Institution</span>
            <p style={{ fontWeight: 600, fontSize: '1.125rem', marginTop: '0.25rem' }}>{team.institution || 'Not Specified'}</p>
          </div>
          <div>
            <span className={styles.muted}>Registered At</span>
            <p style={{ fontWeight: 600, fontSize: '1.125rem', marginTop: '0.25rem' }}>{new Date(team.registeredAt).toLocaleDateString()}</p>
          </div>
          <div>
            <span className={styles.muted}>Status</span>
            <p style={{ fontWeight: 600, fontSize: '1.125rem', marginTop: '0.25rem', textTransform: 'capitalize' }}>
              <span style={{ color: team.status === 'ACTIVE' ? 'var(--success)' : 'inherit' }}>{team.status.toLowerCase()}</span>
            </p>
          </div>
        </div>
      </Card>

      {/* Team Members List */}
      <Card style={{ padding: '2rem' }}>
        <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Users size={20} /> Members
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          
          {/* Leader Card */}
          <div style={{ padding: '1.25rem', border: '1px solid var(--flame-gold)', background: 'rgba(255, 201, 74, 0.05)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--flame-gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                  {team.leaderName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, margin: 0 }}>{team.leaderName}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--flame-gold)', fontWeight: 600, textTransform: 'uppercase' }}>Team Leader</span>
                </div>
              </div>
              <Shield size={16} color="var(--flame-gold)" />
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--ink-60)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div><strong>Roll No:</strong> {team.leaderRollNo}</div>
              <div><strong>Email:</strong> {team.leaderEmail || 'N/A'}</div>
              <div><strong>Phone:</strong> {team.leaderPhone}</div>
            </div>
          </div>

          {/* Member Cards */}
          {members.map((member: any) => (
            <div key={member.id} style={{ padding: '1.25rem', border: '1px solid var(--line)', background: 'var(--surface)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--line)', color: 'var(--ink-60)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, margin: 0 }}>{member.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ink-40)', textTransform: 'uppercase' }}>Member</span>
                </div>
              </div>
              <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--ink-60)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div><strong>Roll No:</strong> {member.rollNo || 'N/A'}</div>
                <div><strong>Email:</strong> {member.email || 'N/A'}</div>
                <div><strong>Phone:</strong> {member.phone}</div>
              </div>
            </div>
          ))}

        </div>
      </Card>

      {/* Mentor Section */}
      <Card style={{ padding: '2rem' }}>
        <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <GraduationCap size={20} /> Mentor Details
        </h2>
        
        {mentors.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {mentors.map((assignment: any) => (
              <div key={assignment.id} style={{ padding: '1.25rem', border: '1px solid var(--success)', background: 'rgba(31, 146, 84, 0.05)', borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--success)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={24} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, margin: 0, color: 'var(--success)' }}>{assignment.mentor.name}</h4>
                  <div style={{ fontSize: '0.875rem', color: 'var(--ink-60)', marginTop: '0.25rem' }}>
                    <div><strong>Phase:</strong> {assignment.phase}</div>
                    {assignment.mentor.email && <div><strong>Email:</strong> {assignment.mentor.email}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ink-40)', background: 'var(--surface)', borderRadius: '8px' }}>
            <GraduationCap size={32} style={{ opacity: 0.5, margin: '0 auto 1rem' }} />
            <p>No mentor has been assigned to your team yet.</p>
          </div>
        )}
      </Card>
      
    </div>
  )
}
