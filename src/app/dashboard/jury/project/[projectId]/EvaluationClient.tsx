'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { Field, Input, Textarea } from '@/components/ui/FormControls'
import { ExternalLink, CheckCircle2, FileText, ImageIcon, MousePointerClick, FolderGit2, Video } from 'lucide-react'
import styles from '../../../dashboard.module.css'

const REVIEW1_FIELDS = [
  { key: 'r1ProblemUnderstanding', label: 'Problem Understanding', max: 10, helper: 'How clearly the team understands the problem, users, pain points, and requirements' },
  { key: 'r1ProposedSolution', label: 'Proposed Solution & Innovation', max: 10, helper: 'Relevance of the solution, uniqueness, practicality, and innovation' },
  { key: 'r1TechUnderstanding', label: 'Technical Understanding', max: 8, helper: 'Understanding of technologies, architecture, AI/ML concepts, APIs, database, etc.' },
  { key: 'r1PrototypeDev', label: 'Prototype Development', max: 12, helper: 'Working prototype, core features implemented, functionality, and demo quality' },
  { key: 'r1UiUx', label: 'User Flow & UI/UX', max: 5, helper: 'Ease of use, navigation, interface design, and whether the UI supports the intended users' },
  { key: 'r1TeamUnderstanding', label: 'Team Understanding & Contribution', max: 5, helper: "Each member's understanding of their work and ability to explain their contribution" },
];

const REVIEW2_FIELDS = [
  { key: 'r2FeedbackImplementation', label: 'Implementation of Review 1 Feedback', max: 10, helper: 'Did they actually address the feedback given during Review 1?' },
  { key: 'r2Improvements', label: 'Improvements & Iteration', max: 10, helper: 'New features, corrections, optimization, improved workflow, better UI/UX, etc.' },
  { key: 'r2PrototypeFunctionality', label: 'Prototype Functionality & Completeness', max: 12, helper: 'How well the updated prototype works and how much of the solution is functional' },
  { key: 'r2TechImplementation', label: 'Technical Implementation', max: 8, helper: 'Code quality, architecture, database/API integration, AI/ML implementation, security, etc.' },
  { key: 'r2TestingValidation', label: 'Testing & Validation', max: 5, helper: 'Testing performed, bugs identified/fixed, user feedback, accuracy/performance evaluation' },
  { key: 'r2TeamPresentation', label: 'Team Understanding & Presentation', max: 5, helper: 'Ability of members to explain changes, technical decisions, and individual contributions' },
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
  r1ProblemUnderstanding?: number;
  r1ProposedSolution?: number;
  r1TechUnderstanding?: number;
  r1PrototypeDev?: number;
  r1UiUx?: number;
  r1TeamUnderstanding?: number;
  r1Remark?: string;
  r2FeedbackImplementation?: number;
  r2Improvements?: number;
  r2PrototypeFunctionality?: number;
  r2TechImplementation?: number;
  r2TestingValidation?: number;
  r2TeamPresentation?: number;
  r2Remark?: string;
  status?: string;
};

