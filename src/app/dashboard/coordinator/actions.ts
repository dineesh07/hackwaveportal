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
        // First, get all members of the team
        const members = await tx.teamMember.findMany({ where: { teamId: team.id } });
        let leaderUserId: string | null = null;
  
        // Iterate through all members and create/update their User accounts
        for (const member of members) {
          if (!member.rollNo) continue; // Skip if no roll number is provided
  
          const userConditions: any[] = [{ rollNo: member.rollNo }];
          if (member.email && member.email.trim() !== '') {
            userConditions.push({ email: member.email.trim() });
          }
  
          let user = await tx.user.findFirst({
            where: { OR: userConditions }
          });
  
          if (user) {
            // If this is the leader, check if they are already leading another team
            if (member.rollNo === team.leaderRollNo) {
              const existingTeam = await tx.team.findFirst({ where: { userId: user.id } });
              if (existingTeam && existingTeam.id !== teamId) {
                throw new Error(`The leader is already the leader of another team (${existingTeam.teamName}).`);
              }
            }
  
            user = await tx.user.update({
              where: { id: user.id },
              data: {
                name: member.name,
                phone: member.phone
              }
            });
          } else {
            const finalEmail = member.email && member.email.trim() !== '' ? member.email.trim() : null;
            user = await tx.user.create({
              data: {
                name: member.name,
                rollNo: member.rollNo,
                email: finalEmail,
                phone: member.phone,
                passwordHash,
                mustChangePassword: true,
                role: 'TEAM',
                status: 'ACTIVE'
              }
            });
          }
  
          // Keep track of the leader's user ID to link to the Team
          if (member.rollNo === team.leaderRollNo) {
            leaderUserId = user.id;
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

    const team = await prisma.team.findUnique({ where: { id: teamId } })
    if (!team) return { error: 'Team not found' }

    await prisma.$transaction(async (tx) => {
      await tx.team.update({
        where: { id: teamId },
        data: {
          registrationStatus: 'REJECTED'
        }
      })

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
