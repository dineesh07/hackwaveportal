"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { Phone } from "lucide-react";
import styles from "./OrganizerCards.module.css";

const LinkedinIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface CardData {
  id: string;
  name: string;
  role: string;
  phone: string;
  linkedin: string;
  serial: string;
  image: string;
}



const organizerCardConfigs: CardData[] = [
  { id: "card-1", name: "Malathi Eswaran", role: "Staff Coordinator", phone: "+91 9489373737", linkedin: "", serial: "HW- 001", image: "/malathimam.jpg" },
  { id: "card-2", name: "Dineesh M.", role: "Lead Organizer", phone: "+91 93637 30057", linkedin: "https://www.linkedin.com/in/dineesh30052007/", serial: "HW-002", image: "/dineesh.jpeg" },
];


const particles = [
  { i: 0, tx: -45, ty: 80, delay: 0.2, duration: 2.5 },
  { i: 1, tx: 70, ty: -60, delay: 1.1, duration: 3.1 },
  { i: 2, tx: -90, ty: -40, delay: 0.5, duration: 2.8 },
  { i: 3, tx: 30, ty: 90, delay: 1.8, duration: 3.5 },
  { i: 4, tx: -20, ty: -85, delay: 0.9, duration: 2.2 },
  { i: 5, tx: 85, ty: 25, delay: 0.3, duration: 3.8 },
  { i: 6, tx: -75, ty: 50, delay: 1.5, duration: 2.9 },
  { i: 7, tx: 50, ty: -75, delay: 0.7, duration: 3.3 },
  { i: 8, tx: -10, ty: 95, delay: 1.2, duration: 2.6 },
  { i: 9, tx: 95, ty: 5, delay: 0.4, duration: 3.9 },
  { i: 10, tx: -60, ty: -20, delay: 1.9, duration: 2.4 },
  { i: 11, tx: 25, ty: -90, delay: 0.8, duration: 3.2 },
];

const Particles = () => {
  return (
    <div className={styles.particlesContainer}>
      {particles.map((p) => (
        <div key={p.i} className={styles.particle} style={{
          "--tx": `${p.tx}px`,
          "--ty": `${p.ty}px`,
          "--delay": `${p.delay}s`,
          "--duration": `${p.duration}s`
        } as React.CSSProperties} />
      ))}
    </div>
  );
};

const OrganizerCard = ({ data, index }: { data: CardData; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTouchDevice] = useState(() =>
    typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  );

  // Mouse tracking for 3D tilt
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { damping: 20, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(springY, [0, 1], [6, -6]);
  const rotateY = useTransform(springX, [0, 1], [-6, 6]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    if (isTouchDevice) return;
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const handleClick = () => {
    if (isTouchDevice) {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={styles.cardWrapper}
    >
      <div className={styles.radialBackglow}></div>
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
        className={styles.floatWrapper}
      >
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          style={{ rotateX, rotateY }}
          className={`${styles.cardContainer} ${isFlipped ? styles.flipped : ""}`}
        >
          <div className={styles.cardInner}>
            {/* FRONT FACE */}
            <div className={`${styles.cardFace} ${styles.cardFront}`}>
              <div className={styles.holographicSweep}></div>
              <Particles />
              <div className={styles.watermarkLogo}>HACKWAVE</div>
              <div className={styles.stars}>
                <span>★</span><span>★</span><span>★</span><span>★</span>
              </div>

              <div className={styles.portraitContainer}>
                <Image
                  src={data.image}
                  alt={data.name}
                  fill
                  style={{ objectFit: 'cover' }}
                />
                <div className={styles.portraitVignette}></div>
              </div>

              <div className={styles.bottomContent}>
                <div className={styles.nameRole}>
                  <h3 className={styles.name}>{data.name}</h3>
                  <p className={styles.role}>{data.role}</p>
                </div>
                <div className={styles.badgeWrapper}>
                  <div className={styles.bottomBadge}>HACKWAVE IGNITE 2026</div>
                  <div className={styles.serial}>{data.serial}</div>
                </div>
              </div>
            </div>

            {/* BACK FACE */}
            <div className={`${styles.cardFace} ${styles.cardBack}`}>
              <div className={styles.holographicSweep}></div>

              <div className={styles.backContent}>
                <div className={styles.mascotContainer}>
                  <Image
                    src="/idBack.png"
                    alt="Hackwave Mascot"
                    fill
                    className={styles.mascotImage}
                  />
                </div>

                <div className={styles.contactInfo}>
                  <a href={`tel:${data.phone}`} className={styles.contactLink}>
                    <Phone size={16} />
                    <span>{data.phone}</span>
                  </a>
                  {data.linkedin && (
                    <a href={data.linkedin.startsWith('http') ? data.linkedin : `https://${data.linkedin}`} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                      <LinkedinIcon size={16} />
                      <span>LinkedIn</span>
                    </a>
                  )}
                </div>

                <div className={styles.badgeWrapperBack}>
                  <div className={styles.bottomBadge}>HACKWAVE ORGANIZING TEAM</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default function OrganizerCards() {
  return (
    <div className={styles.organizerSection}>
      <h2 className={styles.sectionTitle}>
        <span style={{ color: 'var(--flame-red)' }}>Meet</span> the <span className={styles.outlineText}>Team</span>
      </h2>
      <div className={styles.gridContainer}>
        {organizerCardConfigs.map((org, idx) => (
          <OrganizerCard key={org.id} data={org} index={idx} />
        ))}
      </div>
    </div>
  );
}