export default function EvaluationClient({ project, initialEvaluation }: { project: EvalProject, initialEvaluation: EvalData | null }) {
  const router = useRouter();
  
  const [evalData, setEvalData] = useState({
    r1ProblemUnderstanding: initialEvaluation?.r1ProblemUnderstanding || 0,
    r1ProposedSolution: initialEvaluation?.r1ProposedSolution || 0,
    r1TechUnderstanding: initialEvaluation?.r1TechUnderstanding || 0,
    r1PrototypeDev: initialEvaluation?.r1PrototypeDev || 0,
    r1UiUx: initialEvaluation?.r1UiUx || 0,
    r1TeamUnderstanding: initialEvaluation?.r1TeamUnderstanding || 0,
    r1Remark: initialEvaluation?.r1Remark || '',
    
    r2FeedbackImplementation: initialEvaluation?.r2FeedbackImplementation || 0,
    r2Improvements: initialEvaluation?.r2Improvements || 0,
    r2PrototypeFunctionality: initialEvaluation?.r2PrototypeFunctionality || 0,
    r2TechImplementation: initialEvaluation?.r2TechImplementation || 0,
    r2TestingValidation: initialEvaluation?.r2TestingValidation || 0,
    r2TeamPresentation: initialEvaluation?.r2TeamPresentation || 0,
    r2Remark: initialEvaluation?.r2Remark || '',
  });

  const totalR1 = useMemo(() => REVIEW1_FIELDS.reduce((sum, f) => sum + Number(evalData[f.key as keyof typeof evalData] || 0), 0), [evalData]);
  const totalR2 = useMemo(() => REVIEW2_FIELDS.reduce((sum, f) => sum + Number(evalData[f.key as keyof typeof evalData] || 0), 0), [evalData]);
  const totalScore = totalR1 + totalR2;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);

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

  return (
    <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Team & Problem Statement Section */}
      <Card style={{ padding: '2rem' }}>
        <h2 style={{ color: 'var(--ink)' }}>{project.projectTitle}</h2>
        <p style={{ fontStyle: 'italic', color: 'var(--ink-60)', marginTop: '0.25rem', marginBottom: '1.5rem' }}>{project.oneLiner}</p>

        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--line)', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', color: 'var(--brand)' }}>Problem Statement</h3>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{project.problemStatement}</p>
        </div>

        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--line)', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', color: 'var(--brand)' }}>Proposed Solution</h3>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{project.proposedSolution}</p>
        </div>

        {/* Collapsible section for extra details */}
        <div>
          <button 
            type="button" 
            onClick={() => setShowMoreDetails(!showMoreDetails)}
            style={{ background: 'none', border: 'none', color: 'var(--flame-red)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            {showMoreDetails ? 'Hide additional project details -' : 'Show additional project details +'}
          </button>
          
          {showMoreDetails && (
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Tag tone="accent">Track: {project.track.replace(/_/g, ' ')}</Tag>
                {project.targetUsers?.length > 0 && <Tag tone="neutral">Target: {project.targetUsers.join(', ')}</Tag>}
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
        </div>
      </Card>

      {/* 2. Evaluation Form */}
      <Card style={{ padding: '2rem' }}>
        {isLocked && (
          <div className={styles.lockedBanner} style={{ marginBottom: '2rem' }}>
            <CheckCircle2 size={18} />
            <span>Evaluation Submitted. This form is now read-only.</span>
          </div>
        )}

        <h2 style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--line)', paddingBottom: '0.5rem' }}>Review 1: Problem Understanding & Initial Prototype</h2>
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
          {REVIEW1_FIELDS.map((field, idx) => (
            <div key={field.key} style={{ padding: '1.5rem', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: '1.1rem' }}>{idx + 1}. {field.label}</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--ink-60)', marginTop: '0.25rem' }}>{field.helper}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Input type="number" name={field.key} value={evalData[field.key as keyof typeof evalData] as number} onChange={handleChange} min="0" max={field.max} disabled={isLocked} style={{ width: '80px', textAlign: 'center', fontWeight: 'bold' }} />
                  <span style={{ color: 'var(--ink-60)', fontWeight: 600 }}>/ {field.max}</span>
                </div>
              </div>
            </div>
          ))}
          <Field label="Review 1 Remarks (Private to Jury)">
            <Textarea rows={4} name="r1Remark" value={evalData.r1Remark} onChange={handleChange} disabled={isLocked} placeholder="Add your private remarks for Review 1..." />
          </Field>
          <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.1rem', marginTop: '0.5rem', color: 'var(--ink)' }}>
            Review 1 Total: <span style={{ color: 'var(--flame-red)' }}>{totalR1}</span> / 50
          </div>
        </div>

        <h2 style={{ marginBottom: '1.5rem', marginTop: '3rem', borderBottom: '2px solid var(--line)', paddingBottom: '0.5rem' }}>Review 2: Iteration & Final Delivery</h2>
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
          {REVIEW2_FIELDS.map((field, idx) => (
            <div key={field.key} style={{ padding: '1.5rem', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: '1.1rem' }}>{idx + 1}. {field.label}</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--ink-60)', marginTop: '0.25rem' }}>{field.helper}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Input type="number" name={field.key} value={evalData[field.key as keyof typeof evalData] as number} onChange={handleChange} min="0" max={field.max} disabled={isLocked} style={{ width: '80px', textAlign: 'center', fontWeight: 'bold' }} />
                  <span style={{ color: 'var(--ink-60)', fontWeight: 600 }}>/ {field.max}</span>
                </div>
              </div>
            </div>
          ))}
          <Field label="Review 2 Remarks (Private to Jury)">
            <Textarea rows={4} name="r2Remark" value={evalData.r2Remark} onChange={handleChange} disabled={isLocked} placeholder="Add your private remarks for Review 2..." />
          </Field>
          <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.1rem', marginTop: '0.5rem', color: 'var(--ink)' }}>
            Review 2 Total: <span style={{ color: 'var(--flame-red)' }}>{totalR2}</span> / 50
          </div>
        </div>

        {/* Total Score & Submit */}
        <div style={{ background: 'var(--sidebar-bg)', color: '#fff', padding: '1.5rem 2rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem' }}>
          <div>
            <h3 style={{ fontWeight: 700, margin: 0 }}>Final Evaluation Score</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '0.875rem' }}>Sum of Review 1 and Review 2</p>
          </div>
          <h2 className="tabular-nums" style={{ color: '#fff', margin: 0, fontSize: '2.5rem' }}>
            {totalScore} <span style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.5)' }}>/ 100</span>
          </h2>
        </div>

        {!isLocked && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <Button variant="secondary" onClick={() => submitEval('DRAFT')} disabled={isSubmitting}>Save as Draft</Button>
            <Button variant="primary" onClick={() => submitEval('SUBMITTED')} disabled={isSubmitting}>Submit Final Evaluation</Button>
          </div>
        )}
      </Card>
    </div>
  )
}