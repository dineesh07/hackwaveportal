"use client";

import React, { useState, useEffect } from "react";
import styles from "./Countdown.module.css";

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Target date: September 19, 2026
    const targetDate = new Date("September 19, 2026 00:00:00").getTime();

    const hydrationTick = setTimeout(() => setIsClient(true), 0);

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        return; // Timer reached 0
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);

    return () => {
      clearTimeout(hydrationTick);
      clearInterval(interval);
    };
  }, []);

  if (!isClient) {
    return (
      <div className={styles.grid}>
        <div className={styles.box}>
          <span className={styles.countdown}>
            00
          </span>
          <span style={{ textTransform: 'capitalize' }}>Days</span>
        </div>
        <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '1.5rem', fontWeight: 'normal', marginTop: '-1rem' }}>:</div>
        <div className={styles.box}>
          <span className={styles.countdown}>
            00
          </span>
          <span style={{ textTransform: 'capitalize' }}>Hours</span>
        </div>
        <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '1.5rem', fontWeight: 'normal', marginTop: '-1rem' }}>:</div>
        <div className={styles.box}>
          <span className={styles.countdown}>
            00
          </span>
          <span style={{ textTransform: 'capitalize' }}>Minutes</span>
        </div>
        <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '1.5rem', fontWeight: 'normal', marginTop: '-1rem' }}>:</div>
        <div className={styles.box}>
          <span className={styles.countdown}>
            00
          </span>
          <span style={{ textTransform: 'capitalize' }}>Seconds</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      <div className={styles.box}>
        <span className={styles.countdown} aria-live="polite" aria-label={`${timeLeft.days} days`}>
          {String(timeLeft.days).padStart(2, '0')}
        </span>
        <span style={{ textTransform: 'capitalize' }}>Days</span>
      </div>
      <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '1.5rem', fontWeight: 'normal', marginTop: '-1rem' }}>:</div>
      <div className={styles.box}>
        <span className={styles.countdown} aria-live="polite" aria-label={`${timeLeft.hours} hours`}>
          {String(timeLeft.hours).padStart(2, '0')}
        </span>
        <span style={{ textTransform: 'capitalize' }}>Hours</span>
      </div>
      <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '1.5rem', fontWeight: 'normal', marginTop: '-1rem' }}>:</div>
      <div className={styles.box}>
        <span className={styles.countdown} aria-live="polite" aria-label={`${timeLeft.minutes} minutes`}>
          {String(timeLeft.minutes).padStart(2, '0')}
        </span>
        <span style={{ textTransform: 'capitalize' }}>Minutes</span>
      </div>
      <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '1.5rem', fontWeight: 'normal', marginTop: '-1rem' }}>:</div>
      <div className={styles.box}>
        <span className={styles.countdown} aria-live="polite" aria-label={`${timeLeft.seconds} seconds`}>
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
        <span style={{ textTransform: 'capitalize' }}>Seconds</span>
      </div>
    </div>
  );
}
