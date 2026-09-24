'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { Field, Input, Textarea } from '@/components/ui/FormControls'
import { ExternalLink, CheckCircle2, FileText, ImageIcon, MousePointerClick, FolderGit2, Video } from 'lucide-react'
import styles from '../../../dashboard.module.css'
import { PROBLEM_STATEMENTS } from '@/data/problem-statements'


const REVIEW1_FIELDS = [
  { key: 'r1OriginalityInnovation', label: 'Idea Originality, Innovation & Relevance', max: 10, helper: 'Uniqueness, innovation, creativity, and relevance of the idea' },
  { key: 'r1Feasibility', label: 'Feasibility', max: 5, helper: 'Practicality and potential for real-world application' },
  { key: 'r1ClarityConcept', label: 'Clarity of Concept', max: 10, helper: 'How clearly the idea, problem, and proposed solution are communicated and understood' },
  { key: 'r1TechCompetence', label: 'Technical Competence', max: 5, helper: 'Level of technical knowledge and expertise demonstrated' },
  { key: 'r1TeamCollaboration', label: 'Team Collaboration', max: 5, helper: 'Effective contribution, coordination, and collaboration among team members' },
  { key: 'r1PresentationQa', label: 'Demo Presentation & Question and Answer', max: 5, helper: 'Clear, concise, and detailed explanation, along with the ability to effectively respond to questions' },
];

const REVIEW2_FIELDS = [
  { key: 'r2UiUx', label: 'Design & UI/UX', max: 15, helper: 'Look and feel of the project, user interface, usability, and overall user experience' },
  { key: 'r2Functionality', label: 'Functionality & Usability', max: 5, helper: 'Smooth operation, reliability, and absence of critical bugs' },
  { key: 'r2TechImplementation', label: 'Technical Implementation', max: 20, helper: 'Effective and appropriate use of relevant tools, technologies, and technical approaches' },
  { key: 'r2Progress', label: 'Progress Since Round 1', max: 10, helper: 'Improvement, development, and refinement of the initial idea and prototype' },
  { key: 'r2FeedbackIncorporation', label: 'Incorporation of Feedback', max: 5, helper: 'Ability to receive and implement feedback, along with scope for future iterations and improvements' },
  { key: 'r2OverallImpressions', label: 'Overall Impressions', max: 5, helper: 'Overall quality, completeness, impact, and presentation of the project' },
  { key: 'r2QuestionAnswer', label: 'Question and Answer', max: 5, helper: 'Ability to clearly explain technical and functional aspects and effectively respond to questions' },
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
  problemStatementId?: string | null;
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
  r1OriginalityInnovation?: number;
  r1Feasibility?: number;
  r1ClarityConcept?: number;
  r1TechCompetence?: number;
  r1TeamCollaboration?: number;
  r1PresentationQa?: number;
  r1Remark?: string;
  r2UiUx?: number;
  r2Functionality?: number;
  r2TechImplementation?: number;
  r2Progress?: number;
  r2FeedbackIncorporation?: number;
  r2OverallImpressions?: number;
  r2QuestionAnswer?: number;
  r2Remark?: string;
  status?: string;
};

const FIELD_MAX_MAP = [...REVIEW1_FIELDS, ...REVIEW2_FIELDS].reduce((acc, f) => {
  acc[f.key] = f.max;
  return acc;
}, {} as Record<string, number>);

