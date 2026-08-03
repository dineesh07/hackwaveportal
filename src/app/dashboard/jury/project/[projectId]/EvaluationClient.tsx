'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { Field, Input, Textarea } from '@/components/ui/FormControls'
import { FileText, Image as ImageIcon, MousePointerClick, FolderGit2, Video, ExternalLink, CheckCircle2, FileCheck, ClipboardList } from 'lucide-react'
import styles from '../../../dashboard.module.css'

const SCORE_FIELDS = [
  { key: 'scoreProblemUnderstanding', label: 'Problem Understanding', max: 10, helper: 'Does the team clearly identify a real-world problem? Is it relevant? Is it well-defined?' },
  { key: 'scoreInnovation', label: 'Innovation & Creativity', max: 15, helper: 'Is the solution original? Does it provide a better approach than existing solutions?' },
  { key: 'scoreTechnicalImpl', label: 'Technical Implementation', max: 20, helper: 'Is the technology appropriate? Good architecture? Good engineering practices?' },
  { key: 'scorePrototypeFunc', label: 'Prototype Functionality', max: 20, helper: 'Does it function as demonstrated? Core features working? Stable?' },
  { key: 'scoreUiUx', label: 'User Experience (UI/UX)', max: 10, helper: 'Clean and intuitive? Smooth journey? Visually appealing?' },
  { key: 'scoreScalability', label: 'Scalability & Feasibility', max: 10, helper: 'Can it scale? Practical to implement? Long-term potential?' },
  { key: 'scorePresentation', label: 'Presentation & Demo', max: 10, helper: 'Presented clearly? Live demo successful? Questions answered confidently?' },
  { key: 'scoreImpactPotential', label: 'Impact & Future Potential', max: 5, helper: 'Meaningful impact? Addresses genuine need?' },
];

const RESOURCE_LINKS = [
  { key: 'architectureFileUrl', label: 'Architecture', icon: <FileText size={14} /> },
  { key: 'mockupFileUrl', label: 'Mockup', icon: <ImageIcon size={14} /> },
  { key: 'prototypeLinkUrl', label: 'Prototype', icon: <MousePointerClick size={14} /> },
  { key: 'githubRepoUrl', label: 'GitHub', icon: <FolderGit2 size={14} /> },
  { key: 'demoVideoUrl', label: 'Demo Video', icon: <Video size={14} /> },
];

type EvalProject = {
  id: string;
  projectTitle: string;
  oneLiner: string | null;
  track: string;
  targetUsers: string[];
  problemStatement: string;
  proposedSolution: string;
  coreFeatures: { id: string; title: string; description: string }[];
  techFrontend: string[];
  techBackend: string[];
  techDatabase: string[];
  techAiMl: string[];
  techCloud: string[];
  techApis: string[];
  architectureFileUrl: string | null;
  mockupFileUrl: string | null;
  prototypeLinkUrl: string | null;
  githubRepoUrl: string | null;
  demoVideoUrl: string | null;
};

type EvalData = {
  scoreProblemUnderstanding?: number;
  scoreInnovation?: number;
  scoreTechnicalImpl?: number;
  scorePrototypeFunc?: number;
  scoreUiUx?: number;
  scoreScalability?: number;
  scorePresentation?: number;
  scoreImpactPotential?: number;
  strengths?: string;
  areasForImprovement?: string;
  overallComments?: string;
  status?: string;
};

