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

    const { note, projectId } = await req.json();

    const assignment = await prisma.mentorAssignment.findUnique({
      where: { mentorId_teamId_phase: { mentorId: session.user.id, teamId, phase: 1 } }
    });
    if (!assignment) return NextResponse.json({ error: 'Not assigned to this team' }, { status: 403 });

    const existing = await prisma.mentorPrivateNote.findFirst({
      where: { projectId, mentorId: session.user.id, phase: 1 }
    });

    if (existing) {
      await prisma.mentorPrivateNote.update({
        where: { id: existing.id },
        data: { note }
      });
    } else {
      await prisma.mentorPrivateNote.create({
        data: {
          projectId,
          mentorId: session.user.id,
          phase: 1,
          note
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