export default function EvaluationClient({ project, initialEvaluation }: { project: EvalProject, initialEvaluation: EvalData | null }) {
  const router = useRouter();
  
  const [evalData, setEvalData] = useState<{ [key: string]: number | string }>({
    r1OriginalityInnovation: initialEvaluation?.r1OriginalityInnovation ?? 0,
    r1Feasibility: initialEvaluation?.r1Feasibility ?? 0,
    r1ClarityConcept: initialEvaluation?.r1ClarityConcept ?? 0,
    r1TechCompetence: initialEvaluation?.r1TechCompetence ?? 0,
    r1TeamCollaboration: initialEvaluation?.r1TeamCollaboration ?? 0,
    r1PresentationQa: initialEvaluation?.r1PresentationQa ?? 0,
    r1Remark: initialEvaluation?.r1Remark || '',
    
    r2UiUx: initialEvaluation?.r2UiUx ?? 0,
    r2Functionality: initialEvaluation?.r2Functionality ?? 0,
    r2TechImplementation: initialEvaluation?.r2TechImplementation ?? 0,
    r2Progress: initialEvaluation?.r2Progress ?? 0,
    r2FeedbackIncorporation: initialEvaluation?.r2FeedbackIncorporation ?? 0,
    r2OverallImpressions: initialEvaluation?.r2OverallImpressions ?? 0,
    r2QuestionAnswer: initialEvaluation?.r2QuestionAnswer ?? 0,
    r2Remark: initialEvaluation?.r2Remark || '',
  });

  const totalR1 = useMemo(() => {
    const sum = REVIEW1_FIELDS.reduce((acc, f) => {
      const val = parseFloat(String(evalData[f.key] || 0));
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
    return Number(sum.toFixed(2));
  }, [evalData]);

  const totalR2 = useMemo(() => {
    const sum = REVIEW2_FIELDS.reduce((acc, f) => {
      const val = parseFloat(String(evalData[f.key] || 0));
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
    return Number(sum.toFixed(2));
  }, [evalData]);

  const totalScore = useMemo(() => Number((totalR1 + totalR2).toFixed(2)), [totalR1, totalR2]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name in FIELD_MAX_MAP) {
      const max = FIELD_MAX_MAP[name];
      if (value === '' || value === '.') {
        setEvalData(prev => ({ ...prev, [name]: value }));
        return;
      }
      const num = parseFloat(value);
      if (isNaN(num)) {
        setEvalData(prev => ({ ...prev, [name]: '' }));
      } else if (num > max) {
        setEvalData(prev => ({ ...prev, [name]: max }));
      } else if (num < 0) {
        setEvalData(prev => ({ ...prev, [name]: 0 }));
      } else {
        setEvalData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setEvalData(prev => ({ ...prev, [name]: value }));
    }
  }

  const submitEval = async (status: 'DRAFT' | 'SUBMITTED') => {
    setIsSubmitting(true);
    try {
      // Validate and clamp all scores supporting decimals
      const cleanedData: Record<string, any> = { ...evalData };
      let r1Sum = 0;
      let r2Sum = 0;

      REVIEW1_FIELDS.forEach(f => {
        const raw = parseFloat(String(cleanedData[f.key])) || 0;
        const clamped = Math.max(0, Math.min(f.max, Number(raw.toFixed(2))));
        cleanedData[f.key] = clamped;
        r1Sum += clamped;
      });

      REVIEW2_FIELDS.forEach(f => {
        const raw = parseFloat(String(cleanedData[f.key])) || 0;
        const clamped = Math.max(0, Math.min(f.max, Number(raw.toFixed(2))));
        cleanedData[f.key] = clamped;
        r2Sum += clamped;
      });

      const finalTotal = Number((r1Sum + r2Sum).toFixed(2));

      const res = await fetch(`/api/jury/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cleanedData, totalScore: finalTotal, status, projectId: project.id })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to save evaluation.");
        setIsSubmitting(false);
        return;
      }
      router.refresh();
      alert(status === 'SUBMITTED' ? "Evaluation submitted successfully." : "Draft saved.");
    } catch {
      alert("Failed to save evaluation.");
    }
    setIsSubmitting(false);
  }



  const isLocked = initialEvaluation?.status === 'SUBMITTED';

  return (
    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Team & Problem Statement Section */}
      <Card className={styles.workspaceCard}>
        <h2 style={{ color: 'var(--ink)', fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.25rem', lineHeight: 1.3 }}>
          {project.projectTitle}
        </h2>
        <p style={{ fontStyle: 'italic', color: 'var(--ink-60)', fontSize: '0.925rem', marginTop: '0.25rem', marginBottom: '1.25rem' }}>
          {project.oneLiner}
        </p>

        {(() => {
          const lockedPS = PROBLEM_STATEMENTS.find(ps => ps.id === project.problemStatementId || ps.title === project.problemStatement);
          return (
            <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--line)', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--brand)', margin: 0 }}>Problem Statement</h3>
                {lockedPS && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{
                      background: 'var(--flame-red)',
                      color: '#fff',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      letterSpacing: '0.04em'
                    }}>
                      {lockedPS.id}
                    </span>
                    <span style={{
                      background: 'var(--surface-sunken)',
                      color: 'var(--ink-70)',
                      border: '1px solid var(--line)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {lockedPS.domain}
                    </span>
                  </div>
                )}
              </div>

              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)', margin: 0, lineHeight: 1.4 }}>
                {lockedPS ? lockedPS.title : project.problemStatement}
              </h4>

              {lockedPS ? (
                <div style={{
                  background: 'var(--surface-sunken)',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--line)',
                  color: 'var(--ink-80)',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap'
                }}>
                  {lockedPS.description}
                </div>
              ) : (
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, margin: 0, fontSize: '0.875rem' }}>{project.problemStatement}</p>
              )}
            </div>
          );
        })()}

        <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--line)', marginBottom: '1.25rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--brand)' }}>Proposed Solution</h3>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.875rem', margin: 0 }}>{project.proposedSolution}</p>
        </div>

        {/* Collapsible section for extra details */}
        <div>
          <button 
            type="button" 
            onClick={() => setShowMoreDetails(!showMoreDetails)}
            style={{ background: 'none', border: 'none', color: 'var(--flame-red)', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: '0.875rem' }}
          >
            {showMoreDetails ? 'Hide additional project details -' : 'Show additional project details +'}
          </button>
          
          {showMoreDetails && (
            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Tag tone="accent">Track: {project.track.replace(/_/g, ' ')}</Tag>
                {project.targetUsers?.length > 0 && <Tag tone="neutral">Target: {project.targetUsers.join(', ')}</Tag>}
              </div>

              {project.coreFeatures.length > 0 && (
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Core Features</h4>
                  <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.7, fontSize: '0.875rem' }}>
                    {project.coreFeatures.map(f => <li key={f.id} style={{ marginBottom: '0.35rem' }}><strong>{f.title}:</strong> {f.description}</li>)}
                  </ul>
                </div>
              )}

              <div>
                <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Tech Stack</h4>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {(['techFrontend', 'techBackend', 'techDatabase', 'techAiMl', 'techCloud', 'techApis'] as const).map(tech => {
                    const stack = (project as unknown as Record<string, string[] | undefined>)[tech];
                    return stack && stack.length > 0 ? (
                      <Tag key={tech} tone="neutral">{tech.replace('tech', '').replace(/([A-Z])/g, ' $1').trim()}: {stack.join(', ')}</Tag>
                    ) : null;
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
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
        </div>
      </Card>

      {/* 2. Evaluation Form */}
      <Card className={styles.workspaceCard}>
        {isLocked && (
          <div className={styles.lockedBanner} style={{ marginBottom: '1.5rem' }}>
            <CheckCircle2 size={18} />
            <span style={{ fontSize: '0.9rem' }}>Evaluation Submitted. This form is now read-only.</span>
          </div>
        )}

        <h2 className={styles.evalRoundHeader}>Round 1: Concept, Innovation & Feasibility (40 Marks)</h2>
        <div style={{ display: 'grid', gap: '0.875rem', marginBottom: '1.5rem' }}>
          {REVIEW1_FIELDS.map((field, idx) => (
            <div key={field.key} className={styles.evalCriterionCard}>
              <div className={styles.evalCriterionContent}>
                <div className={styles.evalCriterionHeader}>
                  <h4>{idx + 1}. {field.label}</h4>
                  <p>{field.helper}</p>
                </div>
                <div className={styles.evalScoreInputWrapper}>
                  <Input 
                    type="number" 
                    step="any" 
                    inputMode="decimal"
                    name={field.key} 
                    value={evalData[field.key] !== undefined ? evalData[field.key] : 0} 
                    onChange={handleChange} 
                    min="0" 
                    max={field.max} 
                    disabled={isLocked} 
                    style={{ width: '75px', textAlign: 'center', fontWeight: 'bold', fontSize: '1rem', padding: '0.5rem' }} 
                  />
                  <span style={{ color: 'var(--ink-60)', fontWeight: 700, fontSize: '0.9rem' }}>/ {field.max}</span>
                </div>
              </div>
            </div>
          ))}
          <Field label="Round 1 Remarks (Private to Jury)">
            <Textarea rows={3} name="r1Remark" value={evalData.r1Remark} onChange={handleChange} disabled={isLocked} placeholder="Add your private remarks for Round 1..." />
          </Field>
          <div className={styles.evalRoundTotal}>
            Round 1 Total: <span style={{ color: 'var(--flame-red)' }}>{totalR1}</span> / 40
          </div>
        </div>

        <h2 className={styles.evalRoundHeader} style={{ marginTop: '2.5rem' }}>Round 2: Technical Implementation, UI/UX & Progress (60 Marks)</h2>
        <div style={{ display: 'grid', gap: '0.875rem', marginBottom: '1.5rem' }}>
          {REVIEW2_FIELDS.map((field, idx) => (
            <div key={field.key} className={styles.evalCriterionCard}>
              <div className={styles.evalCriterionContent}>
                <div className={styles.evalCriterionHeader}>
                  <h4>{idx + 1}. {field.label}</h4>
                  <p>{field.helper}</p>
                </div>
                <div className={styles.evalScoreInputWrapper}>
                  <Input 
                    type="number" 
                    step="any" 
                    inputMode="decimal"
                    name={field.key} 
                    value={evalData[field.key] !== undefined ? evalData[field.key] : 0} 
                    onChange={handleChange} 
                    min="0" 
                    max={field.max} 
                    disabled={isLocked} 
                    style={{ width: '75px', textAlign: 'center', fontWeight: 'bold', fontSize: '1rem', padding: '0.5rem' }} 
                  />
                  <span style={{ color: 'var(--ink-60)', fontWeight: 700, fontSize: '0.9rem' }}>/ {field.max}</span>
                </div>
              </div>
            </div>
          ))}

          <Field label="Round 2 Remarks (Private to Jury)">
            <Textarea rows={3} name="r2Remark" value={evalData.r2Remark} onChange={handleChange} disabled={isLocked} placeholder="Add your private remarks for Round 2..." />
          </Field>
          <div className={styles.evalRoundTotal}>
            Round 2 Total: <span style={{ color: 'var(--flame-red)' }}>{totalR2}</span> / 60
          </div>
        </div>

        {/* Total Score & Submit */}
        <div className={styles.evalFinalScoreBanner}>
          <div>
            <h3 style={{ fontWeight: 700, margin: 0, fontSize: '1.1rem' }}>Final Evaluation Score</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0.25rem 0 0 0', fontSize: '0.825rem' }}>Sum of Round 1 (40) and Round 2 (60)</p>
          </div>
          <h2 className="tabular-nums" style={{ color: '#fff', margin: 0, fontSize: '2rem', fontWeight: 800 }}>
            {totalScore} <span style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)' }}>/ 100</span>
          </h2>
        </div>

        {!isLocked && (
          <div className={styles.evalActionButtons}>
            <Button variant="secondary" onClick={() => submitEval('DRAFT')} disabled={isSubmitting}>Save as Draft</Button>
            <Button variant="primary" onClick={() => submitEval('SUBMITTED')} disabled={isSubmitting}>Submit Final Evaluation</Button>
          </div>
        )}
      </Card>
    </div>
  )
}