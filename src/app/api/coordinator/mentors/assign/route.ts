import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { writeAuditLog, getClientIp } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'COORDINATOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mentorId, teamId } = await req.json();

    const existing = await prisma.mentorAssignment.findUnique({
      where: { mentorId_teamId_phase: { mentorId, teamId, phase: 1 } }
    });

    if (existing) {
      return NextResponse.json({ error: 'Mentor already assigned to this team.' }, { status: 400 });
    }

    await prisma.mentorAssignment.create({
      data: {
        mentorId,
        teamId,
        phase: 1
      }
    });

    await writeAuditLog({
      actorId: session.user.id,
      action: 'MENTOR_ASSIGN',
      targetType: 'MentorAssignment',
      metadata: { mentorId, teamId },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'COORDINATOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assignmentId } = await req.json();

    await prisma.mentorAssignment.delete({
      where: { id: assignmentId }
    });

    await writeAuditLog({
      actorId: session.user.id,
      action: 'MENTOR_UNASSIGN',
      targetType: 'MentorAssignment',
      targetId: assignmentId,
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
