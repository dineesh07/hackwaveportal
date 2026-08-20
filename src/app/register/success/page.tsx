"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { CheckCircle, Info, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] relative overflow-hidden">
      <Navbar />
      
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[var(--success)]/10 rounded-full blur-[150px] -z-10 pointer-events-none"></div>

      <main className="flex-grow container flex justify-center items-center py-20 px-4 relative z-10">
        <div className="max-w-[700px] w-full bg-[var(--surface)]/80 backdrop-blur-md border border-[var(--line)] shadow-2xl rounded-2xl p-10 md:p-12 text-center flex flex-col items-center">
          
          <div className="bg-gradient-to-b from-[var(--success)]/20 to-[var(--success)]/5 p-4 rounded-full mb-8 shadow-[0_0_40px_rgba(34,197,94,0.3)] ring-1 ring-[var(--success)]/30">
            <CheckCircle size={64} className="text-[var(--success)] drop-shadow-md" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold display-title mb-4 tracking-tight">Registration Submitted!</h1>
          <p className="text-[var(--text-secondary)] mb-10 text-lg md:text-xl font-medium">Your team has successfully registered for HACKWAVE 2026.</p>
          
          <div className="bg-[var(--background)]/60 border border-[var(--line)] p-8 rounded-2xl mb-10 text-left w-full shadow-inner relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[var(--primary)] to-[var(--success)]"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[var(--primary)]/10 p-2 rounded-lg">
                <Info size={24} className="text-[var(--primary)]" />
              </div>
              <h3 className="font-bold text-[var(--text)] text-xl">Important Next Steps</h3>
            </div>
            
            <ul className="space-y-5 text-[1.05rem]">
              <li className="flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full bg-[var(--primary)] mt-2.5 shrink-0 shadow-[0_0_8px_var(--primary)]"></div>
                <p className="opacity-90 leading-relaxed">Your registration is currently <strong className="text-[var(--primary)] font-semibold">pending review</strong> by the coordinator.</p>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full bg-[var(--primary)] mt-2.5 shrink-0 shadow-[0_0_8px_var(--primary)]"></div>
                <p className="opacity-90 leading-relaxed">Once approved, an individual account will be automatically created for <strong className="font-semibold text-[var(--text)]">every team member</strong> listed in your registration &mdash; including the team leader.</p>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full bg-[var(--primary)] mt-2.5 shrink-0 shadow-[0_0_8px_var(--primary)]"></div>
                <div className="opacity-90 leading-relaxed">
                  <span className="block">Username: <strong className="font-semibold text-[var(--text)]">Your Roll Number</strong></span>
                  <span className="block mt-1">Default Password: <code className="bg-[var(--surface)] text-[var(--primary)] border border-[var(--line)] px-2 py-1 rounded-md font-mono font-bold text-sm tracking-wider">12345</code></span>
                </div>
              </li>
              <li className="flex gap-4 items-start bg-[var(--flame-red)]/5 -mx-4 px-4 py-3 rounded-lg border-l-2 border-[var(--flame-red)]">
                <div className="w-2 h-2 rounded-full bg-[var(--flame-red)] mt-2.5 shrink-0 shadow-[0_0_8px_var(--flame-red)]"></div>
                <p className="text-[var(--flame-red)] font-medium leading-relaxed">Each member must log in separately using their own roll number, and will be required to change their password immediately on first login.</p>
              </li>
            </ul>
          </div>
          
          <Link href="/" className="group flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--primary)] to-[var(--flame-red)] text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg shadow-[var(--primary)]/25 hover:shadow-[var(--primary)]/40 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto">
            Return to Homepage
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </main>
    </div>
  );
}
