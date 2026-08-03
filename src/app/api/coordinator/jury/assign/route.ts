import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { writeAuditLog, getClientIp } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'COORDINATOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { juryId, projectId } = await req.json();
    if (!juryId || !projectId) {
      return NextResponse.json({ error: 'Jury and project are required' }, { status: 400 });
    }

    const existing = await prisma.juryAssignment.findUnique({
      where: { juryId_projectId_phase: { juryId, projectId, phase: 1 } }
    });

    if (existing) {
      return NextResponse.json({ error: 'Jury member already assigned to this project.' }, { status: 400 });
    }

    await prisma.juryAssignment.create({
      data: { juryId, projectId, phase: 1 }
    });

    await writeAuditLog({
      actorId: session.user.id,
      action: 'JURY_ASSIGN',
      targetType: 'JuryAssignment',
      metadata: { juryId, projectId },
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
    if (!session?.user?.id || session.user.role !== 'COORDINATOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assignmentId } = await req.json();
    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
    }

    await prisma.juryAssignment.delete({ where: { id: assignmentId } });

    await writeAuditLog({
      actorId: session.user.id,
      action: 'JURY_UNASSIGN',
      targetType: 'JuryAssignment',
      targetId: assignmentId,
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
