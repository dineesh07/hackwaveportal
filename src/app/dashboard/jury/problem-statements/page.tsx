import React from 'react'
import ProblemStatementsTab from '@/app/dashboard/team/components/ProblemStatementsTab'
import styles from '../../dashboard.module.css'

export default function JuryProblemStatementsPage() {
  return (
    <div className={styles.dashboardContainer} style={{ paddingTop: 0 }}>
      <header className={styles.header} style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className={styles.title}>Problem Statements</h1>
          <p className={styles.subtitle}>Browse all available problem statements for this hackathon</p>
        </div>
      </header>
      <ProblemStatementsTab role="JURY" />
    </div>
  )
}
