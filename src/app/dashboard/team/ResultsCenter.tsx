import React from 'react'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { Trophy, Star, Medal, Sparkles, FileText, MessageSquare } from 'lucide-react'
import { AwardIcon } from '@/components/ui/AwardIcon'

export default async function ResultsCenter({ projectId }: { projectId: string }) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      mentorFeedback: true,
      tasks: true,
      juryEvaluations: true,
      leaderboardEntry: true,
      awards: { include: { award: true } }
    }
  });

  if (!project) return null;

  const isShortlisted = await prisma.shortlistDecision.findUnique({ where: { projectId: project.id } });

  const scoresPublished = project.leaderboardEntry?.scoresPublishedAt != null;
  const isFinalResultsPublished = scoresPublished;

  return (
    <Card style={{ marginTop: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Trophy size={24} color="var(--flame-orange)" />
        Results Center
      </h2>

      {!scoresPublished ? (
        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius)', borderLeft: '4px solid var(--flame-red)' }}>
          <p style={{ margin: 0 }}>Your project is currently in the evaluation pipeline. Results have not been published yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>

          {isShortlisted && (
            <div style={{
              border: '1px solid var(--line)', padding: '1.5rem', borderRadius: 'var(--radius)', textAlign: 'center',
              background: isShortlisted.isShortlisted ? 'rgba(31, 146, 84, 0.08)' : 'rgba(200, 30, 58, 0.08)'
            }}>
              <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Medal size={18} />
                Shortlisting Status
              </h3>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, color: isShortlisted.isShortlisted ? 'var(--success)' : 'var(--danger)' }}>
                {isShortlisted.isShortlisted ? 'Shortlisted for Phase 2' : 'Not Shortlisted'}
              </p>
              <p style={{ marginTop: '0.5rem', color: 'var(--ink-60)' }}>
                {isShortlisted.isShortlisted
                  ? 'Congratulations! Please wait for further instructions from the Staff Coordinator.'
                  : 'Thank you for participating in HACKWAVE. We appreciate your effort and encourage you to participate in future editions.'}
              </p>
            </div>
          )}

          {project.leaderboardEntry?.rank && isFinalResultsPublished && (
            <div style={{ border: '1px solid var(--line)', padding: '1.5rem', borderRadius: 'var(--radius)', textAlign: 'center', background: 'linear-gradient(135deg, var(--flame-gold), var(--flame-orange))', color: 'white' }}>
              <h3 style={{ marginBottom: '0.5rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Trophy size={18} />
                Competition Result
              </h3>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                {project.leaderboardEntry.rank === 1 ? 'Winner' :
                 project.leaderboardEntry.rank === 2 ? 'Runner-Up' :
                 project.leaderboardEntry.rank === 3 ? 'Second Runner-Up' : `Rank ${project.leaderboardEntry.rank}`}
              </div>
            </div>
          )}

          {project.awards.length > 0 && (
            <div style={{ border: '1px solid var(--line)', padding: '1.5rem', borderRadius: 'var(--radius)' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} color="var(--flame-gold)" />
                Awards Received
              </h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {project.awards.map(a => (
                  <div key={a.id} style={{ background: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius-sm)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', border: '1px solid var(--line)' }}>
                    <span style={{ color: 'var(--flame-red)', marginTop: '0.15rem', flexShrink: 0 }}>
                      <AwardIcon name={a.award.icon} size={18} />
                    </span>
                    <div>
                      <h4 style={{ color: 'var(--ink)', marginBottom: '0.25rem', fontWeight: 700 }}>{a.award.title}</h4>
                      <p style={{ fontSize: '0.875rem', color: 'var(--ink-60)' }}>{a.award.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {project.mentorFeedback.length > 0 && (
            <div style={{ border: '1px solid var(--line)', padding: '1.5rem', borderRadius: 'var(--radius)' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={18} />
                Mentor Feedback
              </h3>
              {project.mentorFeedback.map((feedback, i) => (
                <div key={feedback.id} style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--line)' }}>
                  <div style={{ marginTop: '0.5rem' }}>
                    {feedback.overallFeedback && (
                      <>
                        <strong style={{ color: 'var(--ink)' }}>Overall Feedback:</strong>
                        <p style={{ fontSize: '0.875rem', marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>{feedback.overallFeedback}</p>
                      </>
                    )}
                    {feedback.suggestions && (
                      <>
                        <strong style={{ color: 'var(--ink)' }}>Suggestions for Improvement:</strong>
                        <p style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>{feedback.suggestions}</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}
    </Card>
  )
}
