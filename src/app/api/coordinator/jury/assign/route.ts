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

    const { juryId, projectIds } = await req.json();
    if (!juryId || !Array.isArray(projectIds) || projectIds.length === 0) {
      return NextResponse.json({ error: 'Jury and at least one project are required' }, { status: 400 });
    }

    const existing = await prisma.juryAssignment.findMany({
      where: { juryId, phase: 1, projectId: { in: projectIds } }
    });

    const existingProjectIds = existing.map(e => e.projectId);
    const newProjectIds = projectIds.filter(id => !existingProjectIds.includes(id));

    if (newProjectIds.length > 0) {
      await prisma.juryAssignment.createMany({
        data: newProjectIds.map(projectId => ({
          juryId,
          projectId,
          phase: 1
        }))
      });
    }

    await writeAuditLog({
      actorId: session.user.id,
      action: 'JURY_ASSIGN',
      targetType: 'JuryAssignment',
      metadata: { juryId, projectIds, newAssignmentsCount: newProjectIds.length },
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
