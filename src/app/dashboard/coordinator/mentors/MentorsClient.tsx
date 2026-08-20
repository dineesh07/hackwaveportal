'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, Select, Input } from '@/components/ui/FormControls'
import { UserPlus, UserCheck, Link2, Search, ChevronDown, ChevronUp } from 'lucide-react'
import styles from '../../dashboard.module.css'

type MentorData = { id: string; name: string; email: string | null; organization: string | null };
type TeamData = { id: string; teamName: string; track: string; teamCode: string | null };
type AssignmentData = { id: string; mentor: { name: string }; team: { teamName: string; teamCode: string | null } };

export default function MentorsClient({ mentors, teams, assignments }: { mentors: MentorData[], teams: TeamData[], assignments: AssignmentData[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignment, setAssignment] = useState<{ mentorId: string; teamIds: string[] }>({ mentorId: '', teamIds: [] });
  const [teamSearch, setTeamSearch] = useState('');
  const [expandedMentor, setExpandedMentor] = useState<string | null>(null);

  const filteredTeams = teams.filter(t => 
    (t.teamCode || '').toLowerCase().includes(teamSearch.toLowerCase()) || 
    t.teamName.toLowerCase().includes(teamSearch.toLowerCase()) ||
    (t.id).toLowerCase().includes(teamSearch.toLowerCase())
  );

  const groupedAssignments = assignments.reduce((acc, curr) => {
    const key = curr.mentor.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(curr);
    return acc;
  }, {} as Record<string, AssignmentData[]>);

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
              <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-40)' }} />
                <Input 
                  placeholder="Search team ID or name..." 
                  value={teamSearch} 
                  onChange={e => setTeamSearch(e.target.value)}
                  style={{ paddingLeft: '2rem', fontSize: '0.875rem' }}
                />
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '0.5rem' }}>
                {filteredTeams.map(t => (
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
                {filteredTeams.length === 0 && <div style={{ fontSize: '0.875rem', padding: '0.5rem', color: 'var(--ink-60)' }}>No teams match search</div>}
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
                <th className={styles.th}>Teams Assigned</th>
                <th className={styles.th} style={{ width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedAssignments).map(([mentorName, mentorAssignments]) => (
                <React.Fragment key={mentorName}>
                  <tr className={styles.tr} style={{ cursor: 'pointer' }} onClick={() => setExpandedMentor(expandedMentor === mentorName ? null : mentorName)}>
                    <td className={styles.td}><strong>{mentorName}</strong></td>
                    <td className={styles.td}>{mentorAssignments.length} Teams</td>
                    <td className={styles.td}>
                      {expandedMentor === mentorName ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </td>
                  </tr>
                  {expandedMentor === mentorName && (
                    <tr className={styles.tr}>
                      <td colSpan={3} style={{ padding: 0 }}>
                        <div style={{ padding: '1rem', background: 'var(--surface-50)' }}>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {mentorAssignments.map(a => (
                              <li key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--paper)', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--line)' }}>
                                <span style={{ fontSize: '0.875rem' }}><strong>{a.team.teamCode || 'N/A'}</strong> - {a.team.teamName}</span>
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
                <tr><td colSpan={3} className={styles.emptyState}>No mentors assigned yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}