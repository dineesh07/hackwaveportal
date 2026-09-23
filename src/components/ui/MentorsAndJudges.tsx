"use client";

import React from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import styles from "./MentorsAndJudges.module.css";

const mentors = [
  { name: "Jayakkavin E", role: "Software Engineer", company: "Payoda Technology", img: "/mentors/mentor1.jpeg" },
  { name: "Vignesh K", role: "Senior Associate Technical Consultant", company: "4i Apps Solutions", img: "/mentors/mentor2.jpeg", objectPosition: "0% 20%" },
  { name: "Shree Sanjai", role: "Associate Product Developer", company: "Lumel Technologies", img: "/mentors/mentor3.jpeg" },
  { name: "Harini M", role: "Solution Consultant", company: "Francium Tech", img: "/mentors/mentor4.jpeg" },
  { name: "Indhumathi Radhakrishnan", role: "Team Lead", company: "FirstQA Systems", img: "/mentors/mentor5.jpeg", objectPosition: "top" },
  { name: "Sudharsanam", role: "Software Engineer", company: "Appsentinels Pvt Ltd", img: "/mentors/mentor6.jpeg" },
  { name: "Sakthiganesan", role: "Automation Engineer", company: "Lumel Technologies", img: "/mentors/mentor7.jpeg" },
  { name: "Harshath", role: "Associate Software Developer", company: "Rently", img: "/mentors/mentor8.jpeg", objectPosition: "top" },
  { name: "Samyugtha K", role: "AI/ML & Computational Science Analyst", company: "Accenture", img: "/mentors/mentor9.png", objectPosition: "top" },
  { name: "Aswinraj S", role: "Software Development Engineer & Prompt Engineer", company: "CloudAssert", img: "/mentors/mentor10.jpeg", objectPosition: "top", scale: 1.15 },
];

const judges = [
  {
    name: "Bala Kaarthik Veerappan Balasubramanian",
    role: "Staff Programming Analyst",
    company: "Extreme Networks India Pvt. Limited",
    img: "/jury1.jpeg",
    objectPosition: "center 20%"
  },
  {
    name: "Lakshin C",
    role: "Associate Product Engineer",
    company: "Arivonix AI",
    img: "/jury2.jpeg",
    objectPosition: "center top",
    transform: "scale(1.6) translateY(24px)"
  }
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

const ImageWithShimmer = ({ 
  src, 
  alt, 
  objectPosition, 
  scale, 
  transform 
}: { 
  src: string; 
  alt: string; 
  objectPosition?: string; 
  scale?: number; 
  transform?: string;
}) => {
  return (
    <div className={styles.cardImageWrapper}>
      <Image
        src={src}
        alt={alt}
        fill
        className={styles.image}
        style={{ 
          objectPosition: objectPosition || "center",
          transform: transform || (scale ? `scale(${scale})` : undefined)
        }}
      />
      <div className={styles.vignette}></div>
    </div>
  );
};

const MemberCard = ({ 
  member 
}: { 
  member: { 
    name: string; 
    role: string; 
    company: string; 
    img: string; 
    objectPosition?: string; 
    scale?: number;
    transform?: string;
  } 
}) => {
  return (
    <motion.div variants={cardVariants} className={styles.card}>
      <ImageWithShimmer 
        src={member.img} 
        alt={member.name} 
        objectPosition={member.objectPosition} 
        scale={member.scale}
        transform={member.transform}
      />
      <div className={styles.cardInfo}>
        <div className={styles.name}>{member.name}</div>
        <div className={styles.role}>{member.role}</div>
        <div className={styles.companyPill}>{member.company}</div>
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
          viewport={{ once: true, amount: 0.1 }}
        >
          {mentors.map((mentor, i) => (
            <MemberCard key={i} member={mentor} />
          ))}
        </motion.div>

        {/* JUDGES SECTION */}
        <div id="judges" className={styles.titleContainer} style={{ marginTop: '8rem' }}>
          <h2 className={styles.title}>Judges</h2>
        </div>

        <motion.div
          className={styles.judgesGrid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {judges.map((judge, i) => (
            <MemberCard key={i} member={judge} />
          ))}
        </motion.div>

      </div>
    </section>
  );
}
