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
      r1OriginalityInnovation, r1Feasibility, r1ClarityConcept, r1TechCompetence, r1TeamCollaboration, r1PresentationQa, r1Remark,
      r2UiUx, r2Functionality, r2TechImplementation, r2Progress, r2FeedbackIncorporation, r2OverallImpressions, r2QuestionAnswer, r2Remark
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

    // Round 1 Clamps (40 Marks Total)
    const c_r1OriginalityInnovation = clamp(r1OriginalityInnovation, 10);
    const c_r1Feasibility = clamp(r1Feasibility, 5);
    const c_r1ClarityConcept = clamp(r1ClarityConcept, 10);
    const c_r1TechCompetence = clamp(r1TechCompetence, 5);
    const c_r1TeamCollaboration = clamp(r1TeamCollaboration, 5);
    const c_r1PresentationQa = clamp(r1PresentationQa, 5);

    // Round 2 Clamps (60 Marks Total)
    const c_r2UiUx = clamp(r2UiUx, 15);
    const c_r2Functionality = clamp(r2Functionality, 5);
    const c_r2TechImplementation = clamp(r2TechImplementation, 20);
    const c_r2Progress = clamp(r2Progress, 10);
    const c_r2FeedbackIncorporation = clamp(r2FeedbackIncorporation, 5);
    const c_r2OverallImpressions = clamp(r2OverallImpressions, 5);
    const c_r2QuestionAnswer = clamp(r2QuestionAnswer, 5);

    const computedTotal = Number((
      c_r1OriginalityInnovation +
      c_r1Feasibility +
      c_r1ClarityConcept +
      c_r1TechCompetence +
      c_r1TeamCollaboration +
      c_r1PresentationQa +
      c_r2UiUx +
      c_r2Functionality +
      c_r2TechImplementation +
      c_r2Progress +
      c_r2FeedbackIncorporation +
      c_r2OverallImpressions +
      c_r2QuestionAnswer
    ).toFixed(2));


    const data = {
      r1OriginalityInnovation: c_r1OriginalityInnovation,
      r1Feasibility: c_r1Feasibility,
      r1ClarityConcept: c_r1ClarityConcept,
      r1TechCompetence: c_r1TechCompetence,
      r1TeamCollaboration: c_r1TeamCollaboration,
      r1PresentationQa: c_r1PresentationQa,
      r1Remark: r1Remark || "",
      r2UiUx: c_r2UiUx,
      r2Functionality: c_r2Functionality,
      r2TechImplementation: c_r2TechImplementation,
      r2Progress: c_r2Progress,
      r2FeedbackIncorporation: c_r2FeedbackIncorporation,
      r2OverallImpressions: c_r2OverallImpressions,
      r2QuestionAnswer: c_r2QuestionAnswer,
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
