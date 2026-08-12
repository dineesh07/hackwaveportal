import React from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { StatusRibbon } from '@/components/ui/StatusRibbon'
import styles from '../../dashboard.module.css'
import MonitoringClient from './MonitoringClient'

export default async function CoordinatorMonitoringPage() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'COORDINATOR') {
    return <div>Unauthorized.</div>
  }

  const mentors = await prisma.user.findMany({
    where: { role: 'MENTOR' },
    select: { id: true, name: true, rollNo: true, status: true },
  });

  const mentorAssignments = await prisma.mentorAssignment.findMany({
    where: { phase: 1 },
    select: {
      mentorId: true,
      team: { select: { projects: { where: { phase: 1 }, select: { id: true, status: true } } } },
    },
  });

  const feedbacks = await prisma.mentorFeedback.findMany({
    where: { phase: 1 },
    select: { mentorId: true, projectId: true, createdAt: true },
  });

  const tasks = await prisma.task.findMany({
    where: { phase: 1 },
    select: { mentorId: true, status: true },
  });

  const mentorStats = mentors.map(m => {
    const myAssigns = mentorAssignments.filter(a => a.mentorId === m.id);
    const submitted = myAssigns.filter(a => a.team.projects[0]?.status === 'SUBMITTED').length;
    const reviewed = myAssigns.filter(a => a.team.projects[0]?.status === 'REVIEWED').length;
    const feedbackCount = feedbacks.filter(f => f.mentorId === m.id).length;
    const myTasks = tasks.filter(t => t.mentorId === m.id);
    const pendingTasks = myTasks.filter(t => t.status === 'PENDING').length;
    return {
      id: m.id,
      name: m.name,
      rollNo: m.rollNo,
      status: m.status,
      teamCount: myAssigns.length,
      submitted,
      reviewed,
      feedbackCount,
      pendingTasks,
    };
  });

  const juries = await prisma.user.findMany({
    where: { role: 'JURY' },
    select: { id: true, name: true, rollNo: true, status: true },
  });

  const juryAssignments = await prisma.juryAssignment.findMany({
    where: { phase: 1 },
    select: { juryId: true, projectId: true },
  });

  const evaluations = await prisma.juryEvaluation.findMany({
    where: { phase: 1 },
    select: { juryId: true, projectId: true, status: true, totalScore: true, submittedAt: true },
  });

  const juryStats = juries.map(j => {
    const assigned = juryAssignments.filter(a => a.juryId === j.id);
    const myEvals = evaluations.filter(e => e.juryId === j.id);
    const submittedEvals = myEvals.filter(e => e.status === 'SUBMITTED');
    const avgScore = submittedEvals.length > 0
      ? submittedEvals.reduce((s, e) => s + e.totalScore, 0) / submittedEvals.length
      : 0;
    return {
      id: j.id,
      name: j.name,
      rollNo: j.rollNo,
      status: j.status,
      projectCount: assigned.length,
      evalCount: myEvals.length,
      submittedCount: submittedEvals.length,
      avgScore,
    };
  });

  const submittedProjects = await prisma.project.findMany({
    where: { phase: 1, status: { in: ['SUBMITTED', 'REVIEWED'] } },
    select: {
      id: true,
      projectTitle: true,
      status: true,
      submittedAt: true,
      team: { select: { teamName: true } },
    },
    orderBy: { submittedAt: 'asc' },
  });

  return (
    <>
      <div className={styles.dashboardContainer} style={{ paddingTop: 0 }}>
        <header className={styles.header} style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 className={styles.title}>Monitoring</h1>
            <p className={styles.subtitle}>Mentor workload, jury progress, and pending reviews</p>
          </div>
          <StatusRibbon label="Phase 1" tone="hot" />
        </header>

        <MonitoringClient
          mentorStats={mentorStats}
          juryStats={juryStats}
          submittedProjects={submittedProjects.map(p => ({
            id: p.id,
            projectTitle: p.projectTitle,
            status: p.status,
            submittedAt: p.submittedAt?.toISOString() || null,
            teamName: p.team.teamName,
          }))}
        />
      </div>
    </>
  )
}
