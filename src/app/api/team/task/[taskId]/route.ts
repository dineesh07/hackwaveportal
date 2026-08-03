import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const { taskId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { select: { team: { select: { userId: true } } } } },
    });
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const isTeamMember = task.project.team.userId === session.user.id;

    if (session.user.role === 'TEAM' && !isTeamMember) {
      return NextResponse.json({ error: 'Not your team' }, { status: 403 });
    }

    if (session.user.role === 'TEAM' && task.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Task already completed' }, { status: 400 });
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, task: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
