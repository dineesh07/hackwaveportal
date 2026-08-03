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

    // Transaction: Create User, Update Team
    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: team.leaderName,
          rollNo: team.leaderRollNo,
          email: team.leaderEmail,
          phone: team.leaderPhone,
          passwordHash,
          mustChangePassword: true,
          role: 'TEAM',
          status: 'ACTIVE'
        }
      })

      await tx.team.update({
        where: { id: teamId },
        data: {
          registrationStatus: 'ACCOUNT_CREATED',
          userId: newUser.id,
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
    })

    revalidatePath('/dashboard/coordinator')
    return { success: true }
  } catch (error) {
    console.error('Approve Team Error:', error)
    return { error: 'Internal server error' }
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
