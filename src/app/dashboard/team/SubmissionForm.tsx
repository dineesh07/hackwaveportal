'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/FormControls'
import { Check, Circle, Plus, X, FileText, Lightbulb, Sparkles, Cpu, Network, Compass, Link2, Video, ListChecks, ChevronLeft, ChevronRight, AlertCircle, Target } from 'lucide-react'
import styles from './SubmissionForm.module.css'
import { PROBLEM_STATEMENTS } from './components/ProblemStatementsTab'

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
  problemStatementId?: string | null;
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
  githubRepoUrl?: string | null;
  potentialChallenges?: string | null;
  references?: ReferenceItem[];
  demoVideoUrl?: string | null;
  questionsForMentors?: string | null;
};

const WIZARD_STEPS = [
  { num: 1, title: 'Project Details', icon: <FileText size={16} /> },
  { num: 2, title: 'Problem', icon: <Lightbulb size={16} /> },
  { num: 3, title: 'Solution', icon: <Sparkles size={16} /> },
  { num: 4, title: 'Planned Features', icon: <ListChecks size={16} /> },
  { num: 5, title: 'Tech Stack', icon: <Cpu size={16} /> },
  { num: 6, title: 'Architecture', icon: <Network size={16} /> },
  { num: 7, title: 'Mockups', icon: <Network size={16} /> },
  { num: 8, title: 'Challenges', icon: <Compass size={16} /> },
  { num: 9, title: 'References', icon: <Link2 size={16} /> },
  { num: 10, title: 'Demo Video', icon: <Video size={16} /> },
  { num: 11, title: 'Mentor Guidance', icon: <Compass size={16} /> },
];

