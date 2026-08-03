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
  questionsForMentors: string | null
  coreFeatures: { id: string; title: string; description: string }[]
  tasks: WorkspaceTask[]
  mentorFeedback: { overallFeedback: string | null; suggestions: string | null }[]
  privateNotes: { note: string | null }[]
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
    overallFeedback: project?.mentorFeedback?.[0]?.overallFeedback || '',
    suggestions: project?.mentorFeedback?.[0]?.suggestions || '',
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

  const submitFeedback = async () => {
    setIsSubmitting(true);
    try {
      await fetch(`/api/mentor/team/${team.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...feedback, projectId: project?.id })
      });
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

              {project.coreFeatures.length > 0 && (
                <div>
                  <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Core Features</h4>
                  <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8 }}>
                    {project.coreFeatures.map(f => <li key={f.id}><strong>{f.title}:</strong> {f.description}</li>)}
                  </ul>
                </div>
              )}

              {project.architectureFileUrl && (
                <div>
                  <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Solution Architecture</h4>
                  <a href={project.architectureFileUrl} target="_blank" rel="noreferrer" className={styles.linkButton}>
                    View Architecture Diagram <ExternalLink size={12} />
                  </a>
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
            <Field label="Overall Feedback">
              <Textarea rows={5} value={feedback.overallFeedback} onChange={e => setFeedback({...feedback, overallFeedback: e.target.value})} />
            </Field>
            <Field label="Suggestions for Improvement">
              <Textarea rows={5} value={feedback.suggestions} onChange={e => setFeedback({...feedback, suggestions: e.target.value})} />
            </Field>
            <div>
              <Button onClick={submitFeedback} disabled={isSubmitting || !project}>Submit Feedback</Button>
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
            <Field label="Note">
              <Textarea rows={5} value={note.note} onChange={e => setNote({...note, note: e.target.value})} placeholder="e.g. Team requires additional guidance, Scope is too ambitious..." />
            </Field>
            <div>
              <Button onClick={submitNote} disabled={isSubmitting || !project}>Save Private Note</Button>
            </div>
          </div>
        )}

      </Card>
    </div>
  )
}