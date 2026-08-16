import { cache } from 'react'
import { prisma } from '@/lib/prisma'

export const getTeamData = cache(async (userId: string, rollNo?: string | null) => {
  const team = await prisma.team.findFirst({
    where: { 
      OR: [
        { userId: userId },
        ...(rollNo ? [{ members: { some: { rollNo: rollNo } } }] : [])
      ]
    },
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
          }
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
