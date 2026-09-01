import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Countdown } from "@/components/ui/Countdown";
import TiltedCard from "@/components/ui/TiltedCard";
import BorderGlow from "@/components/ui/BorderGlow";
import { Bot, Globe, GraduationCap, ShieldCheck, Cpu, ArrowRight, Sparkles, FileText } from "lucide-react";
import { TimelineScroller } from "@/components/ui/TimelineScroller";
import MentorsAndJudges from "@/components/ui/MentorsAndJudges";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import OrganizerCards from "@/components/ui/OrganizerCards";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <Navbar />

      <div className={styles.publicPortal}>
        <main>
          {/* HERO SECTION */}
          <section id="home" className={`${styles.hero}`}>
            <div className={styles.radialGlowTopLeft}></div>
            <div className={styles.radialGlowBottomRight}></div>
            <div className="container">
              <div className={styles.heroContent}>

                {/* LEFT COLUMN */}
                <div className={styles.heroLeft}>

                  <h1 className={styles.headline}>
                    MAKE <span style={{ color: 'var(--flame-red)' }}>WAVES.</span><br />BUILD THE FUTURE.
                  </h1>

                  <p className={styles.subheadline} style={{ textAlign: 'justify' }}>
                    Organized by the Coding Club of CT-PG, <b>HACKWAVE</b> is a two-phase innovation hackathon by the <b>M.Sc. Software Systems</b> department, where ideas evolve into impactful solutions through mentorship, collaboration, and competition.
                  </p>

                  <div className={styles.heroControls}>
                    <div className={styles.heroControlsLeft}>
                      <div className={styles.featureStrip} style={{ marginBottom: 0 }}>
                        {[
                          { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /></svg>, text: "INNOVATE" },
                          { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>, text: "BUILD" },
                          { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>, text: "COLLABORATE" },
                          { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>, text: "IGNITE" },
                          { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>, text: "WIN" }
                        ].map((feature, idx) => (
                          <div key={idx} className={styles.featureItem}>
                            <div className={styles.featureIcon}>{feature.icon}</div>
                            <div className={styles.featureText}>{feature.text}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.heroControlsRight}>
                      <div className={styles.countdownWrapper}>
                        <div className={styles.countdownHeader}>HACKWAVE IGNITE • 26 September 2026</div>
                        <Countdown />

                        <a href="/register" className={styles.btnFullPrimary}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>
                          Register Now
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className={styles.heroRight}>
                  <Image
                    src="/mascot.png"
                    alt="Hackwave Mascot"
                    width={1100}
                    height={1100}
                    className={styles.mascotImage}
                    priority
                  />
                </div>

              </div>
            </div>
          </section>

          {/* ABOUT SECTION */}
          <section id="about" className={styles.section}>
            <div className="container">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="flex flex-col gap-6 text-lg text-left">
                  <h2 className={`${styles.sectionTitle}`} style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                    <span style={{ color: 'var(--flame-red)' }}>What</span> is <span className={styles.outlineText}>HACKWAVE?</span>
                  </h2>
                  <p style={{ textAlign: 'justify' }}>
                    Organized by the <b>Coding Club of CT-PG</b>, <b>HACKWAVE</b> is an innovation-driven hackathon from the <b>M.Sc. Software Systems community</b>, designed to go beyond traditional hackathons by emphasizing continuous learning, mentorship, and innovation.
                  </p>
                  <p style={{ textAlign: 'justify' }}>
                    Teams begin by building a working prototype, receive valuable guidance from dedicated mentors, and iterate on their solutions before presenting them to an expert jury. This ensures every participant experiences the complete product development journey, from ideation to execution.
                  </p>
                </div>
                <div className="flex justify-center md:justify-end">
                  <TiltedCard
                    imageSrc="/logo.png"
                    altText="Hackwave Logo"
                    captionText="HACKWAVE IGNITE"
                    containerHeight="300px"
                    containerWidth="300px"
                    imageHeight="300px"
                    imageWidth="300px"
                    rotateAmplitude={12}
                    scaleOnHover={1.1}
                    showMobileWarning={false}
                    showTooltip={false}
                    displayOverlayContent={false}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* TRACKS SECTION */}
          <section id="tracks" className={`${styles.section} bg-[var(--surface)]`}>
            <div className="container">
              <h2 className={`${styles.sectionTitle}`}>
                <span style={{ color: 'var(--flame-red)' }}>Tracks</span> to <span className={styles.outlineText}>Innovate</span>
              </h2>
              <div className={styles.bentoGrid}>
                {[
                  { icon: <Bot size={32} />, title: "Agentic & Generative AI", desc: "Build autonomous AI agents, LLM-powered applications, copilots, and intelligent systems that automate workflows, enhance decision-making, and solve real-world challenges.", itemClass: styles.bentoItemTop },
                  { icon: <Globe size={32} />, title: "Web Development", desc: "Design and develop modern, scalable, and user-centric web applications with exceptional performance, seamless user experiences, and robust backend architectures.", itemClass: styles.bentoItemTop },
                  { icon: <ShieldCheck size={32} />, title: "Cybersecurity", desc: "Create secure, resilient, and privacy-focused solutions that protect digital systems through threat detection, secure authentication, digital forensics, and cyber defense.", itemClass: styles.bentoItemTop },
                  { icon: <Cpu size={32} />, title: "Computer Vision & Deep Learning", desc: "Develop intelligent vision systems powered by deep learning for image analysis, object detection, medical imaging, autonomous technologies, and beyond.", itemClass: styles.bentoItemBottom }
                ].map((track, i) => (
                  <BorderGlow
                    key={i}
                    className={`${track.itemClass} h-full w-full`}
                    edgeSensitivity={30}
                    glowColor="40 80 80"
                    backgroundColor="var(--surface-50)"
                    borderRadius={24}
                    glowRadius={40}
                    glowIntensity={1.0}
                    coneSpread={25}
                    animated={false}
                    colors={['#ef4444', '#f97316', '#ff0000']}
                  >
                    <div className={styles.trackCard}>
                      <div className={styles.trackIcon}>{track.icon}</div>
                      <h3 className={styles.trackTitle}>{track.title}</h3>
                      <p className={styles.trackDesc}>{track.desc}</p>
                    </div>
                  </BorderGlow>
                ))}
              </div>

              {/* PROBLEM STATEMENTS CTA */}
              <div className={styles.tracksCtaWrapper}>
                <Link href="/problem-statements" className={styles.tracksCtaButton}>
                  <span className={styles.tracksCtaBadge}>
                    <Sparkles size={14} />
                    <span>29 Challenges Available</span>
                  </span>
                  <span className={styles.tracksCtaTitle}>
                    <span>See Problem Statements</span>
                    <ArrowRight size={20} className={styles.tracksCtaArrow} />
                  </span>
                  <span className={styles.tracksCtaSub}>
                    Explore Common & 1st-Year Statements across all tracks &rarr;
                  </span>
                </Link>
              </div>
            </div>
          </section>

          {/* TIMELINE SECTION */}
          <div id="timeline">
            <TimelineScroller />
          </div>

          {/* MENTORS & JUDGES SECTION */}
          <section id="mentors">
            <MentorsAndJudges />
          </section>

          {/* FAQ SECTION */}
          <section id="faq" className={styles.section}>
            <div className="container max-w-[800px]">
              <h2 className={`${styles.sectionTitle}`}>
                <span style={{ color: 'var(--flame-red)' }}>Frequently</span> Asked <span className={styles.outlineText}>Questions</span>
              </h2>
              <FaqAccordion />
            </div>
          </section>

          {/* ORGANIZERS */}
          <section id="contact">
            <OrganizerCards />
          </section>
        </main>
      </div>

      <Footer />
    </>
  );
}
