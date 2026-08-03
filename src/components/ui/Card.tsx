import React from "react";
import styles from "./Card.module.css";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function Card({ interactive = false, className = "", children, ...props }: CardProps) {
  const cls = `${styles.card} ${interactive ? styles.interactive : ""} ${className}`;
  return (
    <div className={cls} {...props}>
      {children}
    </div>
  );
}
