'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { auth } from '@/auth'

export async function approveTeam(teamId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Unauthorized' }

    const team = await prisma.team.findUnique({ where: { id: teamId } })
    if (!team) return { error: 'Team not found' }

    if (team.registrationStatus !== 'PENDING_VERIFICATION') {
      return { error: 'Team is not pending verification' }
    }

    // Hash default password
    const passwordHash = await bcrypt.hash('12345', 10)

      // Transaction: Create/Link User for ALL members, Update Team
      await prisma.$transaction(async (tx) => {
        // 1. Always create/update the Team Leader account
        let leaderUserId: string | null = null;
        if (team.leaderRollNo) {
          const leaderConditions: any[] = [
            { rollNo: { equals: team.leaderRollNo.trim(), mode: 'insensitive' } }
          ];
          if (team.leaderEmail && team.leaderEmail.trim() !== '') {
            leaderConditions.push({ email: team.leaderEmail.trim() });
          }

          let leaderUser = await tx.user.findFirst({
            where: { OR: leaderConditions }
          });

          if (leaderUser) {
            leaderUser = await tx.user.update({
              where: { id: leaderUser.id },
              data: {
                name: team.leaderName,
                phone: team.leaderPhone,
                role: 'TEAM',
                status: 'ACTIVE'
              }
            });
          } else {
            const finalEmail = team.leaderEmail && team.leaderEmail.trim() !== '' ? team.leaderEmail.trim() : null;
            leaderUser = await tx.user.create({
              data: {
                name: team.leaderName,
                rollNo: team.leaderRollNo.trim(),
                email: finalEmail,
                phone: team.leaderPhone,
                passwordHash,
                mustChangePassword: true,
                role: 'TEAM',
                status: 'ACTIVE'
              }
            });
          }
          leaderUserId = leaderUser.id;
        }

        // 2. Process all non-leader members
        const members = await tx.teamMember.findMany({ where: { teamId: team.id } });
        const leaderRollClean = (team.leaderRollNo || '').trim().toLowerCase();

        for (const member of members) {
          if (!member.rollNo) continue;
          const memberRollClean = member.rollNo.trim().toLowerCase();
          if (leaderRollClean && memberRollClean === leaderRollClean) {
            // Delete duplicate TeamMember entry if leader was mistakenly in TeamMember table
            await tx.teamMember.delete({ where: { id: member.id } }).catch(() => {});
            continue;
          }

          const userConditions: any[] = [{ rollNo: { equals: member.rollNo.trim(), mode: 'insensitive' } }];
          if (member.email && member.email.trim() !== '') {
            userConditions.push({ email: member.email.trim() });
          }

          let user = await tx.user.findFirst({
            where: { OR: userConditions }
          });

          if (user) {
            user = await tx.user.update({
              where: { id: user.id },
              data: {
                name: member.name,
                phone: member.phone,
                role: 'TEAM',
                status: 'ACTIVE'
              }
            });
          } else {
            const finalEmail = member.email && member.email.trim() !== '' ? member.email.trim() : null;
            user = await tx.user.create({
              data: {
                name: member.name,
                rollNo: member.rollNo.trim(),
                email: finalEmail,
                phone: member.phone,
                passwordHash,
                mustChangePassword: true,
                role: 'TEAM',
                status: 'ACTIVE'
              }
            });
          }
        }

        await tx.team.update({
          where: { id: teamId },
          data: {
            registrationStatus: 'ACCOUNT_CREATED',
            userId: leaderUserId,
            verifiedAt: new Date()
          }
        })
  
        await tx.auditLog.create({
          data: {
            actorId: session.user.id,
            action: 'TEAM_APPROVE',
            targetType: 'Team',
            targetId: teamId,
            metadata: { rollNo: team.leaderRollNo },
          }
        })
      }, {
        maxWait: 5000, // default is 2000
        timeout: 15000 // default is 5000, we need more time for multiple bcrypt ops or slow queries
      })
  
      revalidatePath('/dashboard/coordinator')
      return { success: true }
    } catch (error: any) {
      console.error('Approve Team Error:', error)
      const message = error instanceof Error ? error.message : String(error)
      return { error: message }
    }
  }

