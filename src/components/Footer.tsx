import React from "react";
import Link from "next/link";
import Image from "next/image";
import clubLogo from "../../public/clublogo.png";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.animatedBorder}></div>
      <div className={styles.gridBackground}></div>

      <div className={styles.hugeTextWrapper}>
        <span className={styles.hugeText}>#HACKWAVE'26</span>
      </div>

      <div className={`container ${styles.footerContainer}`}>
        {/* Top Section */}
        <div className={styles.topSection}>
          <div className={styles.topLeft}>
            <h2 className={styles.readyText}>Ready to create the next wave?</h2>
            <Link href="/register" className={styles.registerCta}>
              Register Now &rarr;
            </Link>
          </div>

          <div className={styles.topRight}>
            <nav className={styles.navLinks}>
              <Link href="/#home" className={styles.navLink} style={{ '--stagger': 1 } as React.CSSProperties}>Home</Link>
              <Link href="/#about" className={styles.navLink} style={{ '--stagger': 2 } as React.CSSProperties}>About</Link>
              <Link href="/#tracks" className={styles.navLink} style={{ '--stagger': 3 } as React.CSSProperties}>Tracks</Link>
              <Link href="/problem-statements" className={styles.navLink} style={{ '--stagger': 4 } as React.CSSProperties}>Problem Statements</Link>
              <Link href="/#prizes" className={styles.navLink} style={{ '--stagger': 5 } as React.CSSProperties}>Prizes</Link>
              <Link href="/#timeline" className={styles.navLink} style={{ '--stagger': 6 } as React.CSSProperties}>Timeline</Link>
              <Link href="/#mentors" className={styles.navLink} style={{ '--stagger': 7 } as React.CSSProperties}>Mentors</Link>
              <Link href="/#faq" className={styles.navLink} style={{ '--stagger': 8 } as React.CSSProperties}>FAQ</Link>
              <Link href="/register" className={styles.navLink} style={{ '--stagger': 9 } as React.CSSProperties}>Register</Link>
              <Link href="/login" className={styles.navLink} style={{ '--stagger': 10 } as React.CSSProperties}>Login</Link>
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={styles.bottomSection}>
          <div className={styles.bottomLeft}>
            <div className={styles.logoWrapper}>
              {/* Footer Logo */}
              <Image
                src={clubLogo}
                alt="Coding Club Logo"
                className={styles.logoImg}
              />
            </div>
            <div className={styles.orgInfo}>
              <span className={styles.orgLabel}>OFFICIALLY ORGANIZED BY</span>
              <span className={styles.orgHighlight}>Coding Club of CT-PG</span>
              <span className={styles.orgDept}>Department of Computer Technology &ndash; PG</span>
              <span className={styles.orgCollege}>Kongu Engineering College</span>
            </div>
          </div>

          <div className={styles.bottomRight}>
            <p className={styles.copyrightText}>&copy; 2026 HACKWAVE &bull; All Rights Reserved.</p>
            <div className={styles.devCredit}>
              Designed & Developed with ❤️ <a href="https://dineeshm.vercel.app" target="_blank" rel="noopener noreferrer" className={styles.devLink}>Dineesh M.</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
