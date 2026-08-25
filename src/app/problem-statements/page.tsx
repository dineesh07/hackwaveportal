import React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import ProblemStatementsClient from "./ProblemStatementsClient";

export const metadata: Metadata = {
  title: "Problem Statements | HACKWAVE 2026",
  description:
    "Explore 29 curated problem statements across Agentic AI, Web Development, Cybersecurity, Computer Vision, and 1st-Year challenges for HACKWAVE 2026.",
  openGraph: {
    title: "Problem Statements | HACKWAVE 2026",
    description:
      "Explore 29 curated problem statements across Agentic AI, Web Development, Cybersecurity, Computer Vision, and 1st-Year challenges.",
  },
};

export default function ProblemStatementsPage() {
  return (
    <>
      <Navbar />
      <main>
        <ProblemStatementsClient />
      </main>
      <Footer />
    </>
  );
}
