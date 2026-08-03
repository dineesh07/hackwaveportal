import React from "react";
import styles from "./FormControls.module.css";

export function Field({
  label,
  required,
  error,
  helper,
  children,
}: {
  label?: string;
  required?: boolean;
  error?: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.field}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      {children}
      {error ? (
        <span className={styles.error}>{error}</span>
      ) : helper ? (
        <span className={styles.helper}>{helper}</span>
      ) : null}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, className = "", ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={`${styles.control} ${invalid ? styles.invalid : ""} ${className}`}
      {...props}
    />
  );
});

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, className = "", ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={`${styles.control} ${styles.textarea} ${invalid ? styles.invalid : ""} ${className}`}
      {...props}
    />
  );
});

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { invalid, className = "", children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={`${styles.control} ${invalid ? styles.invalid : ""} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});
