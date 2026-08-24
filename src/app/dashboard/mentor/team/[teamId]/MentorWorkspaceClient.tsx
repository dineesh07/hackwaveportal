'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { Field, Input, Textarea, Select } from '@/components/ui/FormControls'
import { FileCheck, Users, MessageSquare, ListChecks, Lock, Plus, HelpCircle, ExternalLink } from 'lucide-react'
import styles from '../../../dashboard.module.css'

type WorkspaceTask = {
  id: string
  title: string
  description: string | null
  status: string
}

type WorkspaceProject = {
  id: string
  projectTitle: string
  oneLiner: string | null
  track: string
  status: string
  projectStatus: string
  problemStatement: string
  proposedSolution: string
  architectureFileUrl: string | null
  mockupFileUrl: string | null
  prototypeLinkUrl: string | null
  githubRepoUrl: string | null
  demoVideoUrl: string | null
  targetUsers: string[]
  techFrontend: string[]
  techBackend: string[]
  techDatabase: string[]
  techAiMl: string[]
  techCloud: string[]
  techApis: string[]
  techOther: string[]
  potentialChallenges: string | null
  questionsForMentors: string | null
  coreFeatures: { id: string; title: string; description: string }[]
  futureEnhancements: { id: string; title: string; description: string }[]
  references: { id: string; title: string; url: string }[]
  tasks: WorkspaceTask[]
  mentorFeedback: { overallFeedback: string | null; suggestions: string | null; createdAt?: Date | string }[]
  privateNotes: { note: string | null; createdAt?: Date | string }[]
}

type WorkspaceTeam = {
  id: string
  teamName: string
  leaderName: string
  leaderPhone: string
  leaderEmail: string | null
  members: { id: string; name: string; phone: string }[]
  projects: WorkspaceProject[]
}

type TabId = 'project' | 'contact' | 'feedback' | 'tasks' | 'notes';

