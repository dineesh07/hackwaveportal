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

    const { overallFeedback, suggestions, projectId, action } = await req.json();

    const assignment = await prisma.mentorAssignment.findUnique({
      where: { mentorId_teamId_phase: { mentorId: session.user.id, teamId, phase: 1 } }
    });
    if (!assignment) return NextResponse.json({ error: 'Not assigned to this team' }, { status: 403 });

    // Always create a new feedback record to maintain history
    await prisma.mentorFeedback.create({
      data: {
        projectId,
        mentorId: session.user.id,
        phase: 1,
        overallFeedback,
        suggestions
      }
    });

    // Mark project status based on action
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    
    if (project) {
      if (action === 'NEEDS_REVISION' && project.status !== 'NEEDS_REVISION') {
        await prisma.project.update({ where: { id: projectId }, data: { status: 'NEEDS_REVISION' } });
      } else if (action === 'REVIEWED' && project.status !== 'REVIEWED') {
        await prisma.project.update({ where: { id: projectId }, data: { status: 'REVIEWED' } });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
