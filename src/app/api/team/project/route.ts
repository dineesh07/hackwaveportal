import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import type { SubmissionStatus } from '@/generated/prisma/client';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEAM') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const team = await prisma.team.findFirst({
      where: {
        OR: [
          { userId: session.user.id },
          { members: { some: { rollNo: session.user.rollNo } } }
        ]
      },
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

    const team = await prisma.team.findFirst({
      where: {
        OR: [
          { userId: session.user.id },
          { members: { some: { rollNo: session.user.rollNo } } }
        ]
      }
    });
    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

    const body = await req.json();
    const {
      projectTitle, oneLiner, track, projectStatus,
      problemStatement, proposedSolution, targetUsers,
      techFrontend, techBackend, techDatabase, techAiMl, techCloud, techApis, techOther,
      architectureFileUrl, mockupFileUrl, prototypeLinkUrl, githubRepoUrl, liveDemoUrl,
      potentialChallenges, demoVideoUrl, questionsForMentors, status,
      coreFeatures = [], futureEnhancements = [], references = []
    } = body;

    const submissionStatus: SubmissionStatus = status === 'SUBMITTED' ? 'SUBMITTED' : 'DRAFT';

    // To handle relations gracefully, we delete all previous features and references for Phase 1 
    // and recreate them, as this is simpler for Draft saves than tracking individual updates.
    const existingProject = await prisma.project.findUnique({
      where: { teamId_phase: { teamId: team.id, phase: 1 } }
    });

    if (existingProject) {
      // Clean up relations first
      await prisma.feature.deleteMany({
        where: { OR: [{ coreForProjectId: existingProject.id }, { futureForProjectId: existingProject.id }] }
      });
      await prisma.reference.deleteMany({
        where: { projectId: existingProject.id }
      });
    }

    const projectData = {
      projectTitle: projectTitle || '',
      oneLiner: oneLiner || '',
      track: track || 'OTHERS',
      projectStatus: projectStatus || 'IDEATION_COMPLETE',
      problemStatement: problemStatement || '',
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
      submittedAt: submissionStatus === 'SUBMITTED' ? new Date() : null,
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
