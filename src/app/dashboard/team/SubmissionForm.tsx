'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/FormControls'
import { Check, Circle, Plus, X, FileText, Lightbulb, Sparkles, Cpu, Network, Compass, Link2, Video, ListChecks } from 'lucide-react'
import styles from './SubmissionForm.module.css'

const TRACKS = [
  { value: 'ARTIFICIAL_INTELLIGENCE', label: 'Artificial Intelligence' },
  { value: 'WEB_DEVELOPMENT', label: 'Web Development' },
  { value: 'MOBILE_DEVELOPMENT', label: 'Mobile Development' },
  { value: 'HEALTHCARE', label: 'Healthcare' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'AGRICULTURE', label: 'Agriculture' },
  { value: 'SUSTAINABILITY', label: 'Sustainability' },
  { value: 'FINTECH', label: 'FinTech' },
  { value: 'CYBERSECURITY', label: 'Cybersecurity' },
  { value: 'OPEN_INNOVATION', label: 'Open Innovation' },
  { value: 'IOT', label: 'IoT' },
  { value: 'BLOCKCHAIN_WEB3', label: 'Blockchain / Web3' },
  { value: 'CLOUD_COMPUTING', label: 'Cloud Computing' },
  { value: 'OTHERS', label: 'Others' },
];

const PROJECT_STATUSES = ['IDEATION_COMPLETE', 'RESEARCH_IN_PROGRESS', 'PROTOTYPE_STARTED', 'MVP_DEVELOPMENT_STARTED'];

