import React from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        <div className={styles.logoArea}>
          <Image 
            src="/logo.png" 
            alt="HACKWAVE IGNITE Logo" 
            width={120} 
            height={40} 
          />
          <p className={styles.copyright}>© 2026 Dept. of CT — HACKWAVE.</p>
        </div>

        <div className={styles.links}>
          <Link href="/#about" className={styles.link}>About</Link>
          <Link href="/#tracks" className={styles.link}>Tracks</Link>
          <Link href="/#faq" className={styles.link}>FAQ</Link>
          <Link href="/contact" className={styles.link}>Contact</Link>
          <Link href="/login" className={styles.link}>Login</Link>
        </div>
      </div>
    </footer>
  );
}
