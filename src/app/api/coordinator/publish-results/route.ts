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

    const { leaderboard, action, shortlistedIds, evaluationId, reason } = await req.json();

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
