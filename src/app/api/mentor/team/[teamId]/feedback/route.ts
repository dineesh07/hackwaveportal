import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req: Request, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const { teamId } = await params;
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'MENTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { overallFeedback, suggestions, projectId } = await req.json();

    const assignment = await prisma.mentorAssignment.findUnique({
      where: { mentorId_teamId_phase: { mentorId: session.user.id, teamId, phase: 1 } }
    });
    if (!assignment) return NextResponse.json({ error: 'Not assigned to this team' }, { status: 403 });

    // Ensure feedback is recorded. Teams will view this in their portal.
    const existing = await prisma.mentorFeedback.findFirst({
      where: { projectId, mentorId: session.user.id, phase: 1 }
    });

    if (existing) {
      await prisma.mentorFeedback.update({
        where: { id: existing.id },
        data: { overallFeedback, suggestions }
      });
    } else {
      await prisma.mentorFeedback.create({
        data: {
          projectId,
          mentorId: session.user.id,
          phase: 1,
          overallFeedback,
          suggestions
        }
      });
    }

    // Mark project status as REVIEWED if it was SUBMITTED or UNDER_REVIEW
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (project?.status !== 'REVIEWED') {
      await prisma.project.update({ where: { id: projectId }, data: { status: 'REVIEWED' } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