export default function SubmissionForm({ initialData }: { initialData: ProjectInitialData | null }) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    projectTitle: initialData?.projectTitle || '',
    oneLiner: initialData?.oneLiner || '',
    track: initialData?.track || 'WEB_DEVELOPMENT',
    projectStatus: initialData?.projectStatus || 'IDEATION_COMPLETE',
    problemStatement: initialData?.problemStatement || '',
    problemStatementId: initialData?.problemStatementId || '',
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
    githubRepoUrl: initialData?.githubRepoUrl || '',

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

  // Validation logic
  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.projectTitle.trim().length > 0 && formData.oneLiner.trim().length > 0;
      case 2:
        return formData.problemStatement.trim().length > 0;
      case 3:
        return formData.proposedSolution.trim().length > 0 && formData.targetUsers.length > 0;
      case 4:
        return formData.coreFeatures.length > 0 && formData.coreFeatures.some(f => f.title.trim().length > 0);
      case 5:
        return formData.techFrontend.length > 0 || formData.techBackend.length > 0 || 
               formData.techDatabase.length > 0 || formData.techAiMl.length > 0 || 
               formData.techCloud.length > 0 || formData.techApis.length > 0 || formData.techOther.length > 0;
      case 6:
        return formData.architectureFileUrl.trim().length > 0;
      case 7:
        return formData.githubRepoUrl.trim().length > 0;
      case 8:
        return formData.potentialChallenges.trim().length > 0;
      case 9:
        return formData.references.length > 0 && formData.references.some(r => r.title.trim().length > 0 && r.url.trim().length > 0);
      case 10:
        return formData.demoVideoUrl.trim().length > 0;
      case 11:
        return formData.questionsForMentors.trim().length > 0;
      default:
        return false;
    }
  }

  const isChecklistComplete = 
    isStepValid(1) && isStepValid(2) && isStepValid(3) && isStepValid(4) && 
    isStepValid(5) && isStepValid(6) && isStepValid(7) && isStepValid(8) && isStepValid(9);

  const saveProject = async (status: 'DRAFT' | 'SUBMITTED', silent = false) => {
    if (!silent) {
      setIsSaving(true)
      setError('')
      setSuccess('')
    }

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
        if (!silent) setSuccess('Draft saved successfully at ' + new Date().toLocaleTimeString())
      }
    } catch (err) {
      if (!silent) setError(err instanceof Error ? err.message : String(err))
    } finally {
      if (!silent) setIsSaving(false)
    }
  }

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
      await fetch('/api/team/project', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, status: 'DRAFT' })
      });
    } catch {
      // Silently ignore autosave failures
    }
  }, []);

  // Autosave draft every 30s
  useEffect(() => {
    const timer = setInterval(autosave, 30000);
    return () => clearInterval(timer);
  }, [autosave]);

  // Handle Next
  const handleNext = async () => {
    if (currentStep < 11) {
      setCurrentStep(prev => prev + 1);
      await autosave(); // Trigger autosave on step change
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className={styles.form}>
      {error && <div role="alert" className={`${styles.banner} ${styles.bannerError}`}>{error}</div>}
      {success && <div className={`${styles.banner} ${styles.bannerSuccess}`}>{success}</div>}

      {/* Progress Bar */}
      <div className={styles.progressBarContainer}>
        <div 
          className={styles.progressBarFill} 
          style={{ width: `${(currentStep / 11) * 100}%` }}
        />
      </div>

      <div className={styles.wizardLayout}>
        
        {/* Left Step Tracker */}
        <div className={styles.stepTracker}>
          <h4 style={{ marginBottom: "1rem", fontSize: "0.875rem", color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: "1px" }}>Sections</h4>
          <ul className={styles.stepList}>
            {WIZARD_STEPS.map((step) => {
              const isActive = currentStep === step.num;
              const isCompleted = isStepValid(step.num);
              
              return (
                <li 
                  key={step.num}
                  className={`${styles.stepItem} ${isActive ? styles.active : ""} ${isCompleted && !isActive ? styles.completed : ""}`}
                  onClick={async () => {
                    setCurrentStep(step.num);
                    await autosave();
                  }}
                >
                  <div className={styles.stepIcon}>
                    {isCompleted && !isActive ? <Check size={14} /> : step.num}
                  </div>
                  {step.title}
                </li>
              )
            })}
          </ul>
        </div>

        {/* Main Content Area */}
        <div className={styles.wizardContent}>
          {currentStep === 1 && (
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
          )}

          {currentStep === 2 && (
            <Section icon={<Lightbulb size={18} />} title="Section 2: Problem">
              <label className={styles.tagsLabel}>Select Problem Statement *</label>
              <span className={styles.helper}>Choose a problem statement from the list below. The selected statement will be highlighted at the top.</span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                {PROBLEM_STATEMENTS.map((ps) => {
                  const isSelected = formData.problemStatement === ps.title;
                  return (
                    <div 
                      key={ps.id} 
                      onClick={() => setFormData({ ...formData, problemStatement: ps.title, problemStatementId: ps.id })}
                      style={{ 
                        padding: '1.25rem', 
                        border: `2px solid ${isSelected ? 'var(--flame-red)' : 'var(--line)'}`, 
                        borderRadius: '8px', 
                        background: isSelected ? 'rgba(239, 68, 68, 0.05)' : 'var(--surface)',
                        cursor: 'pointer',
                        order: isSelected ? -1 : 0,
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 4px 12px rgba(239, 68, 68, 0.15)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ 
                            width: '20px', height: '20px', borderRadius: '50%', 
                            border: `2px solid ${isSelected ? 'var(--flame-red)' : 'var(--ink-40)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            {isSelected && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--flame-red)' }} />}
                          </div>
                          <span style={{ 
                            background: 'rgba(56, 189, 248, 0.1)', 
                            color: '#0369a1', 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '999px', 
                            fontSize: '0.7rem', 
                            fontWeight: 700 
                          }}>
                            {ps.id}
                          </span>
                        </div>
                        {isSelected && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--flame-red)' }}>SELECTED</span>}
                      </div>
                      
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.5rem' }}>
                        {ps.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ink-60)', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                        <Target size={14} /> {ps.domain}
                      </div>
                      <p style={{ color: 'var(--ink-60)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                        {ps.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '2rem' }}>
                <label className={styles.tagsLabel}>Custom Problem Statement (Optional)</label>
                <span className={styles.helper}>If you selected "Others" track, or have a unique problem statement, explain it here.</span>
                <Textarea 
                  name="problemStatement" 
                  value={PROBLEM_STATEMENTS.some(ps => ps.title === formData.problemStatement) ? '' : formData.problemStatement} 
                  onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })} 
                  rows={4} 
                  placeholder="Describe your custom problem statement..."
                />
              </div>
            </Section>
          )}

          {currentStep === 3 && (
            <Section icon={<Sparkles size={18} />} title="Section 3: Solution">
              <label className={styles.tagsLabel}>Proposed Solution *</label>
              <span className={styles.helper}>Explain your idea. How will it solve the problem? Why is your approach unique?</span>
              <Textarea name="proposedSolution" value={formData.proposedSolution} onChange={handleChange} rows={5} />
              <div style={{ marginTop: '1rem' }}>
                <TagsInput label="Target Users *" tags={formData.targetUsers} setTags={t => setFormData({...formData, targetUsers: t})} placeholder="e.g. Students, Farmers..." />
              </div>
            </Section>
          )}

          {currentStep === 4 && (
            <Section icon={<ListChecks size={18} />} title="Section 4: Planned Features">
              <div className={styles.stack}>
                <div>
                  <label className={styles.tagsLabel}>Core Features (Phase 1) *</label>
                  <span className={styles.helper} style={{display: "block", marginBottom: "0.5rem"}}>Add at least one core feature.</span>
                  {formData.coreFeatures.map((feat, i: number) => (
                    <div key={i} className={`${styles.row} ${styles.gridSm}`} style={{marginBottom: "0.5rem"}}>
                      <Input placeholder="Feature Title" value={feat.title} onChange={e => updateFeature('coreFeatures', i, 'title', e.target.value)} />
                      <Input placeholder="Short Description" value={feat.description} onChange={e => updateFeature('coreFeatures', i, 'description', e.target.value)} />
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeFeature('coreFeatures', i)} aria-label="Remove feature"><X size={16} /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="secondary" size="sm" onClick={() => addFeature('coreFeatures')}><Plus size={16} /> Add Feature</Button>
                </div>

                <div style={{marginTop: "1rem"}}>
                  <label className={styles.tagsLabel}>Future Enhancements (Phase 2)</label>
                  {formData.futureEnhancements.map((feat, i: number) => (
                    <div key={i} className={`${styles.row} ${styles.gridSm}`} style={{marginBottom: "0.5rem"}}>
                      <Input placeholder="Feature Title" value={feat.title} onChange={e => updateFeature('futureEnhancements', i, 'title', e.target.value)} />
                      <Input placeholder="Short Description" value={feat.description} onChange={e => updateFeature('futureEnhancements', i, 'description', e.target.value)} />
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeFeature('futureEnhancements', i)} aria-label="Remove enhancement"><X size={16} /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="secondary" size="sm" onClick={() => addFeature('futureEnhancements')}><Plus size={16} /> Add Enhancement</Button>
                </div>
              </div>
            </Section>
          )}

          {currentStep === 5 && (
            <Section icon={<Cpu size={18} />} title="Section 5: Tech Stack">
              <span className={styles.helper} style={{display: "block", marginBottom: "1rem"}}>Add at least one technology to any of the categories below. Press Enter to add a tag.</span>
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
          )}

          {currentStep === 6 && (
            <Section icon={<Network size={18} />} title="Section 6: Architecture">
              <label className={styles.tagsLabel}>Solution Architecture Link *</label>
              <span className={styles.helper}>Provide a link to your system architecture, workflow diagram, ER diagram (e.g., Google Drive, Figma).</span>
              <Input name="architectureFileUrl" placeholder="https://..." value={formData.architectureFileUrl} onChange={handleChange} />
            </Section>
          )}

          {currentStep === 7 && (
            <Section icon={<Network size={18} />} title="Section 7: Screenshots">
              <div className={styles.stack}>
                <div>
                  <label className={styles.tagsLabel}>Screenshots Link (Optional)</label>
                  <span className={styles.helper}>Link to screenshots of your mockup or prototype (e.g., Google Drive, Imgur)</span>
                  <Input name="mockupFileUrl" placeholder="https://..." value={formData.mockupFileUrl} onChange={handleChange} />
                </div>
                <div style={{marginTop: "1rem"}}>
                  <label className={styles.tagsLabel}>GitHub Repository Link *</label>
                  <span className={styles.helper}>Provide the link to your project's GitHub repository</span>
                  <Input name="githubRepoUrl" placeholder="https://github.com/..." value={formData.githubRepoUrl} onChange={handleChange} />
                </div>
                <div style={{marginTop: "1rem"}}>
                  <label className={styles.tagsLabel}>Prototype Link (Optional)</label>
                  <span className={styles.helper}>Figma, Adobe XD, Canva, Framer Prototype</span>
                  <Input name="prototypeLinkUrl" placeholder="https://..." value={formData.prototypeLinkUrl} onChange={handleChange} />
                </div>
              </div>
            </Section>
          )}

          {currentStep === 8 && (
            <Section icon={<Compass size={18} />} title="Section 8: Challenges">
              <label className={styles.tagsLabel}>Potential Challenges *</label>
              <span className={styles.helper}>What technical or practical challenges do you anticipate?</span>
              <Textarea name="potentialChallenges" value={formData.potentialChallenges} onChange={handleChange} rows={5} />
            </Section>
          )}

          {currentStep === 9 && (
            <Section icon={<Link2 size={18} />} title="Section 9: References">
              <div className={styles.stack}>
                <span className={styles.helper}>Add any helpful references, research papers, or API docs *</span>
                {formData.references.map((ref, i: number) => (
                  <div key={i} className={`${styles.row} ${styles.gridSm}`} style={{marginBottom: "0.5rem"}}>
                    <Input placeholder="Title (e.g. API Docs)" value={ref.title} onChange={e => updateRef(i, 'title', e.target.value)} />
                    <Input placeholder="URL" value={ref.url} onChange={e => updateRef(i, 'url', e.target.value)} />
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeRef(i)} aria-label="Remove reference"><X size={16} /></Button>
                  </div>
                ))}
                <Button type="button" variant="secondary" size="sm" onClick={addRef}><Plus size={16} /> Add Reference</Button>
              </div>
            </Section>
          )}

          {currentStep === 10 && (
            <Section icon={<Video size={18} />} title="Section 10: Demo Video">
              <label className={styles.tagsLabel}>Demo Video Link (Optional)</label>
              <span className={styles.helper}>YouTube, Loom, Google Drive...</span>
              <Input name="demoVideoUrl" placeholder="https://..." value={formData.demoVideoUrl} onChange={handleChange} />
            </Section>
          )}

          {currentStep === 11 && (
            <>
              <Section icon={<Compass size={18} />} title="Section 11: Mentor Guidance">
                <label className={styles.tagsLabel}>Questions for Mentors (Optional)</label>
                <span className={styles.helper}>Mention the questions, doubts, or areas where you would like mentor guidance.</span>
                <Textarea name="questionsForMentors" value={formData.questionsForMentors} onChange={handleChange} rows={5} />
              </Section>

              <div className={styles.section} style={{ background: 'var(--surface)' }}>
                <h3 className={styles.sectionTitle}>
                  <span style={{ color: 'var(--flame-red)' }}><ListChecks size={18} /></span>
                  Submission Checklist
                </h3>
                <ul className={styles.checklist}>
                  <li>
                    {isStepValid(1) ? <Check size={16} color="var(--success)" /> : <AlertCircle size={16} color="var(--danger)" />}
                    <span className={isStepValid(1) ? undefined : styles.checklistLabel}>Project Details Completed</span>
                  </li>
                  <li>
                    {isStepValid(2) ? <Check size={16} color="var(--success)" /> : <AlertCircle size={16} color="var(--danger)" />}
                    <span className={isStepValid(2) ? undefined : styles.checklistLabel}>Problem Statement Completed</span>
                  </li>
                  <li>
                    {isStepValid(3) ? <Check size={16} color="var(--success)" /> : <AlertCircle size={16} color="var(--danger)" />}
                    <span className={isStepValid(3) ? undefined : styles.checklistLabel}>Solution Explained & Users Targeted</span>
                  </li>
                  <li>
                    {isStepValid(4) ? <Check size={16} color="var(--success)" /> : <AlertCircle size={16} color="var(--danger)" />}
                    <span className={isStepValid(4) ? undefined : styles.checklistLabel}>Core Features Listed</span>
                  </li>
                  <li>
                    {isStepValid(5) ? <Check size={16} color="var(--success)" /> : <AlertCircle size={16} color="var(--danger)" />}
                    <span className={isStepValid(5) ? undefined : styles.checklistLabel}>Tech Stack Added</span>
                  </li>
                  <li>
                    {isStepValid(6) ? <Check size={16} color="var(--success)" /> : <AlertCircle size={16} color="var(--danger)" />}
                    <span className={isStepValid(6) ? undefined : styles.checklistLabel}>Architecture Link Provided</span>
                  </li>
                  <li>
                    {isStepValid(7) ? <Check size={16} color="var(--success)" /> : <AlertCircle size={16} color="var(--danger)" />}
                    <span className={isStepValid(7) ? undefined : styles.checklistLabel}>GitHub Repo Linked</span>
                  </li>
                  <li>
                    {isStepValid(8) ? <Check size={16} color="var(--success)" /> : <AlertCircle size={16} color="var(--danger)" />}
                    <span className={isStepValid(8) ? undefined : styles.checklistLabel}>Challenges Explained</span>
                  </li>
                  <li>
                    {isStepValid(9) ? <Check size={16} color="var(--success)" /> : <AlertCircle size={16} color="var(--danger)" />}
                    <span className={isStepValid(9) ? undefined : styles.checklistLabel}>References Added</span>
                  </li>
                </ul>
              </div>
            </>
          )}

          {/* Navigation Buttons */}
          <div className={styles.actions} style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--line)" }}>
            {currentStep > 1 && (
              <Button type="button" variant="secondary" onClick={handleBack}>
                <ChevronLeft size={16} /> Back
              </Button>
            )}

            {currentStep < 11 ? (
              <Button 
                type="button" 
                variant="primary" 
                onClick={handleNext}
              >
                Next <ChevronRight size={16} />
              </Button>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
                <Button type="button" variant="secondary" onClick={() => saveProject('DRAFT')} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save as Draft'}
                </Button>
                <Button type="button" variant="primary" onClick={() => saveProject('SUBMITTED')} disabled={isSaving || !isChecklistComplete}>
                  Submit for Review
                </Button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
