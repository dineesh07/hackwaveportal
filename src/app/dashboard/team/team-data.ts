import { cache } from 'react'
import { prisma } from '@/lib/prisma'

export const getTeamData = cache(async (userId: string, rollNo?: string | null) => {
  // If rollNo wasn't passed or is empty, lookup user record
  let effectiveRollNo = rollNo;
  if (!effectiveRollNo && userId) {
    const u = await prisma.user.findUnique({ where: { id: userId }, select: { rollNo: true } });
    if (u?.rollNo) effectiveRollNo = u.rollNo;
  }

  const cleanRollNo = effectiveRollNo?.trim() || '';

  const team = await prisma.team.findFirst({
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
      members: true,
      mentorAssignments: {
        include: { mentor: true }
      },
      projects: {
        where: { phase: 1 },
        include: { 
          coreFeatures: true, 
          futureEnhancements: true, 
          references: true, 
          tasks: true, 
          mentorFeedback: true,
          awards: {
            include: { award: true }
          },
          leaderboardEntry: true
        }
      }
    }
  })

  if (!team) return null

  const project = team.projects[0] || null
  const status = project?.status || 'DRAFT'
  const pendingTasks = project?.tasks.filter((t: any) => t.status === 'PENDING') || []

  let isShortlisted = false;
  if (project?.id) {
    const shortlist = await prisma.shortlistDecision.findUnique({
      where: { projectId: project.id }
    });
    if (shortlist && shortlist.isShortlisted) {
      isShortlisted = true;
      (project as any).shortlistDecision = shortlist;
    }
  }

  return { team, project, status, pendingTasks, isShortlisted }
})
