'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, Select } from '@/components/ui/FormControls'
import { UserPlus, UserCheck, Link2 } from 'lucide-react'
import styles from '../../dashboard.module.css'

type MentorData = { id: string; name: string; email: string | null; organization: string | null };
type TeamData = { id: string; teamName: string; track: string };
type AssignmentData = { id: string; mentor: { name: string }; team: { teamName: string } };

export default function MentorsClient({ mentors, teams, assignments }: { mentors: MentorData[], teams: TeamData[], assignments: AssignmentData[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignment, setAssignment] = useState({ mentorId: '', teamId: '' });

  const assignMentor = async () => {
    if (!assignment.mentorId || !assignment.teamId) return;
    setIsSubmitting(true);
    try {
      await fetch('/api/coordinator/mentors/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignment)
      });
      setAssignment({ mentorId: '', teamId: '' });
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
            <Field label="Select Team">
              <Select value={assignment.teamId} onChange={e => setAssignment({...assignment, teamId: e.target.value})}>
                <option value="">-- Select Team --</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.teamName} - {t.track?.replace(/_/g, ' ')}</option>)}
              </Select>
            </Field>
            <Button onClick={assignMentor} disabled={isSubmitting || !assignment.mentorId || !assignment.teamId}>
              <Link2 size={16} /> Assign Mentor
            </Button>
          </div>
        </Card>
      </section>

      <section>
        <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <UserCheck size={20} color="var(--flame-orange)" />
          Current Assignments
        </h2>
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
                  <td className={styles.td}>{a.team.teamName}</td>
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