import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { writeAuditLog, getClientIp } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'COORDINATOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leaderboard, action, shortlistedIds, evaluationId, reason, winnerRanks } = await req.json();

    if (action === 'PHASE_1') {
      // Persist LeaderboardEntry for each project and publish scores
      const now = new Date();
      for (const entry of leaderboard) {
        await prisma.leaderboardEntry.upsert({
          where: { projectId: entry.projectId },
          create: {
            projectId: entry.projectId,
            phase: 1,
            averageScore: entry.avgScore,
            rank: entry.rank,
            scoresPublishedAt: now,
          },
          update: {
            phase: 1,
            averageScore: entry.avgScore,
            rank: entry.rank,
            scoresPublishedAt: now,
          },
        });
      }
      await writeAuditLog({
        actorId: session.user.id,
        action: 'PUBLISH_PHASE1_SCORES',
        targetType: 'Leaderboard',
        metadata: { count: leaderboard.length },
        ipAddress: getClientIp(req),
      });
    } else if (action === 'PHASE_RESULTS' || action === 'ANNOUNCE_WINNERS') {
      const now = new Date();
      const winnersMap = new Map<string, number>(); // projectId -> rank
      let maxWinnerRank = 0;
      if (Array.isArray(winnerRanks)) {
        winnerRanks.forEach((w: { projectId: string; rank: number }) => {
          if (w.projectId && w.rank) {
            winnersMap.set(w.projectId, w.rank);
            if (w.rank > maxWinnerRank) maxWinnerRank = w.rank;
          }
        });
      }

      // If leaderboard list is provided, update all entries
      if (Array.isArray(leaderboard) && leaderboard.length > 0) {
        let currentUnassignedRank = maxWinnerRank > 0 ? maxWinnerRank + 1 : 1;

        for (const entry of leaderboard) {
          let assignedRank = winnersMap.get(entry.projectId);
          if (!assignedRank) {
            assignedRank = currentUnassignedRank++;
          }

          await prisma.leaderboardEntry.upsert({
            where: { projectId: entry.projectId },
            create: {
              projectId: entry.projectId,
              phase: 1,
              averageScore: Number(entry.avgScore) || 0,
              rank: assignedRank,
              scoresPublishedAt: now,
            },
            update: {
              phase: 1,
              averageScore: Number(entry.avgScore) || 0,
              rank: assignedRank,
              scoresPublishedAt: now,
            },
          });
        }
      } else {
        // Just update winner ranks
        for (const [projectId, rank] of winnersMap.entries()) {
          await prisma.leaderboardEntry.upsert({
            where: { projectId },
            create: {
              projectId,
              phase: 1,
              averageScore: 0,
              rank,
              scoresPublishedAt: now,
            },
            update: {
              rank,
              scoresPublishedAt: now,
            },
          });
        }
      }

      await writeAuditLog({
        actorId: session.user.id,
        action: 'ANNOUNCE_PHASE_RESULTS',
        targetType: 'Leaderboard',
        metadata: {
          winnerCount: winnersMap.size,
          winners: Array.from(winnersMap.entries()).map(([pId, r]) => ({ projectId: pId, rank: r }))
        },
        ipAddress: getClientIp(req),
      });
    } else if (action === 'SHORTLIST') {
      // Create ShortlistDecision for selected projects
      const now = new Date();
      for (const projectId of shortlistedIds || []) {
        await prisma.shortlistDecision.upsert({
          where: { projectId },
          create: {
            projectId,
            phase: 1,
            isShortlisted: true,
            decidedBy: session.user.id,
            decidedAt: now,
            publishedAt: now,
          },
          update: {
            isShortlisted: true,
            decidedBy: session.user.id,
            decidedAt: now,
            publishedAt: now,
          },
        });
      }
      await writeAuditLog({
        actorId: session.user.id,
        action: 'PUBLISH_SHORTLIST',
        targetType: 'ShortlistDecision',
        metadata: { count: (shortlistedIds || []).length },
        ipAddress: getClientIp(req),
      });
    } else if (action === 'FINAL') {
      // Publish the leaderboard publicly (reveal winners derived from rank)
      await prisma.leaderboardEntry.updateMany({
        where: { phase: 1 },
        data: { scoresPublishedAt: new Date() },
      });
      await writeAuditLog({
        actorId: session.user.id,
        action: 'PUBLISH_FINAL_RESULTS',
        targetType: 'Leaderboard',
        ipAddress: getClientIp(req),
      });
    } else if (action === 'REOPEN_EVALUATION') {
      if (!evaluationId) {
        return NextResponse.json({ error: 'Evaluation ID is required' }, { status: 400 });
      }
      const existing = await prisma.juryEvaluation.findUnique({
        where: { id: evaluationId },
      });
      if (!existing) {
        return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 });
      }
      if (existing.status !== 'SUBMITTED') {
        return NextResponse.json({ error: 'Only submitted (locked) evaluations can be reopened' }, { status: 400 });
      }
      await prisma.juryEvaluation.update({
        where: { id: evaluationId },
        data: {
          status: 'DRAFT',
          reopenedAt: new Date(),
          reopenReason: reason || 'No reason provided',
        },
      });
      await writeAuditLog({
        actorId: session.user.id,
        action: 'EVAL_REOPEN',
        targetType: 'JuryEvaluation',
        targetId: evaluationId,
        metadata: { projectId: existing.projectId, reason: reason || 'No reason provided' },
        ipAddress: getClientIp(req),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
