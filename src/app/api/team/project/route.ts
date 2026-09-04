import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import type { SubmissionStatus } from '@/generated/prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEAM') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRecord = session.user.id ? await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { rollNo: true }
    }) : null;
    const effectiveRollNo = userRecord?.rollNo || session.user.rollNo || '';
    const cleanRollNo = effectiveRollNo.trim();

    const team = await prisma.team.findFirst({
      where: {
        registrationStatus: { not: 'REJECTED' },
        OR: [
          { userId: session.user.id },
          ...(cleanRollNo ? [
            { leaderRollNo: { equals: cleanRollNo, mode: 'insensitive' as const } },
            { members: { some: { rollNo: { equals: cleanRollNo, mode: 'insensitive' as const } } } }
          ] : [])
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        projects: {
          where: { phase: 1 },
          include: {
            coreFeatures: true,
            futureEnhancements: true,
            references: true
          }
        }
      }
    });

    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

    const project = team.projects[0] || null;
    return NextResponse.json({ project });
  } catch (error) {
    console.error('Fetch Project Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEAM') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRecord = session.user.id ? await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { rollNo: true }
    }) : null;
    const effectiveRollNo = userRecord?.rollNo || session.user.rollNo || '';
    const cleanRollNo = effectiveRollNo.trim();

    const team = await prisma.team.findFirst({
      where: {
        registrationStatus: { not: 'REJECTED' },
        OR: [
          { userId: session.user.id },
          ...(cleanRollNo ? [
            { leaderRollNo: { equals: cleanRollNo, mode: 'insensitive' as const } },
            { members: { some: { rollNo: { equals: cleanRollNo, mode: 'insensitive' as const } } } }
          ] : [])
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

    const body = await req.json();
    const {
      projectTitle, oneLiner, track, projectStatus,
      problemStatement, problemStatementId, proposedSolution, targetUsers,
      techFrontend, techBackend, techDatabase, techAiMl, techCloud, techApis, techOther,
      architectureFileUrl, mockupFileUrl, prototypeLinkUrl, githubRepoUrl, liveDemoUrl,
      potentialChallenges, demoVideoUrl, questionsForMentors, status,
      coreFeatures = [], futureEnhancements = [], references = []
    } = body;

    const existingProject = await prisma.project.findUnique({
      where: { teamId_phase: { teamId: team.id, phase: 1 } }
    });

    // Guard: If project is already submitted or under review, do not allow draft overwrites
    if (existingProject && ['SUBMITTED', 'UNDER_REVIEW', 'REVIEWED'].includes(existingProject.status)) {
      if (status !== 'SUBMITTED') {
        return NextResponse.json({
          error: 'Your project has already been submitted and cannot be modified.',
          project: existingProject
        }, { status: 400 });
      }
    }

    let submissionStatus: SubmissionStatus = 'DRAFT';
    if (status === 'SUBMITTED') {
      submissionStatus = 'SUBMITTED';
    } else if (existingProject?.status === 'NEEDS_REVISION') {
      submissionStatus = 'NEEDS_REVISION';
    } else {
      submissionStatus = 'DRAFT';
    }

    if (existingProject) {
      // Clean up relations first
      await prisma.feature.deleteMany({
        where: { OR: [{ coreForProjectId: existingProject.id }, { futureForProjectId: existingProject.id }] }
      });
      await prisma.reference.deleteMany({
        where: { projectId: existingProject.id }
      });
    }

    const effectivePsId = existingProject?.problemStatementId || problemStatementId || '';
    let autoTrack = track || 'OTHERS';
    if (effectivePsId) {
      const { PROBLEM_STATEMENTS } = await import('@/data/problem-statements');
      const matched = PROBLEM_STATEMENTS.find(ps => ps.id === effectivePsId);
      if (matched) {
        const domain = matched.domain.toUpperCase();
        if (domain.includes('AGENTIC') || domain.includes('GENERATIVE') || domain.includes('ARTIFICIAL')) {
          autoTrack = 'ARTIFICIAL_INTELLIGENCE';
        } else if (domain.includes('VISION') || domain.includes('DEEP LEARNING')) {
          autoTrack = 'COMPUTER_VISION';
        } else if (domain.includes('WEB')) {
          autoTrack = 'WEB_DEVELOPMENT';
        } else if (domain.includes('CYBER')) {
          autoTrack = 'CYBERSECURITY';
        }
      }
    }

    const submittedAtValue = submissionStatus === 'SUBMITTED'
      ? (existingProject?.submittedAt || new Date())
      : (submissionStatus === 'NEEDS_REVISION' ? existingProject?.submittedAt : null);

    const projectData = {
      projectTitle: projectTitle || '',
      oneLiner: oneLiner || '',
      track: autoTrack,
      projectStatus: projectStatus || 'IDEATION_COMPLETE',
      problemStatement: existingProject?.problemStatement || problemStatement || '',
      problemStatementId: effectivePsId,

      proposedSolution: proposedSolution || '',
      targetUsers: targetUsers || [],
      techFrontend: techFrontend || [],
      techBackend: techBackend || [],
      techDatabase: techDatabase || [],
      techAiMl: techAiMl || [],
      techCloud: techCloud || [],
      techApis: techApis || [],
      techOther: techOther || [],
      architectureFileUrl: architectureFileUrl || '',
      mockupFileUrl,
      prototypeLinkUrl,
      githubRepoUrl,
      liveDemoUrl,
      potentialChallenges: potentialChallenges || '',
      demoVideoUrl,
      questionsForMentors,
      status: submissionStatus,
      submittedAt: submittedAtValue,
      coreFeatures: {
        create: coreFeatures.map((f: { title: string; description: string }) => ({ title: f.title, description: f.description }))
      },
      futureEnhancements: {
        create: futureEnhancements.map((f: { title: string; description: string }) => ({ title: f.title, description: f.description }))
      },
      references: {
        create: references.map((r: { title: string; url: string }) => ({ title: r.title, url: r.url }))
      }
    };

    const project = await prisma.project.upsert({
      where: { teamId_phase: { teamId: team.id, phase: 1 } },
      update: projectData,
      create: {
        teamId: team.id,
        phase: 1,
        ...projectData
      }
    });

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error('Save Project Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
