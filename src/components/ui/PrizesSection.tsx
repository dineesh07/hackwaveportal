"use client";

import React from "react";
import Image from "next/image";
import { Trophy, Medal, Award, Sparkles, CheckCircle2, Zap, GraduationCap, Users } from "lucide-react";
import styles from "./PrizesSection.module.css";

interface PrizeData {
  rank: number;
  rankClass: string;
  badgeLabel: string;
  badgeClass: string;
  glowClass: string;
  cashClass: string;
  title: string;
  cashPrize: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  perks: string[];
}

const prizesData: PrizeData[] = [
  {
    rank: 1,
    rankClass: styles.rank1,
    badgeLabel: "1ST PRIZE • GRAND CHAMPION",
    badgeClass: styles.badgeGold,
    glowClass: styles.glowGold,
    cashClass: styles.cashGold,
    title: "1st Place Winner",
    cashPrize: "Rs. 3,000",
    description: "Awarded to the most innovative, well-engineered, and impactful working prototype.",
    imageSrc: "/1Mascot.png",
    imageAlt: "1st Prize Champion Mascot",
    perks: [
      "Rs. 3,000 Cash Prize",
      "Official Winner Board",
      "Winner Certificate of Excellence"
    ]
  },
  {
    rank: 2,
    rankClass: styles.rank2,
    badgeLabel: "2ND PRIZE • 1ST RUNNER UP",
    badgeClass: styles.badgeSilver,
    glowClass: styles.glowSilver,
    cashClass: styles.cashSilver,
    title: "First Runner-Up",
    cashPrize: "Rs. 2,000",
    description: "Honoring outstanding execution, exceptional problem-solving, and sleek design.",
    imageSrc: "/2Mascot.png",
    imageAlt: "2nd Prize Runner Up Mascot",
    perks: [
      "Rs. 2,000 Cash Prize",
      "Official Winner Board",
      "Certificate of High Merit"
    ]
  },
  {
    rank: 3,
    rankClass: styles.rank3,
    badgeLabel: "3RD PRIZE • 2ND RUNNER UP",
    badgeClass: styles.badgeBronze,
    glowClass: styles.glowBronze,
    cashClass: styles.cashBronze,
    title: "Second Runner-Up",
    cashPrize: "Rs. 1,000",
    description: "Recognizing high technical proficiency, resilience, and creative implementation.",
    imageSrc: "/3Mascot.png",
    imageAlt: "3rd Prize 2nd Runner Up Mascot",
    perks: [
      "Rs. 1,000 Cash Prize",
      "Official Winner Board",
      "Certificate of Merit"
    ]
  }
];

const participantPerks = [
  {
    icon: <GraduationCap size={20} />,
    title: "Participation Certificate",
    desc: "Official verified CT-PG certificates for all registered team members."
  },
  {
    icon: <Users size={20} />,
    title: "1-on-1 Mentor Guidance",
    desc: "Direct guidance and continuous review rounds from experienced faculty mentors."
  },
  {
    icon: <Zap size={20} />,
    title: "Fast-Track Innovation",
    desc: "Learn end-to-end product development from ideation to jury demo."
  },
  {
    icon: <Award size={20} />,
    title: "Exclusive Recognition",
    desc: "Showcase your project on the official Hackwave platform and portfolio."
  }
];

export default function PrizesSection() {
  return (
    <section id="prizes" className={styles.prizesSection}>
      <div className={styles.ambientGlowTop}></div>

      <div className="container">
        {/* Section Header */}
        <div className={styles.headerWrapper}>
          <div className={styles.sectionBadge}>
            <Trophy size={14} />
            <span>Rewards & Recognition</span>
          </div>

          <h2 className={styles.sectionTitle}>
            <span style={{ color: "var(--flame-red)" }}>Exciting</span>{" "}
            <span className={styles.outlineText}>Prizes</span> & Awards
          </h2>

          <p className={styles.sectionSubtitle}>
            Compete with the brightest minds, build groundbreaking prototypes, and take home prestigious cash prizes, winner boards, and certificates.
          </p>
        </div>

        {/* Podium Grid */}
        <div className={styles.podiumGrid}>
          {prizesData.map((prize) => (
            <div
              key={prize.rank}
              className={`${styles.prizeCard} ${prize.rankClass}`}
            >
              {/* Rank Badge */}
              <div className={`${styles.rankBadge} ${prize.badgeClass}`}>
                {prize.rank === 1 ? (
                  <Sparkles size={14} />
                ) : prize.rank === 2 ? (
                  <Medal size={14} />
                ) : (
                  <Award size={14} />
                )}
                <span>{prize.badgeLabel}</span>
              </div>

              {/* Prize Image with Aura Glow */}
              <div className={styles.imageGlowContainer}>
                <div className={`${styles.cardGlowEffect} ${prize.glowClass}`} />
                <div className={styles.prizeImageWrapper}>
                  <Image
                    src={prize.imageSrc}
                    alt={prize.imageAlt}
                    width={280}
                    height={280}
                    className={styles.prizeImage}
                    priority={prize.rank === 1}
                  />
                </div>
              </div>

              {/* Cash Prize Box */}
              <div className={`${styles.cashPrizeBox} ${prize.cashClass}`}>
                <span className={styles.cashLabel}>CASH PRIZE</span>
                <span className={styles.cashAmount}>{prize.cashPrize}</span>
              </div>

              {/* Title & Description */}
              <h3 className={styles.prizeTitle}>{prize.title}</h3>
              <p className={styles.prizeDesc}>{prize.description}</p>

              {/* Perks List */}
              <ul className={styles.perksList}>
                {prize.perks.map((perk, idx) => (
                  <li key={idx} className={styles.perkItem}>
                    <CheckCircle2 size={16} className={styles.perkIcon} />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Perks For All Participants */}
        <div className={styles.perksBanner}>
          <div className={styles.perksHeader}>
            <h4 className={styles.perksTitle}>Every Participant Wins More Than Just Code</h4>
            <p className={styles.perksSub}>
              Beyond top podium awards, HACKWAVE is designed to accelerate your growth and career trajectory.
            </p>
          </div>

          <div className={styles.perksGrid}>
            {participantPerks.map((perk, idx) => (
              <div key={idx} className={styles.perkCard}>
                <div className={styles.perkBadgeIcon}>{perk.icon}</div>
                <div>
                  <h5 className={styles.perkInfoTitle}>{perk.title}</h5>
                  <p className={styles.perkInfoDesc}>{perk.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
