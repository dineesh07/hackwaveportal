"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { CheckCircle } from "lucide-react";

export default function RegisterSuccessPage() {
  return (
    <>
      <Navbar />
      <main className="container flex justify-center items-center py-24">
        <div className="max-w-[650px] bg-[var(--surface)] border border-[var(--line)] rounded-lg p-8 text-center flex flex-col items-center">
          <CheckCircle size={64} color="var(--success)" className="mb-6" />
          <h1 className="text-2xl font-bold display-title mb-4">Registration Submitted!</h1>
          
          <div className="bg-[var(--success)]/10 border border-[var(--success)] p-6 rounded-md mb-8 text-left w-full space-y-4">
            <p>Your registration is currently <strong>pending review</strong> by the coordinator.</p>
            
            <p>Once approved, an individual account will be automatically created for <strong>every team member</strong> listed in your registration &mdash; including the team leader.</p>
            
            <div>
              <div>Username: <strong>Your Roll Number</strong></div>
              <div>Default Password: <strong>12345</strong></div>
            </div>
            
            <p className="text-[var(--flame-red)] font-semibold">
              Each member must log in separately using their own roll number, and will be required to change their password immediately on first login.
            </p>
          </div>
          
          <Button href="/" variant="primary">Return to Homepage</Button>
        </div>
      </main>
    </>
  );
}
