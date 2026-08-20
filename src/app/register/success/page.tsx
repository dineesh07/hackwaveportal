"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { CheckCircle, Info } from "lucide-react";

export default function RegisterSuccessPage() {
  return (
    <>
      <Navbar />
      <main className="container flex justify-center items-center py-24 min-h-[80vh]">
        <div className="max-w-[650px] w-full bg-[var(--surface)] border border-[var(--line)] shadow-xl shadow-[var(--primary)]/5 rounded-xl p-10 text-center flex flex-col items-center relative overflow-hidden">
          
          {/* Decorative glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-[var(--success)]/20 blur-[80px] rounded-full pointer-events-none"></div>

          <div className="bg-[var(--success)]/10 p-4 rounded-full mb-6 ring-8 ring-[var(--success)]/5">
            <CheckCircle size={56} color="var(--success)" />
          </div>
          
          <h1 className="text-3xl font-bold display-title mb-3 tracking-tight">Registration Submitted!</h1>
          <p className="text-[var(--text-secondary)] mb-8 text-lg">Your team has successfully registered for HACKWAVE 2026.</p>
          
          <div className="bg-[var(--paper)]/50 backdrop-blur-sm border border-[var(--line)] p-6 rounded-xl mb-8 text-left w-full shadow-inner">
            <div className="flex items-center gap-2 mb-4">
              <Info size={20} className="text-[var(--primary)]" />
              <h3 className="font-semibold text-[var(--text)] text-lg">Important Next Steps</h3>
            </div>
            
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-2 shrink-0"></div>
                <p className="opacity-90">Your registration is currently <strong className="text-[var(--primary)]">pending review</strong> by the coordinator.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-2 shrink-0"></div>
                <p className="opacity-90">Once approved, an account will automatically be created for your team leader.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-2 shrink-0"></div>
                <p className="opacity-90">Your username will be your <strong>Roll Number</strong>.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-2 shrink-0"></div>
                <p className="opacity-90">Your default password will be set to <code className="bg-[var(--surface)] border border-[var(--line)] px-1.5 py-0.5 rounded font-mono font-bold">12345</code>.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--flame-red)] mt-2 shrink-0"></div>
                <p className="text-[var(--flame-red)] font-medium">You must change this password immediately upon your first login.</p>
              </li>
            </ul>
          </div>
          
          <Button href="/" variant="primary" className="w-full sm:w-auto px-8 py-3 text-lg font-medium shadow-md shadow-[var(--primary)]/20">
            Return to Homepage
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