function Section({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>
        <span style={{ color: 'var(--flame-red)' }}>{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function FileUploader({ label, fieldName, value, onChange, helper }: {
  label: string;
  fieldName: string;
  value: string;
  onChange: (url: string) => void;
  helper: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('field', fieldName);
      const res = await fetch('/api/team/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onChange(data.url);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className={styles.tagsLabel}>{label}</label>
      <span className={styles.helper}>{helper}</span>
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip"
        onChange={handleUpload}
        style={{ display: 'block', margin: '0.5rem 0', fontSize: '0.875rem' }}
        disabled={uploading}
      />
      {uploading && <span className={styles.helper}>Uploading...</span>}
      {error && <span role="alert" style={{ color: 'var(--danger)', fontSize: '0.8125rem' }}>{error}</span>}
      {value && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.375rem' }}>
          <a href={value} target="_blank" rel="noreferrer" className={styles.fileLink}>View uploaded file</a>
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')}>Remove</Button>
        </div>
      )}
    </div>
  )
}

function TagsInput({ label, tags, setTags, placeholder }: { label: string, tags: string[], setTags: (t: string[]) => void, placeholder?: string }) {
  const [input, setInput] = useState('');
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = input.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setInput('');
    }
  }
  return (
    <div>
      <label className={styles.tagsLabel}>{label}</label>
      <div className={styles.tagsWrap}>
        {tags.map((tag, i) => (
          <span key={i} className={styles.tag}>
            {tag}
            <button type="button" onClick={() => setTags(tags.filter((_, idx) => idx !== i))} className={styles.tagRemove} aria-label={`Remove ${tag}`}>
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder || "Type and press Enter..."} />
    </div>
  )
}

type FeatureItem = { id?: string; title: string; description: string };
type ReferenceItem = { id?: string; title: string; url: string };

type ProjectInitialData = {
  projectTitle?: string | null;
  oneLiner?: string | null;
  track?: string | null;
  projectStatus?: string | null;
  problemStatement?: string | null;
  proposedSolution?: string | null;
  targetUsers?: string[];
  coreFeatures?: FeatureItem[];
  futureEnhancements?: FeatureItem[];
  techFrontend?: string[];
  techBackend?: string[];
  techDatabase?: string[];
  techAiMl?: string[];
  techCloud?: string[];
  techApis?: string[];
  techOther?: string[];
  architectureFileUrl?: string | null;
  mockupFileUrl?: string | null;
  prototypeLinkUrl?: string | null;
  potentialChallenges?: string | null;
  references?: ReferenceItem[];
  demoVideoUrl?: string | null;
  questionsForMentors?: string | null;
};

export default function SubmissionForm({ initialData }: { initialData: ProjectInitialData | null }) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    projectTitle: initialData?.projectTitle || '',
    oneLiner: initialData?.oneLiner || '',
    track: initialData?.track || 'WEB_DEVELOPMENT',
    projectStatus: initialData?.projectStatus || 'IDEATION_COMPLETE',
    problemStatement: initialData?.problemStatement || '',
    proposedSolution: initialData?.proposedSolution || '',
    targetUsers: initialData?.targetUsers || [],

    coreFeatures: initialData?.coreFeatures || [],
    futureEnhancements: initialData?.futureEnhancements || [],

    techFrontend: initialData?.techFrontend || [],
    techBackend: initialData?.techBackend || [],
    techDatabase: initialData?.techDatabase || [],
    techAiMl: initialData?.techAiMl || [],
    techCloud: initialData?.techCloud || [],
    techApis: initialData?.techApis || [],
    techOther: initialData?.techOther || [],

    architectureFileUrl: initialData?.architectureFileUrl || '',
    mockupFileUrl: initialData?.mockupFileUrl || '',
    prototypeLinkUrl: initialData?.prototypeLinkUrl || '',

    potentialChallenges: initialData?.potentialChallenges || '',

    references: initialData?.references || [],
    demoVideoUrl: initialData?.demoVideoUrl || '',
    questionsForMentors: initialData?.questionsForMentors || ''
  })

  const updateFeature = (type: 'coreFeatures'|'futureEnhancements', index: number, field: string, value: string) => {
    const newList = [...formData[type]];
    newList[index] = { ...newList[index], [field]: value };
    setFormData({ ...formData, [type]: newList });
  }
  const addFeature = (type: 'coreFeatures'|'futureEnhancements') => {
    setFormData({ ...formData, [type]: [...formData[type], { title: '', description: '' }] });
  }
  const removeFeature = (type: 'coreFeatures'|'futureEnhancements', index: number) => {
    setFormData({ ...formData, [type]: formData[type].filter((_, i: number) => i !== index) });
  }

  const updateRef = (index: number, field: string, value: string) => {
    const newList = [...formData.references];
    newList[index] = { ...newList[index], [field]: value };
    setFormData({ ...formData, references: newList });
  }
  const addRef = () => setFormData({ ...formData, references: [...formData.references, { title: '', url: '' }] })
  const removeRef = (index: number) => setFormData({ ...formData, references: formData.references.filter((_, i: number) => i !== index) })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSuccess('')
  }

  const saveProject = async (status: 'DRAFT' | 'SUBMITTED') => {
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      if (status === 'SUBMITTED') {
        const required = ['projectTitle', 'oneLiner', 'problemStatement', 'proposedSolution'];
        for (const req of required) {
          if (!(formData as Record<string, unknown>)[req]) throw new Error(`Missing required field: ${req}`);
        }
      }

      const res = await fetch('/api/team/project', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, status })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }

      if (status === 'SUBMITTED') {
        router.refresh()
      } else {
        setSuccess('Draft saved successfully at ' + new Date().toLocaleTimeString())
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsSaving(false)
    }
  }

  // Autosave draft every 30s when the form has content and isn't being saved
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formDataRef = useRef(formData);
  const isSavingRef = useRef(isSaving);
  useEffect(() => { formDataRef.current = formData; });
  useEffect(() => { isSavingRef.current = isSaving; });

  const autosave = useCallback(async () => {
    const data = formDataRef.current;
    const hasContent = data.projectTitle.length > 0 || data.problemStatement.length > 0 ||
      data.proposedSolution.length > 0 || data.architectureFileUrl.length > 0;
    if (!hasContent || isSavingRef.current) return;

    try {
      const res = await fetch('/api/team/project', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, status: 'DRAFT' })
      });
      if (!res.ok) return;
      setSuccess('Draft autosaved at ' + new Date().toLocaleTimeString());
    } catch {
      // Silently ignore autosave failures
    }
  }, []);

  useEffect(() => {
    autosaveTimer.current = setInterval(autosave, 30000);
    return () => {
      if (autosaveTimer.current) clearInterval(autosaveTimer.current);
    };
  }, [autosave]);

  const isChecklistComplete =
    formData.problemStatement.length > 0 &&
    formData.proposedSolution.length > 0 &&
    formData.coreFeatures.length > 0 &&
    (formData.techFrontend.length > 0 || formData.techBackend.length > 0) &&
    formData.questionsForMentors.length > 0;

  const checklist = [
    { label: 'Problem Statement Completed', done: formData.problemStatement.length > 0 },
    { label: 'Solution Explained', done: formData.proposedSolution.length > 0 },
    { label: 'Features Listed', done: formData.coreFeatures.length > 0 },
    { label: 'Tech Stack Added', done: formData.techFrontend.length > 0 || formData.techBackend.length > 0 },
    { label: 'Architecture Uploaded (Optional)', done: formData.architectureFileUrl.length > 0 },
    { label: 'Mockup Added (Optional)', done: formData.mockupFileUrl.length > 0 },
    { label: 'References Added (Optional)', done: formData.references.length > 0 },
    { label: 'Mentor Questions Added', done: formData.questionsForMentors.length > 0 },
  ];

  return (
    <div className={styles.form}>
      {error && <div role="alert" className={`${styles.banner} ${styles.bannerError}`}>{error}</div>}
      {success && <div className={`${styles.banner} ${styles.bannerSuccess}`}>{success}</div>}

      <Section icon={<FileText size={18} />} title="Section 1: Project Details">
        <div className={`${styles.grid} ${styles.grid2}`}>
          <div>
            <label className={styles.tagsLabel}>Project Title *</label>
            <Input name="projectTitle" placeholder="Enter your project name" value={formData.projectTitle} onChange={handleChange} />
          </div>
          <div>
            <label className={styles.tagsLabel}>One-Liner *</label>
            <Textarea name="oneLiner" placeholder="Describe your project in one sentence." value={formData.oneLiner} onChange={handleChange} maxLength={150} rows={2} />
            <span className={styles.helper}>{formData.oneLiner.length}/150</span>
          </div>
          <div>
            <label className={styles.tagsLabel}>Track *</label>
            <Select name="track" value={formData.track} onChange={handleChange}>
              {TRACKS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </div>
          <div>
            <label className={styles.tagsLabel}>Project Status *</label>
            <div className={styles.radioRow}>
              {PROJECT_STATUSES.map(s => (
                <label key={s} className={styles.radio}>
                  <input type="radio" name="projectStatus" value={s} checked={formData.projectStatus === s} onChange={handleChange} />
                  {s.replace(/_/g, ' ')}
                </label>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section icon={<Lightbulb size={18} />} title="Section 2: Problem">
        <label className={styles.tagsLabel}>Problem Statement *</label>
        <span className={styles.helper}>What problem are you solving? Who experiences this problem? Why does this problem matter?</span>
        <Textarea name="problemStatement" value={formData.problemStatement} onChange={handleChange} rows={5} />
      </Section>

      <Section icon={<Sparkles size={18} />} title="Section 3: Solution">
        <label className={styles.tagsLabel}>Proposed Solution *</label>
        <span className={styles.helper}>Explain your idea. How will it solve the problem? Why is your approach unique?</span>
        <Textarea name="proposedSolution" value={formData.proposedSolution} onChange={handleChange} rows={5} />
        <div style={{ marginTop: '1rem' }}>
          <TagsInput label="Target Users *" tags={formData.targetUsers} setTags={t => setFormData({...formData, targetUsers: t})} placeholder="e.g. Students, Farmers..." />
        </div>
      </Section>

      <Section icon={<ListChecks size={18} />} title="Section 4: Planned Features">
        <div className={styles.stack}>
          <div>
            <label className={styles.tagsLabel}>Core Features (Phase 1) *</label>
            {formData.coreFeatures.map((feat, i: number) => (
              <div key={i} className={`${styles.row} ${styles.gridSm}`}>
                <Input placeholder="Feature Title" value={feat.title} onChange={e => updateFeature('coreFeatures', i, 'title', e.target.value)} />
                <Input placeholder="Short Description" value={feat.description} onChange={e => updateFeature('coreFeatures', i, 'description', e.target.value)} />
                <Button type="button" variant="ghost" size="sm" onClick={() => removeFeature('coreFeatures', i)} aria-label="Remove feature"><X size={16} /></Button>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={() => addFeature('coreFeatures')}><Plus size={16} /> Add Feature</Button>
          </div>

          <div>
            <label className={styles.tagsLabel}>Future Enhancements (Phase 2)</label>
            {formData.futureEnhancements.map((feat, i: number) => (
              <div key={i} className={`${styles.row} ${styles.gridSm}`}>
                <Input placeholder="Feature Title" value={feat.title} onChange={e => updateFeature('futureEnhancements', i, 'title', e.target.value)} />
                <Input placeholder="Short Description" value={feat.description} onChange={e => updateFeature('futureEnhancements', i, 'description', e.target.value)} />
                <Button type="button" variant="ghost" size="sm" onClick={() => removeFeature('futureEnhancements', i)} aria-label="Remove enhancement"><X size={16} /></Button>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={() => addFeature('futureEnhancements')}><Plus size={16} /> Add Enhancement</Button>
          </div>
        </div>
      </Section>

      <Section icon={<Cpu size={18} />} title="Section 5: Tech Stack">
        <div className={`${styles.grid} ${styles.grid2}`}>
          <TagsInput label="Frontend" tags={formData.techFrontend} setTags={t => setFormData({...formData, techFrontend: t})} />
          <TagsInput label="Backend" tags={formData.techBackend} setTags={t => setFormData({...formData, techBackend: t})} />
          <TagsInput label="Database" tags={formData.techDatabase} setTags={t => setFormData({...formData, techDatabase: t})} />
          <TagsInput label="AI / Machine Learning" tags={formData.techAiMl} setTags={t => setFormData({...formData, techAiMl: t})} />
          <TagsInput label="Cloud / Deployment" tags={formData.techCloud} setTags={t => setFormData({...formData, techCloud: t})} />
          <TagsInput label="Third-party APIs" tags={formData.techApis} setTags={t => setFormData({...formData, techApis: t})} />
          <TagsInput label="Other Technologies" tags={formData.techOther} setTags={t => setFormData({...formData, techOther: t})} />
        </div>
      </Section>

      <Section icon={<Network size={18} />} title="Section 6 & 7: Architecture & Mockups">
        <div className={`${styles.grid} ${styles.grid2}`}>
          <div>
            <FileUploader
              label="Solution Architecture"
              fieldName="architecture"
              value={formData.architectureFileUrl}
              onChange={url => setFormData({ ...formData, architectureFileUrl: url })}
              helper="Upload a system architecture, workflow diagram, ER diagram, or any technical illustration. (PDF, PNG, JPG, WebP — max 10 MB)"
            />
          </div>
          <div>
            <FileUploader
              label="Mockup / Prototype"
              fieldName="mockup"
              value={formData.mockupFileUrl}
              onChange={url => setFormData({ ...formData, mockupFileUrl: url })}
              helper="PNG, JPG, WebP, PDF, Office docs, or ZIP (max 10 MB)"
            />
          </div>
          <div>
            <label className={styles.tagsLabel}>Prototype Link</label>
            <span className={styles.helper}>Figma, Adobe XD, Canva, Framer Prototype</span>
            <Input name="prototypeLinkUrl" placeholder="https://..." value={formData.prototypeLinkUrl} onChange={handleChange} />
          </div>
        </div>
      </Section>

      <Section icon={<Compass size={18} />} title="Section 8 & 11: Challenges & Mentor Guidance">
        <div className={styles.stack}>
          <div>
            <label className={styles.tagsLabel}>Potential Challenges</label>
            <span className={styles.helper}>What technical or practical challenges do you anticipate?</span>
            <Textarea name="potentialChallenges" value={formData.potentialChallenges} onChange={handleChange} rows={3} />
          </div>
          <div>
            <label className={styles.tagsLabel}>Questions for Mentors</label>
            <span className={styles.helper}>Mention the questions, doubts, or areas where you would like mentor guidance.</span>
            <Textarea name="questionsForMentors" value={formData.questionsForMentors} onChange={handleChange} rows={3} />
          </div>
        </div>
      </Section>

      <Section icon={<Link2 size={18} />} title="Section 9: References">
        <div className={styles.stack}>
          {formData.references.map((ref, i: number) => (
            <div key={i} className={`${styles.row} ${styles.gridSm}`}>
              <Input placeholder="Title (e.g. API Docs)" value={ref.title} onChange={e => updateRef(i, 'title', e.target.value)} />
              <Input placeholder="URL" value={ref.url} onChange={e => updateRef(i, 'url', e.target.value)} />
              <Button type="button" variant="ghost" size="sm" onClick={() => removeRef(i)} aria-label="Remove reference"><X size={16} /></Button>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={addRef}><Plus size={16} /> Add Reference</Button>
        </div>
      </Section>

      <Section icon={<Video size={18} />} title="Section 10: Demo Video (Optional)">
        <Input name="demoVideoUrl" placeholder="YouTube, Loom, Google Drive..." value={formData.demoVideoUrl} onChange={handleChange} />
      </Section>

      <div className={styles.section} style={{ background: 'var(--surface)' }}>
        <h3 className={styles.sectionTitle}>
          <span style={{ color: 'var(--flame-red)' }}><ListChecks size={18} /></span>
          Submission Checklist
        </h3>
        <ul className={styles.checklist}>
          {checklist.map((item, i) => (
            <li key={i}>
              {item.done ? <Check size={16} color="var(--success)" /> : <Circle size={16} color="var(--ink-40)" />}
              <span className={item.done ? undefined : styles.checklistLabel}>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={() => saveProject('DRAFT')} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save as Draft'}
        </Button>
        <Button type="button" variant="primary" onClick={() => saveProject('SUBMITTED')} disabled={isSaving || !isChecklistComplete}>
          Submit for Review
        </Button>
      </div>
    </div>
  )
}
