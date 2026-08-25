import { prisma } from '@/lib/prisma';

export async function deleteTeamCascade(teamId: string) {
  // Find all projects for team
  const projects = await prisma.project.findMany({ 
    where: { teamId }, 
    select: { id: true } 
  });
  const projectIds = projects.map(p => p.id);

  for (const pid of projectIds) {
    await prisma.feature.deleteMany({
      where: {
        OR: [
          { coreForProjectId: pid },
          { futureForProjectId: pid }
        ]
      }
    }).catch(() => {});
    await prisma.reference.deleteMany({ where: { projectId: pid } }).catch(() => {});
    await prisma.task.deleteMany({ where: { projectId: pid } }).catch(() => {});
    await prisma.mentorFeedback.deleteMany({ where: { projectId: pid } }).catch(() => {});
    await prisma.mentorPrivateNote.deleteMany({ where: { projectId: pid } }).catch(() => {});
    await prisma.juryEvaluation.deleteMany({ where: { projectId: pid } }).catch(() => {});
    await prisma.juryAssignment.deleteMany({ where: { projectId: pid } }).catch(() => {});
    await prisma.awardRecipient.deleteMany({ where: { projectId: pid } }).catch(() => {});
    await prisma.leaderboardEntry.deleteMany({ where: { projectId: pid } }).catch(() => {});
    await prisma.shortlistDecision.deleteMany({ where: { projectId: pid } }).catch(() => {});
  }

  await prisma.project.deleteMany({ where: { teamId } }).catch(() => {});
  await prisma.teamMember.deleteMany({ where: { teamId } }).catch(() => {});
  await prisma.mentorAssignment.deleteMany({ where: { teamId } }).catch(() => {});
  await prisma.team.delete({ where: { id: teamId } }).catch(() => {});
}
