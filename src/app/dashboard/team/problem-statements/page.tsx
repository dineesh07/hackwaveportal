import React from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import ProblemStatementsTab from '../components/ProblemStatementsTab'

export default async function TeamProblemStatementsPage() {
  const session = await auth()
  const userId = session?.user?.id
  const rollNo = session?.user?.rollNo

  let isLeader = false
  let leaderName = ''
  let myLockedPsId: string | null = null
  let myTeamId: string | null = null
  let isSubmissionCompleted = false

  if (userId) {
    let cleanRollNo = (rollNo || '').trim()
    if (!cleanRollNo) {
      const u = await prisma.user.findUnique({ where: { id: userId }, select: { rollNo: true } })
      if (u?.rollNo) cleanRollNo = u.rollNo.trim()
    }

    const myTeam = await prisma.team.findFirst({
      where: {
        OR: [
          { userId: userId },
          ...(cleanRollNo ? [
            { leaderRollNo: { equals: cleanRollNo, mode: 'insensitive' as const } },
            { members: { some: { rollNo: { equals: cleanRollNo, mode: 'insensitive' as const } } } }
          ] : [])
        ]
      },
      include: {
        projects: { where: { phase: 1 } }
      }
    })

    if (myTeam) {
      myTeamId = myTeam.id
      leaderName = myTeam.leaderName
      const userRollLower = cleanRollNo.toLowerCase()
      const leaderRollLower = (myTeam.leaderRollNo || '').trim().toLowerCase()
      isLeader = myTeam.userId === userId || Boolean(userRollLower && leaderRollLower && userRollLower === leaderRollLower)
      const isFirstYear = Boolean(leaderRollLower.startsWith('26isr'))
      const prj = myTeam.projects[0]
      if (prj?.problemStatementId) {
        myLockedPsId = prj.problemStatementId
        if (prj.status === 'SUBMITTED' || prj.status === 'REVIEWED') {
          isSubmissionCompleted = true
        }
      }
    }
  }

  // Fetch configs from database directly (safely)
  const initialLimits: Record<string, number> = {}
  try {
    if ((prisma as any).problemStatementConfig?.findMany) {
      const configs = await (prisma as any).problemStatementConfig.findMany()
      configs.forEach((c: any) => { initialLimits[c.psId] = c.maxLimit })
    }
  } catch (err) {
    console.error('Error fetching initial PS limits:', err)
  }

  let isFirstYear = false
  if (userId) {
    let cleanRollNo = (rollNo || '').trim()
    if (!cleanRollNo) {
      const u = await prisma.user.findUnique({ where: { id: userId }, select: { rollNo: true } })
      if (u?.rollNo) cleanRollNo = u.rollNo.trim()
    }
    const myTeam = await prisma.team.findFirst({
      where: {
        OR: [
          { userId: userId },
          ...(cleanRollNo ? [
            { leaderRollNo: { equals: cleanRollNo, mode: 'insensitive' as const } },
            { members: { some: { rollNo: { equals: cleanRollNo, mode: 'insensitive' as const } } } }
          ] : [])
        ]
      },
      select: { leaderRollNo: true }
    })
    if (myTeam?.leaderRollNo?.trim().toLowerCase().startsWith('26isr')) {
      isFirstYear = true
    }
  }

  return (
    <ProblemStatementsTab 
      role="TEAM"
      initialIsLeader={isLeader}
      initialLeaderName={leaderName}
      initialLockedPsId={myLockedPsId}
      initialTeamId={myTeamId}
      initialIsSubmissionCompleted={isSubmissionCompleted}
      initialLimits={initialLimits}
      initialIsFirstYear={isFirstYear}
    />
  )
}

