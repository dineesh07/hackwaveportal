import React from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { StatusRibbon } from '@/components/ui/StatusRibbon'
import styles from '../../dashboard.module.css'
import ResultsClient from './ResultsClient'

export default async function CoordinatorResultsPage() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'COORDINATOR') {
    return <div>Unauthorized.</div>
  }

  const projects = await prisma.project.findMany({
    where: { phase: 1 },
    include: {
      team: true,
      juryEvaluations: {
        include: { jury: { select: { id: true, name: true, rollNo: true } } },
      },
      leaderboardEntry: true,
      awards: { include: { award: true } },
    }
  });

  const shortlistDecisions = await prisma.shortlistDecision.findMany({ where: { phase: 1 } });
  const shortlistedSet = new Set(shortlistDecisions.filter(s => s.isShortlisted).map(s => s.projectId));

  const leaderboard = projects.map(p => {
    const evals = p.juryEvaluations;
    const submittedEvals = evals.filter(e => e.status === 'SUBMITTED');
    const totalScore = submittedEvals.reduce((sum, e) => sum + e.totalScore, 0);
    const avgScore = submittedEvals.length > 0 ? (totalScore / submittedEvals.length) : 0;

    return {
      projectId: p.id,
      teamName: p.team.teamName,
      teamCode: p.team.teamCode || null,
      projectTitle: p.projectTitle,
      avgScore,
      evalCount: submittedEvals.length,
      totalAssigned: evals.length,
      isPublished: !!p.leaderboardEntry?.scoresPublishedAt,
      isShortlisted: shortlistedSet.has(p.id),
      rank: p.leaderboardEntry?.rank || null,
      lockedEvaluations: evals
        .filter(e => e.status === 'SUBMITTED')
        .map(e => ({
          id: e.id,
          juryName: e.jury.name,
          juryRollNo: e.jury.rollNo,
          totalScore: e.totalScore,
          submittedAt: e.submittedAt?.toISOString() || null,
          reopenReason: e.reopenReason,
        })),
    };
  }).sort((a, b) => {
    if (a.isPublished && b.isPublished && a.rank && b.rank) {
      return a.rank - b.rank;
    }
    return b.avgScore - a.avgScore;
  });

  leaderboard.forEach((l, index) => {
    if (!l.rank) l.rank = index + 1;
  });

  return (
    <>
      <div className={styles.dashboardContainer} style={{ paddingTop: 0 }}>
        <header className={styles.header} style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 className={styles.title}>Results & Leaderboard</h1>
            <p className={styles.subtitle}>Phase 1 Evaluations</p>
          </div>
          <StatusRibbon label="Phase 1" tone="hot" />
        </header>

        <ResultsClient leaderboard={leaderboard} />
      </div>
    </>
  )
}
