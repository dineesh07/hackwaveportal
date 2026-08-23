"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import styles from "@/app/page.module.css";

const faqs = [
  { q: "What is HACKWAVE?", a: "HACKWAVE is a two-phase innovation hackathon designed to empower students to solve real-world challenges through technology. Participants collaborate, build working prototypes, receive mentorship from industry experts, and present their solutions before an experienced jury panel." },
  { q: "When will teams get access to the HACKWAVE Portal?", a: "Team registration will open first. Once a team is registered and approved by the coordinator, the team will be granted access to the HACKWAVE Portal." },
  { q: "Who can participate?", a: "HACKWAVE is exclusively open to all students of CT-PG. Whether you're a beginner or an experienced developer, everyone is encouraged to participate and showcase their creativity and technical skills." },
  { q: "How should teams be formed?", a: "Each team must consist of 2 to 4 members. Students are free to collaborate with peers from different years within the CT-PG department, encouraging interdisciplinary learning and teamwork." },
  { q: "Do first-year students have a separate set of Problem Statements?", a: "Yes. First-year students will have a separate competition with a dedicated set of Problem Statements (PS). The Problem Statements listed here are for the main HACKWAVE competition." },
  { q: "What are the available tracks?", a: "Participants can choose from the following technology tracks:\n\nAgentic & Generative AI\nWeb Development\nCybersecurity\nComputer Vision & Deep Learning\n\nChoose the track that best matches your idea and build an innovative solution to solve real-world problems." },
  { q: "When will the Problem Statements be released?", a: "The official Problem Statements will be released on 24th August, alongside the opening of registrations. Teams can then select a problem statement, brainstorm ideas, and begin developing their solution." },
  { q: "Will every team receive mentorship?", a: "Yes. Every registered team will be assigned a mentor who will provide guidance throughout the initial stages of the hackathon. Mentors will review your idea, suggest improvements, assign refinement tasks, and help prepare your team for the Phase 1 evaluation." },
  { q: "Can we use AI tools during development?", a: "Absolutely! Teams are encouraged to use AI tools responsibly to enhance productivity, accelerate development, and explore innovative ideas. However, participants should have a clear understanding of their solution and be able to explain the implementation, technical decisions, and overall project during the evaluation process.\n\nNote: AI is a tool to assist your development—not a substitute for your understanding, creativity, and problem-solving abilities." }

];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col">
      {faqs.map((faq, i) => (
        <div key={i} className={styles.faqItem}>
          <div
            className={styles.faqQuestion}
            onClick={() => toggleOpen(i)}
            style={{ alignItems: "center" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {faq.q}
            </div>
            <motion.div
              animate={{ rotate: openIndex === i ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={20} />
            </motion.div>
          </div>
          <AnimatePresence>
            {openIndex === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
                <div className={styles.faqAnswer} style={{ paddingTop: "1rem", paddingBottom: "0.5rem", whiteSpace: "pre-wrap", color: "rgba(255, 255, 255, 0.7)" }}>
                  {faq.a}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
