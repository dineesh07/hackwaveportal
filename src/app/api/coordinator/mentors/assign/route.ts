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

    const { mentorId, teamIds } = await req.json();

    if (!mentorId || !Array.isArray(teamIds) || teamIds.length === 0) {
      return NextResponse.json({ error: 'Mentor and at least one team required' }, { status: 400 });
    }

    const existing = await prisma.mentorAssignment.findMany({
      where: { mentorId, phase: 1, teamId: { in: teamIds } }
    });
    
    const existingTeamIds = existing.map(e => e.teamId);
    const newTeamIds = teamIds.filter(id => !existingTeamIds.includes(id));

    if (newTeamIds.length > 0) {
      await prisma.mentorAssignment.createMany({
        data: newTeamIds.map(teamId => ({
          mentorId,
          teamId,
          phase: 1
        }))
      });
    }

    await writeAuditLog({
      actorId: session.user.id,
      action: 'MENTOR_ASSIGN',
      targetType: 'MentorAssignment',
      metadata: { mentorId, teamIds, newAssignmentsCount: newTeamIds.length },
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
