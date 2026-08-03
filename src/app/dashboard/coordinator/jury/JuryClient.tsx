'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, Select } from '@/components/ui/FormControls'
import { UserPlus, Scale, Link2 } from 'lucide-react'
import styles from '../../dashboard.module.css'

type JuryData = { id: string; name: string; email: string | null; organization: string | null };
type ProjectData = { id: string; projectTitle: string; teamName: string };
type AssignmentData = { id: string; jury: { name: string }; project: { projectTitle: string; teamName: string } };

export default function JuryClient({ juries, projects, assignments }: { juries: JuryData[], projects: ProjectData[], assignments: AssignmentData[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignment, setAssignment] = useState({ juryId: '', projectId: '' });

  const assignJury = async () => {
    if (!assignment.juryId || !assignment.projectId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/coordinator/jury/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignment)
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to assign jury member.");
        return;
      }
      setAssignment({ juryId: '', projectId: '' });
      router.refresh();
      alert("Jury member assigned.");
    } catch {
      alert("Failed to assign jury member.");
    }
    setIsSubmitting(false);
  }

  const removeAssignment = async (id: string) => {
    if (!confirm("Remove this assignment?")) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/coordinator/jury/assign', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId: id })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to remove assignment.");
        return;
      }
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
          Assign Jury Member
        </h2>
        <Card style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <Field label="Select Jury Member">
              <Select value={assignment.juryId} onChange={e => setAssignment({...assignment, juryId: e.target.value})}>
                <option value="">-- Select Jury Member --</option>
                {juries.map(j => <option key={j.id} value={j.id}>{j.name} ({j.organization || 'No Organization'})</option>)}
              </Select>
            </Field>
            <Field label="Select Project">
              <Select value={assignment.projectId} onChange={e => setAssignment({...assignment, projectId: e.target.value})}>
                <option value="">-- Select Project --</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.teamName} — {p.projectTitle}</option>)}
              </Select>
            </Field>
            <Button onClick={assignJury} disabled={isSubmitting || !assignment.juryId || !assignment.projectId}>
              <Link2 size={16} /> Assign Jury Member
            </Button>
          </div>
        </Card>
      </section>

      <section>
        <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Scale size={20} color="var(--flame-orange)" />
          Current Assignments
        </h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Jury Member</th>
                <th className={styles.th}>Assigned Project</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id} className={styles.tr}>
                  <td className={styles.td}><strong>{a.jury.name}</strong></td>
                  <td className={styles.td}>{a.project.teamName} — {a.project.projectTitle}</td>
                  <td className={styles.td}>
                    <Button onClick={() => removeAssignment(a.id)} variant="danger" size="sm" disabled={isSubmitting}>Remove</Button>
                  </td>
                </tr>
              ))}
              {assignments.length === 0 && (
                <tr><td colSpan={3} className={styles.emptyState}>No jury members assigned yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
