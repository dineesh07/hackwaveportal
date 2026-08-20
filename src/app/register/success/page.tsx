"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { CheckCircle, Info } from "lucide-react";
import styles from "./page.module.css";

export default function RegisterSuccessPage() {
  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <div className={styles.card}>
          <div className={styles.iconWrapper}>
            <CheckCircle size={56} color="var(--success)" />
          </div>
          <h1 className={`${styles.title} display-title`}>Registration Submitted!</h1>
          
          <p className={styles.subtitle}>
            Your team has successfully registered for HACKWAVE 2026.
          </p>
          
          <div className={styles.infoBox}>
            <div className={styles.infoTitle}>
              <Info size={24} color="var(--flame-red)" />
              Important Next Steps
            </div>
            
            <ul className={styles.infoList}>
              <li>
                <div className={styles.bullet}></div>
                <div>Your registration is currently <strong>pending review</strong> by the coordinator.</div>
              </li>
              <li>
                <div className={styles.bullet}></div>
                <div>Once approved, an individual account will be automatically created for <strong>every team member</strong> listed in your registration &mdash; including the team leader.</div>
              </li>
              <li>
                <div className={styles.bullet}></div>
                <div>
                  Username: <strong>Your Roll Number</strong><br />
                  Default Password: <code className={styles.codeBlock}>12345</code>
                </div>
              </li>
            </ul>
            
            <div className={styles.warningText}>
              Each member must log in separately using their own roll number, and will be required to change their password immediately on first login.
            </div>
          </div>
          
          <div className={styles.actions}>
            <Button href="/" variant="primary">Return to Homepage</Button>
          </div>
        </div>
      </main>
    </>
  );
}
