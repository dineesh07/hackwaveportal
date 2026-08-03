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

    const { title, description, priority, dueDate, projectId } = await req.json();

    const assignment = await prisma.mentorAssignment.findUnique({
      where: { mentorId_teamId_phase: { mentorId: session.user.id, teamId, phase: 1 } }
    });
    if (!assignment) return NextResponse.json({ error: 'Not assigned to this team' }, { status: 403 });

    await prisma.task.create({
      data: {
        projectId,
        mentorId: session.user.id,
        phase: 1,
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: new Date(dueDate)
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
