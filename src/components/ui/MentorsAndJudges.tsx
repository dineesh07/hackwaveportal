"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { Lock } from "lucide-react";
import styles from "./MentorsAndJudges.module.css";

const mentors = [
  { name: "Jayakkavin E", role: "Software Engineer", company: "Payoda Technology", img: "/mentors/mentor1.jpeg" },
  { name: "Vignesh K", role: "Senior Associate Technical Consultant", company: "4i Apps Solutions", img: "/mentors/mentor2.jpeg", objectPosition: "top" },
  { name: "Shree Sanjai", role: "Associate Product Developer", company: "Lumel Technologies", img: "/mentors/mentor3.jpeg" },
  { name: "Harini M", role: "Solution Consultant", company: "Francium Tech", img: "/mentors/mentor4.jpeg" },
  { name: "Indhumathi Radhakrishnan", role: "Team Lead", company: "FirstQA Systems", img: "/mentors/mentor5.jpeg" },
  { name: "Sudharsanam", role: "Software Engineer", company: "Appsentinels Pvt Ltd", img: "/mentors/mentor6.jpeg" },
  { name: "Sakthiganesan", role: "Automation Engineer", company: "Lumel Technologies", img: "/mentors/mentor7.jpeg" },
  { name: "Harshath", role: "Associate Software Developer", company: "Rently", img: "/mentors/mentor8.jpeg", objectPosition: "top" },
  { name: "Samyugtha K", role: "AI/ML & Computational Science Analyst", company: "Accenture", img: "/mentors/mentor9.png", objectPosition: "top" },
  { name: "Aswinraj S", role: "Software Development Engineer & Prompt Engineer", company: "CloudAssert", img: "/mentors/mentor-placeholder.svg" },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  }
};

const ImageWithShimmer = ({ src, alt, objectPosition }: { src: string, alt: string, objectPosition?: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <div className={styles.cardImageWrapper}>
      {!isLoaded && <div className={styles.shimmer} />}
      <Image
        src={src}
        alt={alt}
        fill
        className={styles.image}
        style={objectPosition ? { objectPosition } : undefined}
        onLoad={() => setIsLoaded(true)}
      />
      <div className={styles.vignette}></div>
    </div>
  );
};

const MentorCard = ({ mentor }: { mentor: typeof mentors[0] }) => {
  return (
    <motion.div variants={cardVariants} className={styles.card}>
      <ImageWithShimmer src={mentor.img} alt={mentor.name} objectPosition={mentor.objectPosition} />
      <div className={styles.cardInfo}>
        <div className={styles.name}>{mentor.name}</div>
        <div className={styles.role}>{mentor.role}</div>
        <div className={styles.companyPill}>{mentor.company}</div>
      </div>
    </motion.div>
  );
};

const JudgeCard = () => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      variants={cardVariants}
      className={styles.flipContainer}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`${styles.flipper} ${isFlipped ? styles.flipped : ""}`}>
        <div className={`${styles.card} ${styles.front}`}>
          <div className={styles.lockedBadge}>
            <Lock size={14} strokeWidth={3} /> LOCKED
          </div>
          <ImageWithShimmer src="/judges/locked.svg" alt="Mystery Judge" />
          <div className={styles.cardInfo}>
            <div className={styles.name}>???????</div>
            <div className={styles.role}>Industry Expert</div>
            <div className={styles.companyPill}>To Be Revealed</div>
          </div>
        </div>

        <div className={styles.back}>
          <div className={styles.backLockGlow}></div>
          <Lock size={64} strokeWidth={2} color="rgba(255,255,255,0.8)" className="mb-6 z-10 relative" />
          <div className={styles.comingSoon}>COMING SOON</div>
          <div className={styles.backSubtitle}>
            Our industry experts and jury panel will be revealed soon.<br />
            Stay tuned for the official announcement.
          </div>
          <div className={styles.revealingBadge}>REVEALING SOON</div>
          <div className={styles.lightSweep}></div>
        </div>
      </div>
    </motion.div>
  );
};

export default function MentorsAndJudges() {
  return (
    <section className={styles.section}>
      <div className="container">

        {/* MENTORS SECTION */}
        <div className={styles.titleContainer}>
          <h2 className={styles.title}>Mentors</h2>
        </div>

        <motion.div
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {mentors.map((mentor, i) => (
            <MentorCard key={i} mentor={mentor} />
          ))}
        </motion.div>

        {/* JUDGES SECTION */}
        <div id="judges" className={styles.titleContainer} style={{ marginTop: '8rem' }}>
          <h2 className={styles.title}>Judges</h2>
        </div>

        <motion.div
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", maxWidth: "1050px", margin: "0 auto" }}
        >
          <JudgeCard />
          <JudgeCard />
          <JudgeCard />
        </motion.div>

      </div>
    </section>
  );
}
