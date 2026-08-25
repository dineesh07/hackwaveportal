"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, MotionValue, useMotionValueEvent } from "framer-motion";
import BorderGlow from "./BorderGlow";
import Image from "next/image";
import styles from "./TimelineScroller.module.css";

// --- DATA ---
interface TimelineItem {
  step: string;
  title: string;
  date: string;
  description: string;
  badge: string;
}

const timelineData: TimelineItem[] = [
  {
    step: "01",
    title: "Registration Opens",
    date: "25 AUG",
    description: "Registrations are now live. Form your team, explore the tracks, and start building your next big idea.",
    badge: "NOW LIVE"
  },
  {
    step: "02",
    title: "Registration Ends",
    date: "01 SEP",
    description: "Team registrations officially close. Ensure your submission is complete before the deadline.",
    badge: "DEADLINE"
  },
  {
    step: "03",
    title: "Atleast one Mentor review to be completed",
    date: "12 SEP",
    description: "Present your prototype to mentors, receive constructive feedback, and refine your solution before Phase 1.",
    badge: "MENTOR REVIEW"
  },
  {
    step: "04",
    title: "HACKWAVE IGNITE",
    date: "21 SEP",
    description: "Showcase your working prototype before the jury. Top-performing teams move on to the next phase.",
    badge: "MAIN EVENT"
  },
  {
    step: "05",
    title: "HACKWAVE INNNOVATE",
    date: "TBA",
    description: "Shortlisted teams return with improved solutions, advanced features, and refined presentations for the final showdown.",
    badge: "COMING SOON"
  },
];

// Breakpoints calculated for intersection exactly at 30vw initially
const BREAKPOINTS = [0.0, 0.21, 0.41, 0.62, 0.82];


// --- CARD COMPONENT ---
const TimelineCard = ({ item, index, scrollYProgress }: { item: TimelineItem; index: number; scrollYProgress: MotionValue<number> }) => {
  const bp = BREAKPOINTS[index];
  const isLast = index === timelineData.length - 1;
  const nextBp = isLast ? 1.0 : BREAKPOINTS[index + 1];

  const hasFadeIn = bp > 0;

  const opacityInputs = isLast
    ? (hasFadeIn ? [bp - 0.05, bp] : [0, 1])
    : (hasFadeIn ? [bp - 0.05, bp, nextBp - 0.05, nextBp] : [0, nextBp - 0.05, nextBp]);

  const opacityOutputs = isLast
    ? (hasFadeIn ? [0, 1] : [1, 1])
    : (hasFadeIn ? [0, 1, 1, 0.4] : [1, 1, 0.4]);

  const opacity = useTransform(scrollYProgress, opacityInputs, opacityOutputs);

  const yInputs = hasFadeIn ? [bp - 0.05, bp] : [0, 1];
  const yOutputs = hasFadeIn ? [40, 0] : [0, 0];
  const y = useTransform(scrollYProgress, yInputs, yOutputs);

  const scaleInputs = hasFadeIn ? [bp - 0.05, bp] : [0, 1];
  const scaleOutputs = hasFadeIn ? [0.92, 1] : [1, 1];
  const scale = useTransform(scrollYProgress, scaleInputs, scaleOutputs);

  const isActive = useTransform(scrollYProgress, (s) => (s as number) >= bp && (s as number) < (isLast ? 2.0 : nextBp));
  const hasReached = useTransform(scrollYProgress, (s) => (s as number) >= Math.max(0, bp - 0.01));

  const [isCardActive, setIsCardActive] = React.useState(false);
  useMotionValueEvent(isActive, "change", (latest) => setIsCardActive(latest));

  const isPhase1 = item.step === "04";

  return (
    <div className={styles.cardContainer}>
      <div className={styles.nodeWrapper}>
        <motion.div
          className={styles.nodeCore}
          style={{
            borderColor: useTransform(hasReached, (reached) => reached ? "#E8283F" : "#4b5563"),
            backgroundColor: useTransform(hasReached, (reached) => reached ? "#FF6B35" : "#111"),
            boxShadow: useTransform(hasReached, (reached) => reached ? "0 0 15px rgba(232, 40, 63, 0.8)" : "none"),
            scale: useTransform(
              scrollYProgress,
              hasFadeIn ? [bp - 0.02, bp, Math.min(1, bp + 0.02)] : [0, 0.02, 0.04],
              hasFadeIn ? [1, 1.3, 1] : [1.3, 1, 1]
            )
          }}
        />
      </div>

      <motion.div
        className={styles.connectingLine}
        style={{
          height: 40,
          scaleY: useTransform(scrollYProgress, hasFadeIn ? [bp - 0.05, bp] : [0, 1], hasFadeIn ? [0, 1] : [1, 1]),
          opacity: useTransform(hasReached, (r) => r ? 1 : 0)
        }}
      />

      <motion.div
        className={styles.cardOuter}
        style={{ opacity, y, scale }}
      >
        <BorderGlow
          className="h-full w-full"
          edgeSensitivity={30}
          glowColor="25 80 60"
          backgroundColor={isPhase1 ? "#2a0a0f" : "#151515"}
          borderRadius={32}
          glowRadius={isCardActive ? (isPhase1 ? 60 : 40) : 0}
          glowIntensity={isCardActive ? (isPhase1 ? 1.5 : 1.0) : 0.0}
          coneSpread={25}
          animated={isCardActive}
          colors={isPhase1 ? ['#ff0055', '#ff9900', '#ff00ff'] : ['#ef4444', '#f97316', '#ff0000']}
        >
          <div className={styles.cardBodyInner}>
            <div className={styles.watermark}>{item.step}</div>

            <div className={styles.cardHeader}>
              <span className={styles.dateBox}>{item.date}</span>
            </div>

            <h3 className={styles.cardTitle}>{item.title}</h3>

            <p className={styles.cardDesc}>{item.description}</p>

            <div className={styles.badgeWrapper}>
              <span className={`${styles.cardBadge} ${isPhase1 ? styles.badgeSpecial : ''}`}>{item.badge}</span>
            </div>
          </div>
        </BorderGlow>
      </motion.div>
    </div>
  );
};


