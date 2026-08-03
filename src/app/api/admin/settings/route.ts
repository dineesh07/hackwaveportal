import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { writeAuditLog, getClientIp } from '@/lib/audit';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.platformSettings.findUnique({ where: { id: 'singleton' } });
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    await prisma.platformSettings.upsert({
      where: { id: 'singleton' },
      update: {
        hackathonName: body.hackathonName ?? undefined,
        registrationOpen: typeof body.registrationOpen === 'boolean' ? body.registrationOpen : undefined,
        announcementBanner: body.announcementBanner ?? undefined,
        submissionDeadline: body.submissionDeadline ? new Date(body.submissionDeadline) : null,
        phase1ReviewWindowStart: body.phase1ReviewWindowStart ? new Date(body.phase1ReviewWindowStart) : null,
        phase1ReviewWindowEnd: body.phase1ReviewWindowEnd ? new Date(body.phase1ReviewWindowEnd) : null,
        evaluationWindowStart: body.evaluationWindowStart ? new Date(body.evaluationWindowStart) : null,
        evaluationWindowEnd: body.evaluationWindowEnd ? new Date(body.evaluationWindowEnd) : null,
      },
      create: {
        id: 'singleton',
        hackathonName: body.hackathonName || 'Hackwave Ignite 2026',
        registrationOpen: !!body.registrationOpen,
        announcementBanner: body.announcementBanner || null,
        submissionDeadline: body.submissionDeadline ? new Date(body.submissionDeadline) : null,
        phase1ReviewWindowStart: body.phase1ReviewWindowStart ? new Date(body.phase1ReviewWindowStart) : null,
        phase1ReviewWindowEnd: body.phase1ReviewWindowEnd ? new Date(body.phase1ReviewWindowEnd) : null,
        evaluationWindowStart: body.evaluationWindowStart ? new Date(body.evaluationWindowStart) : null,
        evaluationWindowEnd: body.evaluationWindowEnd ? new Date(body.evaluationWindowEnd) : null,
      },
    });

    await writeAuditLog({
      actorId: session.user.id,
      action: 'SETTINGS_UPDATE',
      targetType: 'PlatformSettings',
      targetId: 'singleton',
      metadata: {
        hackathonName: body.hackathonName ?? undefined,
        registrationOpen: typeof body.registrationOpen === 'boolean' ? body.registrationOpen : undefined,
        submissionDeadline: body.submissionDeadline ?? undefined,
      },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}