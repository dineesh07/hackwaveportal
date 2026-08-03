'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { Field, Input, Select, Textarea } from '@/components/ui/FormControls'
import { AwardIcon, AWARD_ICON_OPTIONS } from '@/components/ui/AwardIcon'
import { Trophy, Gift } from 'lucide-react'
import styles from '../../dashboard.module.css'

type AwardData = {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  publishedAt: Date | null;
};

type AwardProject = {
  id: string;
  projectTitle: string;
  team: { teamName: string };
  awards: { id: string; award: { id: string; icon: string | null; title: string } }[];
};

export default function AwardsClient({ awards, projects }: { awards: AwardData[], projects: AwardProject[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newAward, setNewAward] = useState({ title: '', description: '', icon: 'trophy' });
  const [assignment, setAssignment] = useState({ awardId: '', projectId: '' });

  const createAward = async () => {
    if (!newAward.title) return;
    setIsSubmitting(true);
    try {
      await fetch('/api/coordinator/awards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE_AWARD', ...newAward })
      });
      setNewAward({ title: '', description: '', icon: 'trophy' });
      router.refresh();
      alert("Award created.");
    } catch {
      alert("Failed to create award.");
    }
    setIsSubmitting(false);
  }

  const assignAward = async () => {
    if (!assignment.awardId || !assignment.projectId) return;
    setIsSubmitting(true);
    try {
      await fetch('/api/coordinator/awards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ASSIGN_AWARD', ...assignment })
      });
      setAssignment({ awardId: '', projectId: '' });
      router.refresh();
      alert("Award assigned.");
    } catch {
      alert("Failed to assign award.");
    }
    setIsSubmitting(false);
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem' }}>

      <section>
        <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Trophy size={20} color="var(--flame-red)" />
          Define Awards
        </h2>
        <Card style={{ marginBottom: '2rem' }}>
          <h4 style={{ marginBottom: '1rem', fontWeight: 700 }}>Create New Award</h4>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <Field label="Icon">
              <Select value={newAward.icon} onChange={e => setNewAward({...newAward, icon: e.target.value})}>
                {AWARD_ICON_OPTIONS.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Award Title">
              <Input value={newAward.title} onChange={e => setNewAward({...newAward, title: e.target.value})} placeholder="e.g. Best UI/UX, Most Innovative" />
            </Field>
            <Field label="Description">
              <Textarea rows={2} value={newAward.description} onChange={e => setNewAward({...newAward, description: e.target.value})} />
            </Field>
            <Button onClick={createAward} disabled={isSubmitting}>Create Award</Button>
          </div>
        </Card>

        <h4 style={{ marginBottom: '1rem', fontWeight: 700 }}>Available Awards</h4>
        <Card>
          {awards.length === 0 && <p style={{ color: 'var(--ink-60)' }}>No awards defined yet.</p>}
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {awards.map(a => (
              <li key={a.id} className={styles.awardRow}>
                <span style={{ color: 'var(--flame-red)' }}><AwardIcon name={a.icon} size={22} /></span>
                <div>
                  <strong style={{ color: 'var(--ink)' }}>{a.title}</strong>
                  <p style={{ fontSize: '0.875rem', color: 'var(--ink-60)', marginTop: '0.25rem' }}>{a.description}</p>
                </div>
                {a.publishedAt && <Tag tone="success">Published</Tag>}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section>
        <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Gift size={20} color="var(--flame-orange)" />
          Assign Awards
        </h2>
        <Card style={{ marginBottom: '2rem' }}>
          <h4 style={{ marginBottom: '1rem', fontWeight: 700 }}>Assign Award to Project</h4>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <Field label="Select Award">
              <Select value={assignment.awardId} onChange={e => setAssignment({...assignment, awardId: e.target.value})}>
                <option value="">-- Select Award --</option>
                {awards.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
              </Select>
            </Field>
            <Field label="Select Project">
              <Select value={assignment.projectId} onChange={e => setAssignment({...assignment, projectId: e.target.value})}>
                <option value="">-- Select Project --</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.team.teamName} - {p.projectTitle}</option>)}
              </Select>
            </Field>
            <Button onClick={assignAward} disabled={isSubmitting || !assignment.awardId || !assignment.projectId}>Assign Award</Button>
          </div>
        </Card>

        <h4 style={{ marginBottom: '1rem', fontWeight: 700 }}>Awarded Projects</h4>
        <Card>
          {projects.filter(p => p.awards.length > 0).length === 0 && <p style={{ color: 'var(--ink-60)' }}>No projects awarded yet.</p>}
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {projects.filter(p => p.awards.length > 0).map(p => (
              <li key={p.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--line)' }}>
                <strong>{p.team.teamName} - {p.projectTitle}</strong>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {p.awards.map(a => (
                    <Tag key={a.id} tone="gold">
                      <AwardIcon name={a.award.icon} size={12} />
                      {a.award.title}
                    </Tag>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  )
}