export default function MentorWorkspaceClient({ team, project }: { team: WorkspaceTeam; project: WorkspaceProject | undefined }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('project');

  const [feedback, setFeedback] = useState({
    overallFeedback: '',
    suggestions: '',
  });

  const [note, setNote] = useState({
    note: project?.privateNotes?.[0]?.note || '',
  });

  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'project', label: 'Project Details', icon: <FileCheck size={16} /> },
    { id: 'contact', label: 'Contact Info', icon: <Users size={16} /> },
    { id: 'feedback', label: 'Feedback', icon: <MessageSquare size={16} /> },
    { id: 'tasks', label: 'Assign Tasks', icon: <ListChecks size={16} /> },
    { id: 'notes', label: 'Private Notes', icon: <Lock size={16} /> },
  ];

  const submitFeedback = async (action: 'REVIEWED' | 'NEEDS_REVISION') => {
    setIsSubmitting(true);
    try {
      await fetch(`/api/mentor/team/${team.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...feedback, projectId: project?.id, action })
      });
      setFeedback({ overallFeedback: '', suggestions: '' });
      router.refresh();
      alert("Feedback saved successfully.");
    } catch {
      alert("Failed to save feedback.");
    }
    setIsSubmitting(false);
  }

  const submitNote = async () => {
    setIsSubmitting(true);
    try {
      await fetch(`/api/mentor/team/${team.id}/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...note, projectId: project?.id })
      });
      setNote({ note: '' });
      router.refresh();
      alert("Private note saved successfully.");
    } catch {
      alert("Failed to save note.");
    }
    setIsSubmitting(false);
  }

  const submitTask = async () => {
    if (!newTask.title || !newTask.dueDate) return alert("Title and Due Date required.");
    setIsSubmitting(true);
    try {
      await fetch(`/api/mentor/team/${team.id}/task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTask, projectId: project?.id })
      });
      setNewTask({ title: '', description: '', priority: 'MEDIUM', dueDate: '' });
      router.refresh();
      alert("Task assigned successfully.");
    } catch {
      alert("Failed to assign task.");
    }
    setIsSubmitting(false);
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <div className={styles.tabs}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={activeTab === t.id ? styles.tabActive : styles.tab}
            type="button"
          >
            <span className={styles.tabIcon}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <Card style={{ padding: '2rem' }}>

        {activeTab === 'project' && (
          project ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
              <h2 style={{ color: 'var(--ink)' }}>{project.projectTitle}</h2>
              <p style={{ fontStyle: 'italic', color: 'var(--ink-60)' }}>{project.oneLiner}</p>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Tag tone="accent">Track: {project.track.replace(/_/g, ' ')}</Tag>
                <Tag tone={project.status === 'REVIEWED' ? 'success' : project.status === 'SUBMITTED' ? 'gold' : 'neutral'}>{project.status.replace(/_/g, ' ')}</Tag>
                <Tag tone="neutral">{project.projectStatus.replace(/_/g, ' ')}</Tag>
              </div>

              <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--line)' }}>
                <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Problem Statement</h4>
                <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>{project.problemStatement}</p>
              </div>

              <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--line)' }}>
                <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Proposed Solution</h4>
                <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>{project.proposedSolution}</p>
              </div>

              {project.targetUsers && project.targetUsers.length > 0 && (
                <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--line)' }}>
                  <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Target Users</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {project.targetUsers.map(user => <Tag key={user} tone="neutral">{user}</Tag>)}
                  </div>
                </div>
              )}

              {project.coreFeatures.length > 0 && (
                <div>
                  <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Core Features</h4>
                  <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8 }}>
                    {project.coreFeatures.map(f => <li key={f.id}><strong>{f.title}:</strong> {f.description}</li>)}
                  </ul>
                </div>
              )}

              {project.futureEnhancements && project.futureEnhancements.length > 0 && (
                <div>
                  <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Future Enhancements</h4>
                  <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8 }}>
                    {project.futureEnhancements.map(f => <li key={f.id}><strong>{f.title}:</strong> {f.description}</li>)}
                  </ul>
                </div>
              )}

              <div>
                <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Tech Stack</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--line)' }}>
                  {project.techFrontend.length > 0 && <div><strong>Frontend:</strong> {project.techFrontend.join(', ')}</div>}
                  {project.techBackend.length > 0 && <div><strong>Backend:</strong> {project.techBackend.join(', ')}</div>}
                  {project.techDatabase.length > 0 && <div><strong>Database:</strong> {project.techDatabase.join(', ')}</div>}
                  {project.techAiMl.length > 0 && <div><strong>AI/ML:</strong> {project.techAiMl.join(', ')}</div>}
                  {project.techCloud.length > 0 && <div><strong>Cloud:</strong> {project.techCloud.join(', ')}</div>}
                  {project.techApis.length > 0 && <div><strong>APIs:</strong> {project.techApis.join(', ')}</div>}
                  {project.techOther.length > 0 && <div><strong>Other:</strong> {project.techOther.join(', ')}</div>}
                </div>
              </div>

              {project.potentialChallenges && (
                <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--line)' }}>
                  <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Potential Challenges</h4>
                  <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>{project.potentialChallenges}</p>
                </div>
              )}

              <div>
                <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Links & Attachments</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {project.architectureFileUrl && (
                    <a href={project.architectureFileUrl} target="_blank" rel="noreferrer" className={styles.linkButton}>
                      View Architecture Diagram <ExternalLink size={12} />
                    </a>
                  )}
                  {project.githubRepoUrl && (
                    <a href={project.githubRepoUrl} target="_blank" rel="noreferrer" className={styles.linkButton}>
                      GitHub Repository <ExternalLink size={12} />
                    </a>
                  )}
                  {project.mockupFileUrl && (
                    <a href={project.mockupFileUrl} target="_blank" rel="noreferrer" className={styles.linkButton}>
                      Screenshots / Mockup <ExternalLink size={12} />
                    </a>
                  )}
                  {project.prototypeLinkUrl && (
                    <a href={project.prototypeLinkUrl} target="_blank" rel="noreferrer" className={styles.linkButton}>
                      Prototype Link <ExternalLink size={12} />
                    </a>
                  )}
                  {project.demoVideoUrl && (
                    <a href={project.demoVideoUrl} target="_blank" rel="noreferrer" className={styles.linkButton}>
                      Demo Video <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>

              {project.references && project.references.length > 0 && (
                <div>
                  <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>References</h4>
                  <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8 }}>
                    {project.references.map(r => (
                      <li key={r.id}>
                        <a href={r.url} target="_blank" rel="noreferrer" style={{ color: 'var(--flame-red)' }}>{r.title}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {project.questionsForMentors && (
                <div style={{ background: 'rgba(37, 99, 235, 0.08)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid rgba(37, 99, 235, 0.25)' }}>
                  <h4 style={{ color: '#2563eb', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <HelpCircle size={16} /> Questions for Mentors
                  </h4>
                  <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>{project.questionsForMentors}</p>
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: 'var(--ink-60)' }}>Project not submitted yet.</p>
          )
        )}

        {activeTab === 'contact' && (
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Team Leader</h3>
            <div className={styles.contactGrid}>
              <p><strong>Name:</strong> {team.leaderName}</p>
              <p><strong>Phone:</strong> {team.leaderPhone}</p>
              <p><strong>Email:</strong> {team.leaderEmail || 'N/A'}</p>
            </div>

            <h3 style={{ fontWeight: 700, margin: '2rem 0 1rem' }}>Team Members</h3>
            {team.members.length === 0 && <p style={{ color: 'var(--ink-60)' }}>No team members listed.</p>}
            {team.members.map(m => (
              <div key={m.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--line)' }}>
                <p><strong>Name:</strong> {m.name}</p>
                <p><strong>Phone:</strong> {m.phone}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'feedback' && (
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontWeight: 700 }}>Mentor Feedback</h3>
            
            {project?.mentorFeedback && project.mentorFeedback.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Feedback History</h4>
                {project.mentorFeedback.map((fb, idx) => (
                  <div key={idx} style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--line)', marginBottom: '1rem' }}>
                    {fb.createdAt && <p style={{ fontSize: '0.875rem', color: 'var(--ink-60)', marginBottom: '0.5rem' }}>{new Date(fb.createdAt).toLocaleString()}</p>}
                    <p style={{ fontWeight: 'bold' }}>Overall Feedback:</p>
                    <p style={{ whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>{fb.overallFeedback}</p>
                    <p style={{ fontWeight: 'bold' }}>Suggestions:</p>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{fb.suggestions}</p>
                  </div>
                ))}
              </div>
            )}

            <h4 style={{ fontWeight: 700 }}>Add New Feedback</h4>
            <Field label="Overall Feedback">
              <Textarea rows={5} value={feedback.overallFeedback} onChange={e => setFeedback({...feedback, overallFeedback: e.target.value})} placeholder="Provide your overall feedback..." />
            </Field>
            <Field label="Suggestions for Improvement">
              <Textarea rows={5} value={feedback.suggestions} onChange={e => setFeedback({...feedback, suggestions: e.target.value})} placeholder="List actionable suggestions for the team..." />
            </Field>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--line)' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Project looks good?</p>
                <Button onClick={() => submitFeedback('REVIEWED')} disabled={isSubmitting || !project || !feedback.overallFeedback} style={{ width: '100%' }}>
                  Approve Submission
                </Button>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Changes needed?</p>
                <Button onClick={() => submitFeedback('NEEDS_REVISION')} variant="secondary" disabled={isSubmitting || !project || !feedback.overallFeedback} style={{ width: '100%' }}>
                  Request Revision
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Assign Improvement Tasks</h3>

            <Card style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Create New Task</h4>
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <Field label="Task Title">
                    <Input value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
                  </Field>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <Field label="Description">
                    <Textarea rows={3} value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
                  </Field>
                </div>
                <Field label="Priority">
                  <Select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </Select>
                </Field>
                <Field label="Due Date">
                  <Input type="datetime-local" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
                </Field>
              </div>
              <Button onClick={submitTask} disabled={isSubmitting || !project} style={{ marginTop: '1rem' }}>
                <Plus size={16} /> Assign Task
              </Button>
            </Card>

            <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Assigned Tasks ({project?.tasks?.length || 0})</h4>
            {project?.tasks?.length === 0 && <p style={{ color: 'var(--ink-60)' }}>No tasks assigned yet.</p>}
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {project?.tasks?.map(t => (
                <li key={t.id} style={{ borderBottom: '1px solid var(--line)', padding: '1rem 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{t.title}</strong>
                    <Tag tone={t.status === 'COMPLETED' ? 'success' : 'gold'}>{t.status}</Tag>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--ink-60)', marginTop: '0.5rem' }}>{t.description}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'notes' && (
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontWeight: 700 }}>Private Notes <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--ink-60)' }}>(Visible only to Staff Coordinator)</span></h3>
            
            {project?.privateNotes && project.privateNotes.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Note History</h4>
                {project.privateNotes.map((pn, idx) => (
                  <div key={idx} style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--line)', marginBottom: '1rem' }}>
                    {pn.createdAt && <p style={{ fontSize: '0.875rem', color: 'var(--ink-60)', marginBottom: '0.5rem' }}>{new Date(pn.createdAt).toLocaleString()}</p>}
                    <p style={{ whiteSpace: 'pre-wrap' }}>{pn.note}</p>
                  </div>
                ))}
              </div>
            )}

            <h4 style={{ fontWeight: 700 }}>Add New Private Note</h4>
            <Field label="Note">
              <Textarea rows={5} value={note.note} onChange={e => setNote({...note, note: e.target.value})} placeholder="e.g. Team requires additional guidance, Scope is too ambitious..." />
            </Field>
            <div>
              <Button onClick={submitNote} disabled={isSubmitting || !project || !note.note}>Save Private Note</Button>
            </div>
          </div>
        )}

      </Card>
    </div>
  )
}