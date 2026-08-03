'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, Input } from '@/components/ui/FormControls'
import { Save, Megaphone, Settings } from 'lucide-react'

type SettingsData = {
  hackathonName: string | null;
  registrationOpen: boolean;
  announcementBanner: string | null;
  submissionDeadline: string | null;
  phase1ReviewWindowStart: string | null;
  phase1ReviewWindowEnd: string | null;
  evaluationWindowStart: string | null;
  evaluationWindowEnd: string | null;
};

const toDateInput = (v: string | Date | null) => (v ? new Date(v).toISOString().slice(0, 16) : '');

export default function AdminSettingsClient({ initial }: { initial: SettingsData }) {
  const router = useRouter();
  const [form, setForm] = useState({
    hackathonName: initial.hackathonName || '',
    registrationOpen: initial.registrationOpen,
    announcementBanner: initial.announcementBanner || '',
    submissionDeadline: toDateInput(initial.submissionDeadline),
    phase1ReviewWindowStart: toDateInput(initial.phase1ReviewWindowStart),
    phase1ReviewWindowEnd: toDateInput(initial.phase1ReviewWindowEnd),
    evaluationWindowStart: toDateInput(initial.evaluationWindowStart),
    evaluationWindowEnd: toDateInput(initial.evaluationWindowEnd),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveSettings = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, submissionDeadline: form.submissionDeadline || null, phase1ReviewWindowStart: form.phase1ReviewWindowStart || null, phase1ReviewWindowEnd: form.phase1ReviewWindowEnd || null, evaluationWindowStart: form.evaluationWindowStart || null, evaluationWindowEnd: form.evaluationWindowEnd || null })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to save settings.");
        return;
      }
      router.refresh();
      alert("Platform settings saved successfully.");
    } catch {
      alert("Failed to save settings.");
    }
    setIsSubmitting(false);
  }

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <Card style={{ padding: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Settings size={18} style={{ color: 'var(--flame-red)' }} /> General
        </h3>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <Field label="Hackathon Name">
            <Input value={form.hackathonName} onChange={e => setForm({...form, hackathonName: e.target.value})} />
          </Field>
          <Field label="Announcement Banner" helper="Shown on the team dashboard when set.">
            <Input value={form.announcementBanner} onChange={e => setForm({...form, announcementBanner: e.target.value})} placeholder="e.g. Submissions close Friday 6 PM" />
          </Field>
        </div>
      </Card>

      <Card style={{ padding: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Megaphone size={18} style={{ color: 'var(--flame-red)' }} /> Registration
        </h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={form.registrationOpen}
            onChange={e => setForm({...form, registrationOpen: e.target.checked})}
            style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--flame-red)' }}
          />
          <strong>Accepting New Team Registrations</strong>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
          <Field label="Submission Deadline">
            <Input type="datetime-local" value={form.submissionDeadline} onChange={e => setForm({...form, submissionDeadline: e.target.value})} />
          </Field>
        </div>
      </Card>

      <Card style={{ padding: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Review & Evaluation Windows</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <Field label="Phase 1 Review Start">
            <Input type="datetime-local" value={form.phase1ReviewWindowStart} onChange={e => setForm({...form, phase1ReviewWindowStart: e.target.value})} />
          </Field>
          <Field label="Phase 1 Review End">
            <Input type="datetime-local" value={form.phase1ReviewWindowEnd} onChange={e => setForm({...form, phase1ReviewWindowEnd: e.target.value})} />
          </Field>
          <Field label="Evaluation Start">
            <Input type="datetime-local" value={form.evaluationWindowStart} onChange={e => setForm({...form, evaluationWindowStart: e.target.value})} />
          </Field>
          <Field label="Evaluation End">
            <Input type="datetime-local" value={form.evaluationWindowEnd} onChange={e => setForm({...form, evaluationWindowEnd: e.target.value})} />
          </Field>
        </div>
      </Card>

      <div>
        <Button onClick={saveSettings} disabled={isSubmitting}>
          <Save size={16} /> Save Settings
        </Button>
      </div>
    </div>
  )
}