// --- MAIN COMPONENT ---
export function TimelineScroller() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mascotRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // On mobile, card is ~90vw and gap is 15vw (we will adjust CSS to 15vw) -> distance is 105vw. 4 * 105 = 420vw.
  // On desktop, card is ~25vw and gap is 40vw -> distance is 65vw. 4 * 65 = 260vw. -300vw gives some padding.
  const trackX = useTransform(scrollYProgress, [0, 1], ["0%", isMobile ? "-420vw" : "-300vw"]);

  const springScroll = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const mascotX = useTransform(springScroll, [0, 1], ["30vw", isMobile ? "85vw" : "75vw"]);

  const trackProgressWidth = useTransform(springScroll, [0, 1], ["30vw", isMobile ? "450vw" : "375vw"]);

  const endOpacity = useTransform(scrollYProgress, [0.95, 1], [0, 1]);

  return (
    <div className={styles.wrapper}>
      <section ref={containerRef} className={styles.timelineSection}>
        <div className={styles.stickyContainer}>
          <div className={`container ${styles.headerContainer}`}>
            <h2 className={styles.mainTitle} style={{ fontFamily: "var(--font-syncopate), sans-serif", fontWeight: 700 }}>
              <span style={{ color: "var(--flame-red)" }}>Mark</span> your <span className={styles.outlineText}>calendar.</span>
            </h2>
          </div>

          <div className={styles.trackContainer}>
            {/* The Moving Track */}
            <motion.div style={{ x: trackX }} className={styles.movingTrack}>
              <div className={styles.dashedLine}></div>

              <motion.div
                className={styles.gradientLine}
                style={{ width: trackProgressWidth }}
              />

              <div className={styles.cardsWrapper}>
                {timelineData.map((item, idx) => (
                  <TimelineCard key={item.step} item={item} index={idx} scrollYProgress={scrollYProgress} />
                ))}
              </div>
            </motion.div>

            {/* The Mascot */}
            <motion.div
              ref={mascotRef}
              style={{ left: mascotX }}
              className={styles.mascotWrapper}
            >
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={styles.mascotInner}
              >
                <Image
                  src="/flyingMascot.png"
                  alt="Wavey the Mascot"
                  width={280}
                  height={280}
                  className={styles.mascotImage}
                  priority
                />
              </motion.div>
            </motion.div>
          </div>

          {/* Ending Experience */}
          <motion.div
            style={{ opacity: endOpacity, pointerEvents: useTransform(endOpacity, v => v > 0.8 ? "auto" : "none") }}
            className={styles.endOverlay}
          >
            <h3 className={styles.endTitle}>
              &quot;Every great innovation begins with a single idea. HACKWAVE is where those ideas become reality.&quot;
            </h3>
            <a href="/register" className={styles.endBtn}>
              Continue the Journey
              <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                →
              </motion.span>
            </a>
          </motion.div>

        </div>
      </section>
    </div>
  );
}
