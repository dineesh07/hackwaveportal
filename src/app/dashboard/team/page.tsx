import React from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getTeamData } from './team-data'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { CheckCircle2, Loader, FileCheck, Award, Megaphone, Users, Target } from 'lucide-react'
import styles from '../dashboard.module.css'

export default async function TeamDashboardPage() {
  const session = await auth()

  if (!session?.user?.id) return null;

  const teamData = await getTeamData(session.user.id, session.user.rollNo)
  if (!teamData || !teamData.team) return null

  const { team, status, pendingTasks, isShortlisted, project } = teamData

  const timelineEvents = [
    { label: 'Registration', status: 'completed' },
    { label: 'Phase 1 Submission', status: status === 'SUBMITTED' || status === 'UNDER_REVIEW' || status === 'REVIEWED' ? 'completed' : 'current' },
    { label: 'Review', status: status === 'UNDER_REVIEW' ? 'current' : status === 'REVIEWED' ? 'completed' : 'upcoming' },
    { label: 'Phase 2', status: 'upcoming' },
    { label: 'Results', status: 'upcoming' },
  ];

  const awards = project?.awards || [];
  
  // Calculate Submission Progress
  let progress = 0;
  if (project) {
    let filledFields = 0;
    const totalFields = 10;
    
    if (project.projectTitle) filledFields++;
    if (project.oneLiner) filledFields++;
    if (project.problemStatement) filledFields++;
    if (project.proposedSolution) filledFields++;
    if (project.targetUsers && project.targetUsers.length > 0) filledFields++;
    if (project.coreFeatures && project.coreFeatures.length > 0) filledFields++;
    if (project.techFrontend.length > 0 || project.techBackend.length > 0) filledFields++;
    if (project.potentialChallenges) filledFields++;
    if (project.architectureFileUrl) filledFields++;
    if (project.demoVideoUrl || project.mockupFileUrl) filledFields++;

    progress = Math.round((filledFields / totalFields) * 100);
  }

  // Fetch total teams
  const totalTeams = await prisma.team.count();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Timeline Section */}
      <Card style={{ padding: '2rem' }}>
        <h2 className={styles.sectionTitle} style={{ marginBottom: '2rem' }}>Event Timeline</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '24px', left: '10%', right: '10%', height: '4px', background: 'var(--line)', zIndex: 0 }} />
          <div style={{ position: 'absolute', top: '24px', left: '10%', width: status === 'REVIEWED' ? '50%' : status === 'SUBMITTED' ? '25%' : '0%', height: '4px', background: 'var(--success)', zIndex: 0, transition: 'width 0.5s ease' }} />
          
          {timelineEvents.map((evt, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: '20%' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', 
                background: evt.status === 'completed' ? 'var(--success)' : evt.status === 'current' ? 'var(--flame-gold)' : 'var(--surface)',
                border: `4px solid ${evt.status === 'upcoming' ? 'var(--line)' : '#fff'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: evt.status === 'completed' || evt.status === 'current' ? '#fff' : 'var(--ink-40)',
                boxShadow: evt.status === 'current' ? '0 0 0 4px rgba(255, 201, 74, 0.2)' : 'none',
                marginBottom: '1rem'
              }}>
                {evt.status === 'completed' ? <CheckCircle2 size={24} /> : idx + 1}
              </div>
              <span style={{ fontWeight: evt.status === 'current' ? 700 : 600, color: evt.status === 'upcoming' ? 'var(--ink-40)' : 'var(--ink)', fontSize: '0.875rem', textAlign: 'center' }}>
                {evt.label}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Stats Section */}
      <section className={styles.metricsGrid} style={{ marginBottom: 0 }}>
        <StatCard 
          label="Submission Progress" 
          value={`${progress}%`} 
          icon={<Target size={18} />} 
          tone={progress === 100 ? 'success' : 'gold'}
        />
        <StatCard
          label="Submission Status"
          value={status.replace('_', ' ')}
          icon={status === 'SUBMITTED' || status === 'REVIEWED' ? <CheckCircle2 size={18} /> : status === 'UNDER_REVIEW' ? <Loader size={18} /> : <FileCheck size={18} />}
          tone={status === 'SUBMITTED' || status === 'REVIEWED' ? 'success' : status === 'UNDER_REVIEW' ? 'gold' : 'default'}
        />
        <StatCard
          label="Teams Participating"
          value={totalTeams.toString()}
          icon={<Users size={18} />}
        />
      </section>

      {/* Announcements Section */}
      <Card>
        <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Megaphone size={20} /> Announcements
        </h2>
        
        {isShortlisted && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', background: 'rgba(31, 146, 84, 0.05)', borderRadius: '8px', border: '1px solid rgba(31, 146, 84, 0.2)', marginBottom: '1rem' }}>
            <Award size={24} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontWeight: 700, color: 'var(--success)', marginBottom: '0.25rem' }}>Congratulations!</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-80)' }}>Your team has been shortlisted for the next phase. Keep up the good work!</p>
            </div>
          </div>
        )}

        {awards.map((award: any, i: number) => (
          <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', background: 'rgba(255, 201, 74, 0.05)', borderRadius: '8px', border: '1px solid rgba(255, 201, 74, 0.2)', marginBottom: '1rem' }}>
            <Award size={24} color="var(--flame-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontWeight: 700, color: 'var(--flame-gold)', marginBottom: '0.25rem' }}>Award Received: {award.award.title}</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-80)' }}>{award.award.description}</p>
            </div>
          </div>
        ))}

        {!isShortlisted && awards.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ink-40)', background: 'var(--surface)', borderRadius: '8px' }}>
            <Megaphone size={32} style={{ opacity: 0.5, margin: '0 auto 1rem' }} />
            <p>No new announcements at this time. Stay tuned!</p>
          </div>
        )}
      </Card>
      
    </div>
  )
}
