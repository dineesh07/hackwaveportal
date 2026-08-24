import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { hash } from 'bcryptjs';
import { writeAuditLog, getClientIp } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    if (body.action === 'CREATE') {
      const password = body.password || '12345';
      const hashedPassword = await hash(password, 10);
      const rollNo = (body.rollNo || '').toString().trim();
      if (!rollNo) {
        return NextResponse.json({ error: 'Roll number is required' }, { status: 400 });
      }
      await prisma.user.create({
        data: {
          name: body.name,
          email: body.email || null,
          phone: body.phone || null,
          rollNo,
          passwordHash: hashedPassword,
          mustChangePassword: password === '12345',
          role: body.role || 'MENTOR',
          organization: body.organization || null,
        },
      });
      await writeAuditLog({
        actorId: session.user.id,
        action: 'USER_CREATE',
        targetType: 'User',
        metadata: { rollNo, name: body.name, role: body.role || 'MENTOR' },
        ipAddress: getClientIp(req),
      });
    } else if (body.action === 'UPDATE_ROLE') {
      await prisma.user.update({
        where: { id: body.userId },
        data: { role: body.role },
      });
      await writeAuditLog({
        actorId: session.user.id,
        action: 'USER_UPDATE_ROLE',
        targetType: 'User',
        targetId: body.userId,
        metadata: { role: body.role },
        ipAddress: getClientIp(req),
      });
    } else if (body.action === 'UPDATE_STATUS') {
      const status = body.status;
      if (!['ACTIVE', 'INACTIVE', 'LOCKED'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      await prisma.user.update({
        where: { id: body.userId },
        data: { status },
      });
      await writeAuditLog({
        actorId: session.user.id,
        action: 'USER_UPDATE_STATUS',
        targetType: 'User',
        targetId: body.userId,
        metadata: { status },
        ipAddress: getClientIp(req),
      });
    } else if (body.action === 'RESET_PASSWORD') {
      const password = body.password || '12345';
      const hashedPassword = await hash(password, 10);
      await prisma.user.update({
        where: { id: body.userId },
        data: { passwordHash: hashedPassword, mustChangePassword: true },
      });
      await writeAuditLog({
        actorId: session.user.id,
        action: 'USER_RESET_PASSWORD',
        targetType: 'User',
        targetId: body.userId,
        ipAddress: getClientIp(req),
      });
    } else if (body.action === 'DELETE') {
      await prisma.user.delete({
        where: { id: body.userId },
      });
      await writeAuditLog({
        actorId: session.user.id,
        action: 'USER_DELETE',
        targetType: 'User',
        targetId: body.userId,
        ipAddress: getClientIp(req),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
