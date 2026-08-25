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
          
          {/* WhatsApp Group Invitation */}
          <div className={styles.whatsappCard}>
            <div className={styles.whatsappHeader}>
              <div className={styles.whatsappIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.06-2.123-.532-1.827-.757-3.003-2.618-3.094-2.74-.092-.121-.741-.987-.741-1.884 0-.898.468-1.339.635-1.522.167-.183.366-.228.488-.228.122 0 .244.002.35.007.112.006.262-.043.41.312.155.373.53 1.294.577 1.387.047.094.078.203.016.326-.062.122-.093.199-.186.307-.093.109-.196.244-.28.327-.094.093-.191.196-.083.382.108.187.481.794 1.033 1.285.711.633 1.31.83 1.498.923.187.093.296.078.405-.047.109-.125.467-.544.592-.731.125-.187.25-.156.421-.093.171.062 1.09.514 1.277.607.187.094.312.14.358.219.046.078.046.452-.098.857zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.176L2 22l4.981-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                </svg>
              </div>
              <div>
                <h3 className={styles.whatsappTitle}>Join Official WhatsApp Group</h3>
                <p className={styles.whatsappText}>All team members must join the official WhatsApp group for important announcements, schedule alerts, and mentor connect.</p>
              </div>
            </div>
            <a
              href="https://chat.whatsapp.com/LiQhKZYFOK63Td2UsWNeqP"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappButton}
            >
              Join WhatsApp Group →
            </a>
          </div>
          
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
