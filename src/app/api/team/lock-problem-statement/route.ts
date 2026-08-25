import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { PROBLEM_STATEMENTS } from '@/data/problem-statements';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'TEAM') {
      return NextResponse.json({ error: 'Unauthorized. Team account required.' }, { status: 401 });
    }

    const { problemStatementId, problemStatementTitle, action = 'LOCK' } = await req.json();

    // Get user's rollNo from DB to guarantee match
    const userRecord = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { rollNo: true }
    });
    const effectiveRollNo = userRecord?.rollNo || session.user.rollNo || '';
    const cleanRollNo = effectiveRollNo.trim();

    // Find the team
    const team = await prisma.team.findFirst({
      where: {
        OR: [
          { userId: session.user.id },
          ...(cleanRollNo ? [
            { leaderRollNo: { equals: cleanRollNo, mode: 'insensitive' as const } },
            { members: { some: { rollNo: { equals: cleanRollNo, mode: 'insensitive' as const } } } }
          ] : [])
        ]
      },
      include: {
        projects: {
          where: { phase: 1 }
        }
      }
    });

    if (!team) {
      return NextResponse.json({ error: 'No team found for current user.' }, { status: 404 });
    }

    // Only the Team Leader can lock or unlock problem statements
    const userRollLower = cleanRollNo.toLowerCase();
    const leaderRollLower = (team.leaderRollNo || '').trim().toLowerCase();
    const isLeader = team.userId === session.user.id || Boolean(userRollLower && leaderRollLower && userRollLower === leaderRollLower);

    if (!isLeader) {
      return NextResponse.json({ 
        error: `Only the Team Leader (${team.leaderName}) can lock or switch problem statements for your team.` 
      }, { status: 403 });
    }

    // Link team.userId to leader user ID if not already linked
    if (team.userId !== session.user.id) {
      await prisma.team.update({
        where: { id: team.id },
        data: { userId: session.user.id }
      }).catch(() => {});
    }

    const project = team.projects[0] || null;

    if (project && (project.status === 'SUBMITTED' || project.status === 'REVIEWED')) {
      return NextResponse.json({ error: 'Your project has already been submitted and cannot be modified.' }, { status: 400 });
    }

    // Check if team already has a locked problem statement
    if (project?.problemStatementId) {
      return NextResponse.json({ 
        error: `Problem Statement ${project.problemStatementId} is already locked for your team. Once locked, the selection is permanent and cannot be changed or unlocked.` 
      }, { status: 400 });
    }

    if (action === 'UNLOCK') {
      return NextResponse.json({ 
        error: 'Problem statements cannot be unlocked once locked.' 
      }, { status: 400 });
    }


    // LOCK ACTION
    if (!problemStatementId) {
      return NextResponse.json({ error: 'Problem statement ID is required.' }, { status: 400 });
    }

    const validPS = PROBLEM_STATEMENTS.find(ps => ps.id === problemStatementId);
    if (!validPS) {
      return NextResponse.json({ error: 'Invalid problem statement ID.' }, { status: 400 });
    }

    function getTrackFromDomain(domain?: string) {
      if (!domain) return 'OTHERS' as const;
      const upper = domain.toUpperCase();
      if (upper.includes('AGENTIC') || upper.includes('GENERATIVE') || upper.includes('ARTIFICIAL')) {
        return 'ARTIFICIAL_INTELLIGENCE' as const;
      }
      if (upper.includes('VISION') || upper.includes('DEEP LEARNING')) {
        return 'COMPUTER_VISION' as const;
      }
      if (upper.includes('WEB')) {
        return 'WEB_DEVELOPMENT' as const;
      }
      if (upper.includes('CYBER')) {
        return 'CYBERSECURITY' as const;
      }
      return 'OTHERS' as const;
    }

    // Check capacity limit (0 or >= 999 means Unlimited / No Limit)
    const config = await prisma.problemStatementConfig.findUnique({
      where: { psId: problemStatementId }
    });
    const maxLimit = config?.maxLimit ?? 5;
    const isUnlimited = maxLimit === 0 || maxLimit >= 999;

    if (!isUnlimited) {
      // Count how many OTHER teams have locked this PS
      const currentCount = await prisma.project.count({
        where: {
          phase: 1,
          problemStatementId: problemStatementId,
          teamId: { not: team.id }
        }
      });

      if (currentCount >= maxLimit) {
        return NextResponse.json({ 
          error: `Problem statement ${problemStatementId} has reached its maximum limit (${maxLimit} teams). Please choose another problem statement.` 
        }, { status: 400 });
      }
    }

    const titleToSave = problemStatementTitle || validPS.title;
    const autoTrack = getTrackFromDomain(validPS.domain);

    if (project) {
      await prisma.project.update({
        where: { id: project.id },
        data: {
          problemStatementId: problemStatementId,
          problemStatement: titleToSave,
          track: autoTrack
        }
      });
    } else {
      await prisma.project.create({
        data: {
          teamId: team.id,
          phase: 1,
          problemStatementId: problemStatementId,
          problemStatement: titleToSave,
          projectTitle: '',
          oneLiner: '',
          projectStatus: 'IDEATION_COMPLETE',
          proposedSolution: '',
          potentialChallenges: '',
          track: autoTrack
        }
      });
    }


    return NextResponse.json({ 
      success: true, 
      problemStatementId, 
      message: `Successfully locked problem statement ${problemStatementId} for ${team.teamName}!` 
    });
  } catch (error) {
    console.error('Error locking problem statement:', error);
    return NextResponse.json({ error: 'Failed to lock problem statement.' }, { status: 500 });
  }
}
