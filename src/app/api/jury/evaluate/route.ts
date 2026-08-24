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
      r1ProblemUnderstanding, r1ProposedSolution, r1TechUnderstanding, r1PrototypeDev, r1UiUx, r1TeamUnderstanding, r1Remark,
      r2FeedbackImplementation, r2Improvements, r2PrototypeFunctionality, r2TechImplementation, r2TestingValidation, r2TeamPresentation, r2Remark
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
      r1ProblemUnderstanding: Number(r1ProblemUnderstanding),
      r1ProposedSolution: Number(r1ProposedSolution),
      r1TechUnderstanding: Number(r1TechUnderstanding),
      r1PrototypeDev: Number(r1PrototypeDev),
      r1UiUx: Number(r1UiUx),
      r1TeamUnderstanding: Number(r1TeamUnderstanding),
      r1Remark: r1Remark || "",
      r2FeedbackImplementation: Number(r2FeedbackImplementation),
      r2Improvements: Number(r2Improvements),
      r2PrototypeFunctionality: Number(r2PrototypeFunctionality),
      r2TechImplementation: Number(r2TechImplementation),
      r2TestingValidation: Number(r2TestingValidation),
      r2TeamPresentation: Number(r2TeamPresentation),
      r2Remark: r2Remark || "",
      totalScore: Number(totalScore),
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
