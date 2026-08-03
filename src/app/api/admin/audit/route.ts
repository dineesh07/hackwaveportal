import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import type { Prisma } from '@/generated/prisma/client';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || undefined;
    const search = searchParams.get('search') || undefined;
    const take = Math.min(Number(searchParams.get('limit') || 100), 200);
    const skip = Math.max(Number(searchParams.get('offset') || 0), 0);

    const where: Prisma.AuditLogWhereInput = {
      ...(action ? { action } : {}),
      ...(search ? { OR: [{ actorId: { contains: search, mode: 'insensitive' } }, { targetType: { contains: search, mode: 'insensitive' } }] } : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.auditLog.count({ where }),
    ]);

    const actorIds = [...new Set(logs.map(l => l.actorId))];
    const actors = await prisma.user.findMany({
      where: { id: { in: actorIds } },
      select: { id: true, name: true, rollNo: true, role: true },
    });
    const actorMap = new Map(actors.map(a => [a.id, a]));

    return NextResponse.json({ logs, total, actors: Object.fromEntries(actorMap) });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