export async function rejectTeam(teamId: string, reason: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Unauthorized' }

    const team = await prisma.team.findUnique({ 
      where: { id: teamId },
      include: { members: true }
    })
    if (!team) return { error: 'Team not found' }

    await prisma.$transaction(async (tx) => {
      // 1. Mark team rejected & inactive, and dissociate userId
      await tx.team.update({
        where: { id: teamId },
        data: {
          registrationStatus: 'REJECTED',
          status: 'INACTIVE',
          userId: null,
        }
      })

      // 2. Remove users created for this team if they do not belong to another active team
      const rollNos = [
        team.leaderRollNo,
        ...team.members.map(m => m.rollNo).filter(Boolean) as string[]
      ].map(r => (r || '').trim()).filter(Boolean);

      for (const roll of rollNos) {
        const otherActiveTeam = await tx.team.findFirst({
          where: {
            id: { not: teamId },
            registrationStatus: { not: 'REJECTED' },
            OR: [
              { leaderRollNo: { equals: roll, mode: 'insensitive' } },
              { members: { some: { rollNo: { equals: roll, mode: 'insensitive' } } } }
            ]
          }
        });

        if (!otherActiveTeam) {
          const userToDelete = await tx.user.findFirst({
            where: {
              rollNo: { equals: roll, mode: 'insensitive' },
              role: 'TEAM'
            }
          });
          if (userToDelete) {
            await tx.user.delete({ where: { id: userToDelete.id } }).catch(() => {});
          }
        }
      }

      // 3. If there was a direct userId linked that wasn't covered above
      if (team.userId) {
        const otherActiveLeader = await tx.team.findFirst({
          where: {
            id: { not: teamId },
            registrationStatus: { not: 'REJECTED' },
            userId: team.userId
          }
        });
        if (!otherActiveLeader) {
          await tx.user.delete({ where: { id: team.userId, role: 'TEAM' } }).catch(() => {});
        }
      }

      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'TEAM_REJECT',
          targetType: 'Team',
          targetId: teamId,
          metadata: { reason: reason || 'No reason provided' },
        }
      })
    })

    revalidatePath('/dashboard/coordinator')
    revalidatePath('/dashboard/coordinator/registrations')
    revalidatePath('/dashboard/coordinator/teams')
    return { success: true }
  } catch (error) {
    console.error('Reject Team Error:', error)
    return { error: 'Internal server error' }
  }
}

export async function bulkApproveTeams(teamIds: string[]) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Unauthorized' }

    let successful = 0;
    let failed = 0;

    for (const id of teamIds) {
      const res = await approveTeam(id);
      if (res.success) {
        successful++;
      } else {
        failed++;
      }
    }

    return { success: true, successful, failed };
  } catch (error: any) {
    console.error('Bulk Approve Error:', error);
    return { error: error.message || 'Internal server error' };
  }
}

export async function updateProblemStatementLimit(psId: string, maxLimit: number) {
  try {
    const session = await auth()
    if (!session?.user?.id || (session.user.role !== 'COORDINATOR' && session.user.role !== 'ADMIN')) {
      return { error: 'Unauthorized. Coordinator access required.' }
    }

    if (!psId || typeof psId !== 'string') {
      return { error: 'Valid Problem Statement ID is required.' }
    }

    const limitNum = parseInt(String(maxLimit), 10)
    if (isNaN(limitNum) || limitNum < 0) {
      return { error: 'Limit must be 0 (for No Limit) or a positive integer.' }
    }

    const updated = await prisma.problemStatementConfig.upsert({
      where: { psId: psId.trim() },
      create: { psId: psId.trim(), maxLimit: limitNum },
      update: { maxLimit: limitNum }
    })

    revalidatePath('/dashboard/coordinator/problem-statements')
    revalidatePath('/dashboard/coordinator')
    revalidatePath('/dashboard/team/problem-statements')
    revalidatePath('/dashboard/team')

    return { success: true, psId: updated.psId, maxLimit: updated.maxLimit }
  } catch (error: any) {
    console.error('Update Problem Statement Limit Error:', error)
    return { error: error?.message || 'Failed to update problem statement limit' }
  }
}

export async function batchUpdateProblemStatementLimits(defaultLimit: number) {
  try {
    const session = await auth()
    if (!session?.user?.id || (session.user.role !== 'COORDINATOR' && session.user.role !== 'ADMIN')) {
      return { error: 'Unauthorized. Coordinator access required.' }
    }

    const limitNum = parseInt(String(defaultLimit), 10)
    if (isNaN(limitNum) || limitNum < 0) {
      return { error: 'Default limit must be 0 (for No Limit) or a positive integer.' }
    }

    const { PROBLEM_STATEMENTS } = await import('@/data/problem-statements')

    for (const ps of PROBLEM_STATEMENTS) {
      await prisma.problemStatementConfig.upsert({
        where: { psId: ps.id },
        create: { psId: ps.id, maxLimit: limitNum },
        update: { maxLimit: limitNum }
      })
    }

    revalidatePath('/dashboard/coordinator/problem-statements')
    revalidatePath('/dashboard/coordinator')
    revalidatePath('/dashboard/team/problem-statements')
    revalidatePath('/dashboard/team')

    return { success: true, maxLimit: limitNum }
  } catch (error: any) {
    console.error('Batch Update Limits Error:', error)
    return { error: error?.message || 'Failed to batch update problem statement limits' }
  }
}


