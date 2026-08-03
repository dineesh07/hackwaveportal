import React from "react";
import styles from "./StatusRibbon.module.css";

interface StatusRibbonProps {
  label: string;
  tone?: "hot" | "neutral";
  className?: string;
}

export function StatusRibbon({ label, tone = "hot", className = "" }: StatusRibbonProps) {
  return (
    <span className={`${styles.ribbon} ${styles[tone]} ${className}`}>
      {label}
    </span>
  );
}
