import React from 'react'
import Link from 'next/link'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getTeamData } from './team-data'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { CheckCircle2, Loader, FileCheck, Award, Megaphone, Users, Target, Trophy, Medal, Sparkles, Bell, Lightbulb, ArrowRight, Lock } from 'lucide-react'
import styles from '../dashboard.module.css'

export default async function TeamDashboardPage() {
  const session = await auth()

  if (!session?.user?.id) return null;

  const teamData = await getTeamData(session.user.id, session.user.rollNo)
  if (!teamData || !teamData.team) return null

  const { team, status, pendingTasks, isShortlisted, project } = teamData
  const leaderboardEntry = project?.leaderboardEntry
  const isResultsPublished = !!leaderboardEntry?.scoresPublishedAt
  const rank = leaderboardEntry?.rank
  const isWinner = isResultsPublished && rank === 1
  const isRunnerUp1 = isResultsPublished && rank === 2
  const isRunnerUp2 = isResultsPublished && rank === 3

  const platformSettings = await prisma.platformSettings.findUnique({ where: { id: 'singleton' } })

  const now = new Date()
  const dateRegistrationOpens = new Date('2026-08-25T00:00:00')
  const dateRegistrationEnds = platformSettings?.submissionDeadline ? new Date(platformSettings.submissionDeadline) : new Date('2026-09-07T23:59:59')
  const dateMentorReviewEnds = platformSettings?.phase1ReviewWindowEnd ? new Date(platformSettings.phase1ReviewWindowEnd) : new Date('2026-09-14T23:59:59')
  const dateIgniteEnds = platformSettings?.evaluationWindowEnd ? new Date(platformSettings.evaluationWindowEnd) : new Date('2026-09-26T23:59:59')

  // Strict date-synced progression based on the event schedule
  const step1Status: 'completed' | 'current' | 'upcoming' = now >= dateRegistrationOpens ? 'completed' : 'upcoming'
  const step2Status: 'completed' | 'current' | 'upcoming' = 
    now > dateRegistrationEnds ? 'completed' : 
    now >= dateRegistrationOpens ? 'current' : 'upcoming'
  const step3Status: 'completed' | 'current' | 'upcoming' = 
    now > dateMentorReviewEnds ? 'completed' : 
    now > dateRegistrationEnds ? 'current' : 'upcoming'
  const step4Status: 'completed' | 'current' | 'upcoming' = 
    now > dateIgniteEnds ? 'completed' : 
    now > dateMentorReviewEnds ? 'current' : 'upcoming'
  const step5Status: 'completed' | 'current' | 'upcoming' = 
    (now > dateIgniteEnds && isShortlisted) ? 'current' : 'upcoming'

  const timelineEvents = [
    { 
      step: '01',
      label: 'Registration Opens', 
      date: '25 AUG',
      status: step1Status
    },
    { 
      step: '02',
      label: 'Registration Ends', 
      date: '07 SEP',
      status: step2Status
    },
    { 
      step: '03',
      label: 'Atleast one Mentor review to be completed', 
      date: '14 SEP',
      status: step3Status
    },
    { 
      step: '04',
      label: 'HACKWAVE IGNITE', 
      sublabel: 'Phase 1 & Results',
      date: '26 SEP',
      status: step4Status
    },
    { 
      step: '05',
      label: 'HACKWAVE INNOVATE', 
      sublabel: 'Phase 2 Finale',
      date: 'TBA',
      status: step5Status
    },
  ];

  // Calculate accurate progress line width across 5 steps (4 segments = 20% each from 10% to 90%)
  const lastCompletedIndex = timelineEvents.reduce((acc, evt, idx) => evt.status === 'completed' ? idx : acc, -1);
  const currentActiveIndex = timelineEvents.findIndex(evt => evt.status === 'current');
  
  let progressLineWidth = '0%';
  if (lastCompletedIndex >= 0) {
    if (lastCompletedIndex === timelineEvents.length - 1) {
      progressLineWidth = '80%';
    } else if (currentActiveIndex > lastCompletedIndex) {
      progressLineWidth = `${lastCompletedIndex * 20 + 10}%`;
    } else {
      progressLineWidth = `${lastCompletedIndex * 20}%`;
    }
  }

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
  const totalTeams = await prisma.team.count({
    where: {
      status: 'ACTIVE',
      registrationStatus: { not: 'REJECTED' }
    }
  });

  const hasAnnouncements = Boolean(
    platformSettings?.announcementBanner ||
    isWinner ||
    isRunnerUp1 ||
    isRunnerUp2 ||
    isShortlisted ||
    awards.length > 0
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Timeline Section */}
      <Card style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Event Timeline</h2>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink-60)', background: 'var(--surface-sunken)', padding: '0.25rem 0.75rem', borderRadius: '20px', border: '1px solid var(--line)' }}>
            HACKWAVE 2026 Schedule
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '24px', left: '10%', right: '10%', height: '4px', background: 'var(--line)', zIndex: 0 }} />
          <div style={{ 
            position: 'absolute', 
            top: '24px', 
            left: '10%', 
            width: progressLineWidth, 
            height: '4px', 
            background: 'var(--success)', 
            zIndex: 0, 
            transition: 'width 0.5s ease' 
          }} />
          
          {timelineEvents.map((evt, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: '20%' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', 
                background: evt.status === 'completed' ? 'var(--success)' : evt.status === 'current' ? 'var(--flame-gold)' : 'var(--surface)',
                border: `4px solid ${evt.status === 'upcoming' ? 'var(--line)' : '#fff'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: evt.status === 'completed' || evt.status === 'current' ? '#fff' : 'var(--ink-40)',
                boxShadow: evt.status === 'current' ? '0 0 0 4px rgba(255, 201, 74, 0.25)' : 'none',
                marginBottom: '0.75rem'
              }}>
                {evt.status === 'completed' ? <CheckCircle2 size={24} /> : (idx + 1)}
              </div>
              <span style={{ fontWeight: evt.status === 'current' ? 700 : 600, color: evt.status === 'upcoming' ? 'var(--ink-40)' : 'var(--ink)', fontSize: '0.875rem', textAlign: 'center', lineHeight: '1.25' }}>
                {evt.label}
              </span>
              {evt.sublabel && (
                <span style={{ fontSize: '0.75rem', color: 'var(--ink-50)', textAlign: 'center', marginTop: '0.2rem' }}>
                  {evt.sublabel}
                </span>
              )}
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                color: evt.status === 'completed' ? 'var(--success)' : evt.status === 'current' ? '#b45309' : 'var(--ink-40)', 
                marginTop: '0.35rem',
                background: evt.status === 'completed' ? 'rgba(31, 146, 84, 0.08)' : evt.status === 'current' ? 'rgba(255, 201, 74, 0.2)' : 'transparent',
                padding: '0.15rem 0.5rem',
                borderRadius: '12px'
              }}>
                {evt.date}
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

      {/* Problem Statement Selection Status Banner */}
      <Card style={{ padding: '1.25rem 1.5rem', background: project?.problemStatementId ? 'linear-gradient(135deg, rgba(31, 146, 84, 0.08) 0%, rgba(31, 146, 84, 0.02) 100%)' : 'linear-gradient(135deg, rgba(255, 201, 74, 0.15) 0%, rgba(255, 107, 53, 0.08) 100%)', border: `1.5px solid ${project?.problemStatementId ? 'rgba(31, 146, 84, 0.3)' : 'rgba(255, 201, 74, 0.5)'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: project?.problemStatementId ? 'var(--success)' : 'linear-gradient(135deg, #ffc94a, #ff6b35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              flexShrink: 0
            }}>
              {project?.problemStatementId ? <Lock size={20} /> : <Lightbulb size={20} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  background: project?.problemStatementId ? 'var(--success)' : 'var(--flame-gold)',
                  color: project?.problemStatementId ? '#fff' : '#78350f',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '12px'
                }}>
                  {project?.problemStatementId ? 'Locked Problem Statement' : 'Problem Statement Required'}
                </span>
                {project?.problemStatementId && (
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink)' }}>
                    [{project.problemStatementId}] {project.problemStatement}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-70)', margin: 0 }}>
                {project?.problemStatementId
                  ? 'Your chosen problem statement is locked and reserved for your team. You can continue your submission details.'
                  : 'Please lock your problem statement before completing your Phase 1 submission. Slots are allocated per statement.'}
              </p>
            </div>
          </div>
          <Link
            href={project?.problemStatementId ? "/dashboard/team/problem-statements" : "/dashboard/team/problem-statements"}
            style={{
              background: project?.problemStatementId ? 'var(--surface)' : 'var(--flame-red)',
              color: project?.problemStatementId ? 'var(--ink)' : '#fff',
              border: project?.problemStatementId ? '1px solid var(--line)' : 'none',
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              textDecoration: 'none'
            }}
          >
            {project?.problemStatementId ? 'View Problem Statements' : 'Lock Problem Statement'} <ArrowRight size={15} />
          </Link>
        </div>
      </Card>

      {/* Announcements Section */}
      <Card>
        <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Megaphone size={20} /> Announcements
        </h2>

        {/* Global Platform Banner if active */}
        {platformSettings?.announcementBanner && (
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center',
            padding: '0.85rem 1.25rem',
            background: 'rgba(232, 40, 63, 0.06)',
            borderRadius: '8px',
            border: '1px solid rgba(232, 40, 63, 0.2)',
            marginBottom: '1rem',
            color: 'var(--ink)'
          }}>
            <Bell size={18} color="var(--flame-red)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{platformSettings.announcementBanner}</span>
          </div>
        )}

        {/* Phase 1 Winner Announcement (1st Place) */}
        {isWinner && (
          <div style={{
            display: 'flex',
            gap: '1.25rem',
            alignItems: 'flex-start',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(255, 201, 74, 0.18) 0%, rgba(255, 107, 53, 0.12) 100%)',
            borderRadius: '12px',
            border: '1.5px solid rgba(255, 201, 74, 0.6)',
            boxShadow: '0 4px 20px rgba(255, 201, 74, 0.15)',
            marginBottom: '1rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffc94a, #ff6b35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(255, 107, 53, 0.35)'
            }}>
              <Trophy size={28} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <span style={{
                  background: '#ffc94a',
                  color: '#78350f',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.25rem 0.7rem',
                  borderRadius: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  🏆 1st Place Winner
                </span>
                <span style={{
                  background: 'rgba(26, 26, 26, 0.08)',
                  color: 'var(--ink-80)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.25rem 0.6rem',
                  borderRadius: '20px'
                }}>
                  Phase 1
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '0.4rem' }}>
                🎉 Congratulations! Your Team is the Winner of Phase 1!
              </h3>
              <p style={{ fontSize: '0.925rem', color: 'var(--ink-80)', lineHeight: '1.5', marginBottom: '0.85rem' }}>
                The official Phase 1 results have been announced! Your team <strong>{team.teamName}</strong> has been declared the <strong>Winner of Phase 1</strong> in HACKWAVE. Exceptional innovation, problem-solving, and presentation!
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {leaderboardEntry?.scoresPublishedAt && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'var(--surface)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--ink-60)',
                    border: '1px solid var(--line)'
                  }}>
                    Announced on {new Date(leaderboardEntry.scoresPublishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Phase 1 1st Runner-Up (2nd Place) */}
        {isRunnerUp1 && (
          <div style={{
            display: 'flex',
            gap: '1.25rem',
            alignItems: 'flex-start',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(148, 163, 184, 0.15) 0%, rgba(203, 213, 225, 0.2) 100%)',
            borderRadius: '12px',
            border: '1.5px solid rgba(148, 163, 184, 0.5)',
            boxShadow: '0 4px 16px rgba(148, 163, 184, 0.12)',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #94a3b8, #64748b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(100, 116, 139, 0.3)'
            }}>
              <Medal size={28} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <span style={{
                  background: '#e2e8f0',
                  color: '#334155',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.25rem 0.7rem',
                  borderRadius: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  🥈 1st Runner-Up (2nd Place)
                </span>
                <span style={{
                  background: 'rgba(26, 26, 26, 0.08)',
                  color: 'var(--ink-80)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.25rem 0.6rem',
                  borderRadius: '20px'
                }}>
                  Phase 1
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '0.4rem' }}>
                🎉 Congratulations! 1st Runner-Up in Phase 1!
              </h3>
              <p style={{ fontSize: '0.925rem', color: 'var(--ink-80)', lineHeight: '1.5', marginBottom: '0.85rem' }}>
                Official Phase 1 results have been announced! Your team <strong>{team.teamName}</strong> has secured <strong>2nd Place (1st Runner-Up)</strong> in Phase 1 of HACKWAVE. Excellent achievement and work!
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {leaderboardEntry?.scoresPublishedAt && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'var(--surface)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--ink-60)',
                    border: '1px solid var(--line)'
                  }}>
                    Announced on {new Date(leaderboardEntry.scoresPublishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Phase 1 2nd Runner-Up (3rd Place) */}
        {isRunnerUp2 && (
          <div style={{
            display: 'flex',
            gap: '1.25rem',
            alignItems: 'flex-start',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(254, 215, 170, 0.2) 100%)',
            borderRadius: '12px',
            border: '1.5px solid rgba(249, 115, 22, 0.4)',
            boxShadow: '0 4px 16px rgba(249, 115, 22, 0.12)',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f97316, #c2410c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(194, 65, 12, 0.35)'
            }}>
              <Medal size={28} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <span style={{
                  background: '#ffedd5',
                  color: '#9a3412',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.25rem 0.7rem',
                  borderRadius: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  🥉 2nd Runner-Up (3rd Place)
                </span>
                <span style={{
                  background: 'rgba(26, 26, 26, 0.08)',
                  color: 'var(--ink-80)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.25rem 0.6rem',
                  borderRadius: '20px'
                }}>
                  Phase 1
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '0.4rem' }}>
                🎉 Congratulations! 2nd Runner-Up in Phase 1!
              </h3>
              <p style={{ fontSize: '0.925rem', color: 'var(--ink-80)', lineHeight: '1.5', marginBottom: '0.85rem' }}>
                Official Phase 1 results have been announced! Your team <strong>{team.teamName}</strong> has secured <strong>3rd Place (2nd Runner-Up)</strong> in Phase 1 of HACKWAVE. Wonderful effort and execution!
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {leaderboardEntry?.scoresPublishedAt && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'var(--surface)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--ink-60)',
                    border: '1px solid var(--line)'
                  }}>
                    Announced on {new Date(leaderboardEntry.scoresPublishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
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

        {!hasAnnouncements && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ink-40)', background: 'var(--surface)', borderRadius: '8px' }}>
            <Megaphone size={32} style={{ opacity: 0.5, margin: '0 auto 1rem' }} />
            <p>No new announcements at this time. Stay tuned!</p>
          </div>
        )}
      </Card>
      
    </div>
  )
}
