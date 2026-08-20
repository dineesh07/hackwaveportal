'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, Select, Input } from '@/components/ui/FormControls'
import { UserPlus, Scale, Link2, Search, ChevronDown, ChevronUp } from 'lucide-react'
import styles from '../../dashboard.module.css'

type JuryData = { id: string; name: string; email: string | null; organization: string | null };
type ProjectData = { id: string; projectTitle: string; teamName: string; team: { teamCode: string | null } };
type AssignmentData = { id: string; jury: { name: string }; project: { projectTitle: string; teamName: string; team: { teamCode: string | null } } };

export default function JuryClient({ juries, projects, assignments }: { juries: JuryData[], projects: ProjectData[], assignments: AssignmentData[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignment, setAssignment] = useState<{ juryId: string; projectIds: string[] }>({ juryId: '', projectIds: [] });
  const [projectSearch, setProjectSearch] = useState('');
  const [expandedJury, setExpandedJury] = useState<string | null>(null);

  const filteredProjects = projects.filter(p => 
    (p.team.teamCode || '').toLowerCase().includes(projectSearch.toLowerCase()) || 
    p.teamName.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.projectTitle.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const groupedAssignments = assignments.reduce((acc, curr) => {
    const key = curr.jury.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(curr);
    return acc;
  }, {} as Record<string, AssignmentData[]>);

  const toggleProject = (id: string) => {
    setAssignment(prev => ({
      ...prev,
      projectIds: prev.projectIds.includes(id) ? prev.projectIds.filter(p => p !== id) : [...prev.projectIds, id]
    }));
  };

  const assignJury = async () => {
    if (!assignment.juryId || assignment.projectIds.length === 0) return;
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
      setAssignment({ juryId: '', projectIds: [] });
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

  const exportCSV = () => {
    const headers = ['Team Code', 'Team Name', 'Project Title', 'Jury Name'];
    const rows = assignments.map(a => [
      a.project.team.teamCode || 'N/A',
      a.project.teamName,
      a.project.projectTitle,
      a.jury.name
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "jury_assignments.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

            <Field label="Select Projects (Multiple)">
              <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-40)' }} />
                <Input 
                  placeholder="Search team ID, name, or project..." 
                  value={projectSearch} 
                  onChange={e => setProjectSearch(e.target.value)}
                  style={{ paddingLeft: '2rem', fontSize: '0.875rem' }}
                />
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '0.5rem' }}>
                {filteredProjects.map(p => (
                  <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', cursor: 'pointer', borderBottom: '1px solid var(--line)' }}>
                    <input 
                      type="checkbox" 
                      checked={assignment.projectIds.includes(p.id)} 
                      onChange={() => toggleProject(p.id)} 
                    />
                    <span style={{ fontSize: '0.875rem' }}>
                      <strong>{p.team.teamCode || 'No Code'}</strong> - {p.teamName} <span style={{ color: 'var(--ink-60)', fontSize: '0.75rem' }}>({p.projectTitle})</span>
                    </span>
                  </label>
                ))}
                {filteredProjects.length === 0 && <div style={{ fontSize: '0.875rem', padding: '0.5rem', color: 'var(--ink-60)' }}>No projects match search</div>}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-60)', marginTop: '0.5rem' }}>
                {assignment.projectIds.length} projects selected
              </div>
            </Field>

            <Button onClick={assignJury} disabled={isSubmitting || !assignment.juryId || assignment.projectIds.length === 0}>
              <Link2 size={16} /> Assign Jury Member to Selected
            </Button>
          </div>
        </Card>
      </section>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className={styles.sectionTitle} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Scale size={20} color="var(--flame-orange)" />
            Current Assignments
          </h2>
          <Button variant="secondary" size="sm" onClick={exportCSV}>Export CSV</Button>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Jury Member</th>
                <th className={styles.th}>Projects Assigned</th>
                <th className={styles.th} style={{ width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedAssignments).map(([juryName, juryAssignments]) => (
                <React.Fragment key={juryName}>
                  <tr className={styles.tr} style={{ cursor: 'pointer' }} onClick={() => setExpandedJury(expandedJury === juryName ? null : juryName)}>
                    <td className={styles.td}><strong>{juryName}</strong></td>
                    <td className={styles.td}>{juryAssignments.length} Projects</td>
                    <td className={styles.td}>
                      {expandedJury === juryName ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </td>
                  </tr>
                  {expandedJury === juryName && (
                    <tr className={styles.tr}>
                      <td colSpan={3} style={{ padding: 0 }}>
                        <div style={{ padding: '1rem', background: 'var(--surface-50)' }}>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {juryAssignments.map(a => (
                              <li key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--paper)', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--line)' }}>
                                <span style={{ fontSize: '0.875rem' }}><strong>{a.project.team.teamCode || 'N/A'}</strong> - {a.project.teamName} — {a.project.projectTitle}</span>
                                <Button onClick={() => removeAssignment(a.id)} variant="danger" size="sm" disabled={isSubmitting}>Remove</Button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {Object.keys(groupedAssignments).length === 0 && (
                <tr><td colSpan={3} className={styles.emptyState}>No jury members assigned yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
