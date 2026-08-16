import React from 'react'
import { auth } from '@/auth'
import { getTeamData } from '../team-data'
import MyTeamTab from '../components/MyTeamTab'

export default async function TeamMyTeamPage() {
  const session = await auth()
  if (!session?.user?.id) return null;

  const teamData = await getTeamData(session.user.id, session.user.rollNo)
  if (!teamData || !teamData.team) return null

  return (
    <MyTeamTab team={teamData.team} />
  )
}
