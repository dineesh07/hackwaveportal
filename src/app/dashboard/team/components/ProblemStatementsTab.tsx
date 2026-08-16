'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { FileText, Target, Users, Zap } from 'lucide-react'
import styles from '../../dashboard.module.css'

export const PROBLEM_STATEMENTS = [
  {
    id: 'PS-001',
    title: 'AI-Powered Crop Disease Detection',
    domain: 'Agriculture',
    description: 'Develop a computer vision model that can identify common crop diseases from smartphone images and suggest organic remedies.',
    targetUsers: 'Farmers, Agricultural Extension Workers',
    complexity: 'High'
  },
  {
    id: 'PS-002',
    title: 'Smart City Traffic Optimization',
    domain: 'Smart Cities',
    description: 'Create an algorithm that uses real-time camera feeds to optimize traffic light timings and reduce congestion in urban areas.',
    targetUsers: 'City Planners, Commuters',
    complexity: 'High'
  },
  {
    id: 'PS-003',
    title: 'Accessible Educational Platform for Rural Areas',
    domain: 'Education',
    description: 'Build a low-bandwidth, offline-first educational platform that syncs content when internet is available, tailored for rural students.',
    targetUsers: 'Students in Remote Areas, NGOs',
    complexity: 'Medium'
  },
  {
    id: 'PS-004',
    title: 'Blockchain-based Supply Chain Authenticator',
    domain: 'Blockchain',
    description: 'Design a decentralized application to verify the authenticity of high-value goods (like medicine or luxury items) from manufacturer to consumer.',
    targetUsers: 'Logistics Companies, Consumers',
    complexity: 'High'
  },
  {
    id: 'PS-005',
    title: 'Mental Health Peer Support Chatbot',
    domain: 'Healthcare',
    description: 'Develop an empathetic conversational agent that provides initial mental health triage and connects users with human counselors if necessary.',
    targetUsers: 'Young Adults, Healthcare Providers',
    complexity: 'Medium'
  }
];

export default function ProblemStatementsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ padding: '0 0.5rem', marginBottom: '0.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' }}>Available Problem Statements</h2>
        <p style={{ color: 'var(--ink-60)', marginTop: '0.25rem' }}>
          Browse through the problem statements below. You can select one of these during your Phase 1 submission.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {PROBLEM_STATEMENTS.map((ps) => (
          <Card key={ps.id} style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <span style={{ 
                background: 'rgba(56, 189, 248, 0.1)', 
                color: '#0369a1', 
                padding: '0.25rem 0.75rem', 
                borderRadius: '999px', 
                fontSize: '0.75rem', 
                fontWeight: 700 
              }}>
                {ps.id}
              </span>
              <span style={{ 
                background: ps.complexity === 'High' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                color: ps.complexity === 'High' ? 'var(--danger)' : 'var(--flame-gold)',
                padding: '0.25rem 0.75rem', 
                borderRadius: '999px', 
                fontSize: '0.75rem', 
                fontWeight: 600
              }}>
                {ps.complexity}
              </span>
            </div>
            
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
              {ps.title}
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ink-40)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              <Target size={14} />
              <span>{ps.domain}</span>
            </div>
            
            <p style={{ color: 'var(--ink-60)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem', flex: 1 }}>
              {ps.description}
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--line)', color: 'var(--ink-60)', fontSize: '0.875rem' }}>
              <Users size={16} />
              <span style={{ fontWeight: 600 }}>Users:</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ps.targetUsers}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
