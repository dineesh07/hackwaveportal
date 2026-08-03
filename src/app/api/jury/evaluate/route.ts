import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import type { EvaluationStatus } from '@/generated/prisma/client';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'JURY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      projectId, status, totalScore,
      scoreProblemUnderstanding, scoreInnovation, scoreTechnicalImpl,
      scorePrototypeFunc, scoreUiUx, scoreScalability, scorePresentation, scoreImpactPotential,
      strengths, areasForImprovement, overallComments
    } = await req.json();

    const assignment = await prisma.juryAssignment.findUnique({
      where: { juryId_projectId_phase: { juryId: session.user.id, projectId, phase: 1 } }
    });
    
    if (!assignment) return NextResponse.json({ error: 'Not assigned to this project' }, { status: 403 });

    const evalStatus: EvaluationStatus = status === 'SUBMITTED' ? 'SUBMITTED' : 'DRAFT';

    const existing = await prisma.juryEvaluation.findUnique({
      where: { projectId_juryId_phase: { projectId, juryId: session.user.id, phase: 1 } }
    });

    if (existing?.status === 'SUBMITTED') {
      return NextResponse.json({ error: 'Evaluation already submitted and locked' }, { status: 400 });
    }

    const data = {
      scoreProblemUnderstanding: Number(scoreProblemUnderstanding),
      scoreInnovation: Number(scoreInnovation),
      scoreTechnicalImpl: Number(scoreTechnicalImpl),
      scorePrototypeFunc: Number(scorePrototypeFunc),
      scoreUiUx: Number(scoreUiUx),
      scoreScalability: Number(scoreScalability),
      scorePresentation: Number(scorePresentation),
      scoreImpactPotential: Number(scoreImpactPotential),
      totalScore: Number(totalScore),
      strengths,
      areasForImprovement,
      overallComments,
      status: evalStatus,
      submittedAt: evalStatus === 'SUBMITTED' ? new Date() : null,
    };

    if (existing) {
      await prisma.juryEvaluation.update({
        where: { id: existing.id },
        data
      });
    } else {
      await prisma.juryEvaluation.create({
        data: {
          ...data,
          projectId,
          juryId: session.user.id,
          phase: 1,
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
