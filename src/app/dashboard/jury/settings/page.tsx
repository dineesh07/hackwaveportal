import React from 'react';
import { auth } from '@/auth';
import { StatusRibbon } from '@/components/ui/StatusRibbon';
import styles from '../../dashboard.module.css';
import { PasswordUpdateForm } from '@/components/PasswordUpdateForm';

export default async function JurySettingsPage() {
  const session = await auth();
  
  if (!session?.user?.id || session.user.role !== 'JURY') {
    return <div>Unauthorized.</div>;
  }

  return (
    <>
      <div className={styles.dashboardContainer} style={{ paddingTop: 0 }}>
        <header className={styles.header} style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 className={styles.title}>Settings</h1>
            <p className={styles.subtitle}>Manage your account and preferences</p>
          </div>
          <StatusRibbon label="Account" tone="neutral" />
        </header>

        <section style={{ maxWidth: '600px', marginTop: '2rem' }}>
          <PasswordUpdateForm />
        </section>
      </div>
    </>
  );
}
