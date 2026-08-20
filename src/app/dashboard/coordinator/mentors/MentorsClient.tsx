'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, Select } from '@/components/ui/FormControls'
import { UserPlus, UserCheck, Link2 } from 'lucide-react'
import styles from '../../dashboard.module.css'

type MentorData = { id: string; name: string; email: string | null; organization: string | null };
type TeamData = { id: string; teamName: string; track: string; teamCode: string | null };
type AssignmentData = { id: string; mentor: { name: string }; team: { teamName: string; teamCode: string | null } };

export default function MentorsClient({ mentors, teams, assignments }: { mentors: MentorData[], teams: TeamData[], assignments: AssignmentData[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignment, setAssignment] = useState<{ mentorId: string; teamIds: string[] }>({ mentorId: '', teamIds: [] });

  const toggleTeam = (id: string) => {
    setAssignment(prev => ({
      ...prev,
      teamIds: prev.teamIds.includes(id) ? prev.teamIds.filter(t => t !== id) : [...prev.teamIds, id]
    }));
  };

  const assignMentor = async () => {
    if (!assignment.mentorId || assignment.teamIds.length === 0) return;
    setIsSubmitting(true);
    try {
      await fetch('/api/coordinator/mentors/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignment)
      });
      setAssignment({ mentorId: '', teamIds: [] });
      router.refresh();
      alert("Mentor assigned.");
    } catch {
      alert("Failed to assign mentor.");
    }
    setIsSubmitting(false);
  }

  const removeAssignment = async (id: string) => {
    if (!confirm("Remove this assignment?")) return;
    setIsSubmitting(true);
    try {
      await fetch('/api/coordinator/mentors/assign', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId: id })
      });
      router.refresh();
    } catch {
      alert("Failed to remove assignment.");
    }
    setIsSubmitting(false);
  }

  const exportCSV = () => {
    const headers = ['Team Code', 'Team Name', 'Mentor Name'];
    const rows = assignments.map(a => [
      a.team.teamCode || 'N/A',
      a.team.teamName,
      a.mentor.name
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "mentor_assignments.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
      <section>
        <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <UserPlus size={20} color="var(--flame-red)" />
          Assign Mentor
        </h2>
        <Card style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <Field label="Select Mentor">
              <Select value={assignment.mentorId} onChange={e => setAssignment({...assignment, mentorId: e.target.value})}>
                <option value="">-- Select Mentor --</option>
                {mentors.map(m => <option key={m.id} value={m.id}>{m.name} ({m.organization || 'No Organization'})</option>)}
              </Select>
            </Field>
            
            <Field label="Select Teams (Multiple)">
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '0.5rem' }}>
                {teams.map(t => (
                  <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', cursor: 'pointer', borderBottom: '1px solid var(--line)' }}>
                    <input 
                      type="checkbox" 
                      checked={assignment.teamIds.includes(t.id)} 
                      onChange={() => toggleTeam(t.id)} 
                    />
                    <span style={{ fontSize: '0.875rem' }}>
                      <strong>{t.teamCode || 'No Code'}</strong> - {t.teamName} <span style={{ color: 'var(--ink-60)', fontSize: '0.75rem' }}>({t.track?.replace(/_/g, ' ')})</span>
                    </span>
                  </label>
                ))}
                {teams.length === 0 && <div style={{ fontSize: '0.875rem', padding: '0.5rem', color: 'var(--ink-60)' }}>No teams available</div>}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-60)', marginTop: '0.5rem' }}>
                {assignment.teamIds.length} teams selected
              </div>
            </Field>

            <Button onClick={assignMentor} disabled={isSubmitting || !assignment.mentorId || assignment.teamIds.length === 0}>
              <Link2 size={16} /> Assign Mentor to Selected Teams
            </Button>
          </div>
        </Card>
      </section>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className={styles.sectionTitle} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <UserCheck size={20} color="var(--flame-orange)" />
            Current Assignments
          </h2>
          <Button variant="outline" size="sm" onClick={exportCSV}>Export CSV</Button>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Mentor Name</th>
                <th className={styles.th}>Assigned Team</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id} className={styles.tr}>
                  <td className={styles.td}><strong>{a.mentor.name}</strong></td>
                  <td className={styles.td}>{a.team.teamCode ? `${a.team.teamCode} - ` : ''}{a.team.teamName}</td>
                  <td className={styles.td}>
                    <Button onClick={() => removeAssignment(a.id)} variant="danger" size="sm" disabled={isSubmitting}>Remove</Button>
                  </td>
                </tr>
              ))}
              {assignments.length === 0 && (
                <tr><td colSpan={3} className={styles.emptyState}>No mentors assigned yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}