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

    const clamp = (val: any, max: number) => {
      const num = parseFloat(String(val));
      if (isNaN(num) || num < 0) return 0;
      return Math.min(max, Number(num.toFixed(2)));
    };

    const c_r1ProblemUnderstanding = clamp(r1ProblemUnderstanding, 10);
    const c_r1ProposedSolution = clamp(r1ProposedSolution, 10);
    const c_r1TechUnderstanding = clamp(r1TechUnderstanding, 8);
    const c_r1PrototypeDev = clamp(r1PrototypeDev, 12);
    const c_r1UiUx = clamp(r1UiUx, 5);
    const c_r1TeamUnderstanding = clamp(r1TeamUnderstanding, 5);

    const c_r2FeedbackImplementation = clamp(r2FeedbackImplementation, 10);
    const c_r2Improvements = clamp(r2Improvements, 10);
    const c_r2PrototypeFunctionality = clamp(r2PrototypeFunctionality, 12);
    const c_r2TechImplementation = clamp(r2TechImplementation, 8);
    const c_r2TestingValidation = clamp(r2TestingValidation, 5);
    const c_r2TeamPresentation = clamp(r2TeamPresentation, 5);

    const computedTotal = Number((
      c_r1ProblemUnderstanding +
      c_r1ProposedSolution +
      c_r1TechUnderstanding +
      c_r1PrototypeDev +
      c_r1UiUx +
      c_r1TeamUnderstanding +
      c_r2FeedbackImplementation +
      c_r2Improvements +
      c_r2PrototypeFunctionality +
      c_r2TechImplementation +
      c_r2TestingValidation +
      c_r2TeamPresentation
    ).toFixed(2));


    const data = {
      r1ProblemUnderstanding: c_r1ProblemUnderstanding,
      r1ProposedSolution: c_r1ProposedSolution,
      r1TechUnderstanding: c_r1TechUnderstanding,
      r1PrototypeDev: c_r1PrototypeDev,
      r1UiUx: c_r1UiUx,
      r1TeamUnderstanding: c_r1TeamUnderstanding,
      r1Remark: r1Remark || "",
      r2FeedbackImplementation: c_r2FeedbackImplementation,
      r2Improvements: c_r2Improvements,
      r2PrototypeFunctionality: c_r2PrototypeFunctionality,
      r2TechImplementation: c_r2TechImplementation,
      r2TestingValidation: c_r2TestingValidation,
      r2TeamPresentation: c_r2TeamPresentation,
      r2Remark: r2Remark || "",
      totalScore: computedTotal,
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
