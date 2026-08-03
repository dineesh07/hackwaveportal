import React from "react";
import styles from "./StatCard.module.css";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  tone?: "default" | "success" | "danger" | "gold";
}

export function StatCard({ label, value, icon, tone = "default" }: StatCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        {icon && (
          <span className={`${styles.icon} ${styles[tone]}`}>{icon}</span>
        )}
      </div>
      <div className={`${styles.value} ${styles[tone]} tabular-nums`}>{value}</div>
      <span className={`${styles.bar} ${styles[`bar_${tone}`]}`} aria-hidden="true" />
    </div>
  );
}
