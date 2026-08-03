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

    const body = await req.json();

    if (body.action === 'CREATE_AWARD') {
      if (!body.title) {
        return NextResponse.json({ error: 'Award title is required' }, { status: 400 });
      }
      await prisma.award.create({
        data: {
          title: body.title,
          description: body.description || '',
          icon: body.icon || 'trophy',
          createdBy: session.user.id,
        },
      });
      await writeAuditLog({
        actorId: session.user.id,
        action: 'AWARD_CREATE',
        targetType: 'Award',
        metadata: { title: body.title },
        ipAddress: getClientIp(req),
      });
    } else if (body.action === 'ASSIGN_AWARD') {
      if (!body.projectId || !body.awardId) {
        return NextResponse.json({ error: 'Project and award are required' }, { status: 400 });
      }
      const existing = await prisma.awardRecipient.findFirst({
        where: { projectId: body.projectId, awardId: body.awardId },
      });
      if (!existing) {
        await prisma.awardRecipient.create({
          data: {
            projectId: body.projectId,
            awardId: body.awardId,
          },
        });
        await writeAuditLog({
          actorId: session.user.id,
          action: 'AWARD_ASSIGN',
          targetType: 'AwardRecipient',
          metadata: { awardId: body.awardId, projectId: body.projectId },
          ipAddress: getClientIp(req),
        });
      }
    } else if (body.action === 'UNASSIGN_AWARD') {
      if (body.recipientId) {
        await prisma.awardRecipient.delete({ where: { id: body.recipientId } });
      } else if (body.projectId && body.awardId) {
        await prisma.awardRecipient.deleteMany({ where: { projectId: body.projectId, awardId: body.awardId } });
      }
      await writeAuditLog({
        actorId: session.user.id,
        action: 'AWARD_UNASSIGN',
        targetType: 'AwardRecipient',
        metadata: { recipientId: body.recipientId, awardId: body.awardId, projectId: body.projectId },
        ipAddress: getClientIp(req),
      });
    } else if (body.action === 'PUBLISH_AWARDS') {
      await prisma.award.updateMany({
        where: { publishedAt: null },
        data: { publishedAt: new Date() },
      });
      await writeAuditLog({
        actorId: session.user.id,
        action: 'PUBLISH_AWARDS',
        targetType: 'Award',
        ipAddress: getClientIp(req),
      });
    } else if (body.action === 'DELETE_AWARD') {
      await prisma.awardRecipient.deleteMany({ where: { awardId: body.awardId } });
      await prisma.award.delete({ where: { id: body.awardId } });
      await writeAuditLog({
        actorId: session.user.id,
        action: 'AWARD_DELETE',
        targetType: 'Award',
        targetId: body.awardId,
        ipAddress: getClientIp(req),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