export default function EvaluationClient({ project, initialEvaluation }: { project: EvalProject, initialEvaluation: EvalData | null }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'project' | 'evaluation'>('project');

  const [evalData, setEvalData] = useState({
    scoreProblemUnderstanding: initialEvaluation?.scoreProblemUnderstanding || 0,
    scoreInnovation: initialEvaluation?.scoreInnovation || 0,
    scoreTechnicalImpl: initialEvaluation?.scoreTechnicalImpl || 0,
    scorePrototypeFunc: initialEvaluation?.scorePrototypeFunc || 0,
    scoreUiUx: initialEvaluation?.scoreUiUx || 0,
    scoreScalability: initialEvaluation?.scoreScalability || 0,
    scorePresentation: initialEvaluation?.scorePresentation || 0,
    scoreImpactPotential: initialEvaluation?.scoreImpactPotential || 0,
    strengths: initialEvaluation?.strengths || '',
    areasForImprovement: initialEvaluation?.areasForImprovement || '',
    overallComments: initialEvaluation?.overallComments || '',
  });

  const totalScore = useMemo(() =>
    SCORE_FIELDS.reduce((sum, f) => sum + Number(evalData[f.key as keyof typeof evalData] || 0), 0),
    [evalData]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEvalData({ ...evalData, [e.target.name]: e.target.value });
  }

  const submitEval = async (status: 'DRAFT' | 'SUBMITTED') => {
    setIsSubmitting(true);
    try {
      await fetch(`/api/jury/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...evalData, totalScore, status, projectId: project.id })
      });
      router.refresh();
      alert(status === 'SUBMITTED' ? "Evaluation submitted successfully." : "Draft saved.");
    } catch {
      alert("Failed to save evaluation.");
    }
    setIsSubmitting(false);
  }

  const isLocked = initialEvaluation?.status === 'SUBMITTED';

  const tabButton = (tab: 'project' | 'evaluation', label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={activeTab === tab ? styles.tabActive : styles.tab}
      type="button"
    >
      <span className={styles.tabIcon}>{icon}</span>
      {label}
    </button>
  );

  return (
    <div style={{ marginTop: '2rem' }}>
      <div className={styles.tabs}>
        {tabButton('project', 'Project Details', <FileCheck size={16} />)}
        {tabButton('evaluation', 'Evaluation Form', <ClipboardList size={16} />)}
      </div>

      <Card style={{ padding: '2rem' }}>

        {activeTab === 'project' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
            <div>
              <h2 style={{ color: 'var(--ink)' }}>{project.projectTitle}</h2>
              <p style={{ fontStyle: 'italic', color: 'var(--ink-60)', marginTop: '0.25rem' }}>{project.oneLiner}</p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Tag tone="accent">Track: {project.track.replace(/_/g, ' ')}</Tag>
              {project.targetUsers?.length > 0 && <Tag tone="neutral">Target: {project.targetUsers.join(', ')}</Tag>}
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

            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Tech Stack</h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {(['techFrontend', 'techBackend', 'techDatabase', 'techAiMl', 'techCloud', 'techApis'] as const).map(tech => {
                  const stack = (project as unknown as Record<string, string[] | undefined>)[tech];
                  return stack && stack.length > 0 ? (
                    <Tag key={tech} tone="neutral">{tech.replace('tech', '').replace(/([A-Z])/g, ' $1').trim()}: {stack.join(', ')}</Tag>
                  ) : null;
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {RESOURCE_LINKS.map(({ key, label, icon }) => {
                const url = project[key as keyof EvalProject];
                return typeof url === 'string' && url && (
                  <a key={key} href={url} target="_blank" rel="noreferrer" className={styles.linkButton}>
                    {icon} {label} <ExternalLink size={12} />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'evaluation' && (
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {isLocked && (
              <div className={styles.lockedBanner}>
                <CheckCircle2 size={18} />
                <span>Evaluation Submitted. This form is now read-only.</span>
              </div>
            )}

            <div style={{ display: 'grid', gap: '1rem' }}>
              {SCORE_FIELDS.map((field, idx) => (
                <div key={field.key} style={{ padding: '1rem', border: '1px solid var(--line)', borderRadius: 'var(--radius)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <h4 style={{ fontWeight: 600 }}>{idx + 1}. {field.label} ({field.max} Marks)</h4>
                    <Input type="number" name={field.key} value={evalData[field.key as keyof typeof evalData] as number} onChange={handleChange} min="0" max={field.max} disabled={isLocked} style={{ width: '90px' }} />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--ink-60)', marginTop: '0.5rem' }}>{field.helper}</p>
                </div>
              ))}

              <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontWeight: 700 }}>Total Score</h3>
                <h2 className="tabular-nums" style={{ color: 'var(--flame-red)' }}>{totalScore} <span style={{ fontSize: '1rem', color: 'var(--ink-60)' }}>/ 100</span></h2>
              </div>

              <Field label="Strengths">
                <Textarea rows={3} name="strengths" value={evalData.strengths} onChange={handleChange} disabled={isLocked} />
              </Field>
              <Field label="Areas for Improvement">
                <Textarea rows={3} name="areasForImprovement" value={evalData.areasForImprovement} onChange={handleChange} disabled={isLocked} />
              </Field>
              <Field label="Overall Comments">
                <Textarea rows={3} name="overallComments" value={evalData.overallComments} onChange={handleChange} disabled={isLocked} />
              </Field>
            </div>

            {!isLocked && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <Button variant="secondary" onClick={() => submitEval('DRAFT')} disabled={isSubmitting}>Save as Draft</Button>
                <Button variant="primary" onClick={() => submitEval('SUBMITTED')} disabled={isSubmitting}>Submit Final Evaluation</Button>
              </div>
            )}
          </div>
        )}

      </Card>
    </div>
  )
}