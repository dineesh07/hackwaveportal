import React from "react";
import styles from "./Tag.module.css";

type TagTone = "neutral" | "success" | "danger" | "gold" | "blue" | "accent";

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: TagTone;
}

export function Tag({ tone = "neutral", className = "", children, ...props }: TagProps) {
  const cls = `${styles.tag} ${styles[tone]} ${className}`;
  return (
    <span className={cls} {...props}>
      {children}
    </span>
  );
}
