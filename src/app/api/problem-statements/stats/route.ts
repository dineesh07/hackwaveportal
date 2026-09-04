import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { PROBLEM_STATEMENTS } from '@/data/problem-statements';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    const role = session?.user?.role;
    const userId = session?.user?.id;
    const rollNo = session?.user?.rollNo;

    // 1. Fetch custom limits configured by Coordinator
    const limits: Record<string, number> = {};
    PROBLEM_STATEMENTS.forEach(ps => {
      limits[ps.id] = 5;
    });

    try {
      if ((prisma as any).problemStatementConfig?.findMany) {
        const configs = await (prisma as any).problemStatementConfig.findMany();
        configs.forEach((c: any) => {
          limits[c.psId] = c.maxLimit;
        });
      }
    } catch (err) {
      console.error('Error loading problemStatementConfig in stats route:', err);
    }

    // 2. Fetch all phase 1 projects with team details
    const projects = await prisma.project.findMany({
      where: {
        phase: 1,
        problemStatementId: { not: null, notIn: [''] },
        team: {
          status: 'ACTIVE',
          registrationStatus: { not: 'REJECTED' }
        }
      },
      include: {
        team: {
          select: {
            id: true,
            teamName: true,
            teamCode: true,
            userId: true,
            members: {
              select: { rollNo: true }
            }
          }
        }
      }
    });

    const counts: Record<string, number> = {};
    const teamsByPs: Record<string, Array<{ teamId: string; teamName: string; teamCode: string | null }>> = {};

    PROBLEM_STATEMENTS.forEach(ps => {
      counts[ps.id] = 0;
      teamsByPs[ps.id] = [];
    });

    let myLockedPsId: string | null = null;
    let myTeamId: string | null = null;
    let isSubmissionCompleted = false;
    let isLeader = false;
    let leaderName = '';
    let isFirstYear = false;


    // Check logged-in team details and leader status
    if (userId && role === 'TEAM') {
      let cleanRollNo = (rollNo || '').trim();
      if (!cleanRollNo) {
        const u = await prisma.user.findUnique({ where: { id: userId }, select: { rollNo: true } });
        if (u?.rollNo) cleanRollNo = u.rollNo.trim();
      }

      const myTeam = await prisma.team.findFirst({
        where: {
          registrationStatus: { not: 'REJECTED' },
          OR: [
            { userId: userId },
            ...(cleanRollNo ? [
              { leaderRollNo: { equals: cleanRollNo, mode: 'insensitive' as const } },
              { members: { some: { rollNo: { equals: cleanRollNo, mode: 'insensitive' as const } } } }
            ] : [])
          ]
        },
        orderBy: { createdAt: 'desc' },
        include: {
          projects: { where: { phase: 1 } }
        }
      });
      if (myTeam) {
        myTeamId = myTeam.id;
        leaderName = myTeam.leaderName;
        const userRollLower = cleanRollNo.toLowerCase();
        const leaderRollLower = (myTeam.leaderRollNo || '').trim().toLowerCase();
        isLeader = myTeam.userId === userId || Boolean(userRollLower && leaderRollLower && userRollLower === leaderRollLower);
        isFirstYear = Boolean(leaderRollLower.startsWith('26isr'));
        const prj = myTeam.projects[0];
        if (prj?.problemStatementId) {
          myLockedPsId = prj.problemStatementId;
          if (prj.status === 'SUBMITTED' || prj.status === 'REVIEWED') {
            isSubmissionCompleted = true;
          }
        }
      }
    }

    projects.forEach(p => {
      const psId = p.problemStatementId;
      if (psId) {
        counts[psId] = (counts[psId] || 0) + 1;
        if (!teamsByPs[psId]) teamsByPs[psId] = [];
        teamsByPs[psId].push({
          teamId: p.team.id,
          teamName: p.team.teamName,
          teamCode: p.team.teamCode,
        });
      }
    });

    return NextResponse.json({
      counts,
      limits,
      teamsByPs: (role === 'COORDINATOR' || role === 'ADMIN' || role === 'MENTOR' || role === 'JURY') ? teamsByPs : {},
      myLockedPsId,
      myTeamId,
      isSubmissionCompleted,
      isLeader,
      leaderName,
      isFirstYear,
      role
    });

  } catch (error) {
    console.error('Error fetching PS stats:', error);
    return NextResponse.json({ error: 'Failed to fetch problem statements stats' }, { status: 500 });
  }
}
