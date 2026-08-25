import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { PROBLEM_STATEMENTS } from '@/data/problem-statements';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== 'COORDINATOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized. Coordinator access required.' }, { status: 401 });
    }

    const { psId, maxLimit, defaultLimitAll } = await req.json();

    if (defaultLimitAll != null) {
      const limitNum = parseInt(defaultLimitAll, 10);
      if (isNaN(limitNum) || limitNum < 0) {
        return NextResponse.json({ error: 'Limit must be 0 (for No Limit) or a positive integer.' }, { status: 400 });
      }
      
      for (const ps of PROBLEM_STATEMENTS) {
        await prisma.problemStatementConfig.upsert({
          where: { psId: ps.id },
          create: { psId: ps.id, maxLimit: limitNum },
          update: { maxLimit: limitNum }
        });
      }
      const msg = limitNum === 0 ? 'All problem statements set to No Limit (Unlimited teams).' : `All problem statements set to maximum ${limitNum} teams.`;
      return NextResponse.json({ success: true, message: msg });
    }

    if (!psId) {
      return NextResponse.json({ error: 'Problem statement ID is required.' }, { status: 400 });
    }

    const limitNum = parseInt(maxLimit, 10);
    if (isNaN(limitNum) || limitNum < 0) {
      return NextResponse.json({ error: 'Limit must be 0 (for No Limit) or a positive integer.' }, { status: 400 });
    }

    const updated = await prisma.problemStatementConfig.upsert({
      where: { psId },
      create: { psId, maxLimit: limitNum },
      update: { maxLimit: limitNum }
    });

    const msg = limitNum === 0 ? `Limit for ${psId} removed (Unlimited teams).` : `Limit for ${psId} updated to ${limitNum} teams.`;
    return NextResponse.json({ success: true, config: updated, message: msg });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to update problem statement limit.', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
