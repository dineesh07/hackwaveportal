import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { CheckCircle } from "lucide-react";

export default function RegisterSuccessPage() {
  return (
    <>
      <Navbar />
      <main className="container flex justify-center items-center py-24">
        <div className="max-w-[600px] bg-[var(--surface)] border border-[var(--line)] rounded-lg p-8 text-center flex flex-col items-center">
          <CheckCircle size={64} color="var(--success)" className="mb-6" />
          <h1 className="text-2xl font-bold display-title mb-4">Registration Received!</h1>
          <p className="opacity-80 mb-6">
            Thanks for registering your team for HACKWAVE 2026. Your registration will be reviewed by the organizing committee. Once verified, your team will receive login access using your <strong>Roll Number</strong> as the username.
          </p>
          <div className="bg-[var(--paper)] border border-[var(--line)] p-4 rounded-md mb-8 text-sm text-left">
            <span className="font-bold text-[var(--flame-red)]">What happens next?</span>
            <p className="mt-2 opacity-80">
              Project submission opens once Phase 1 begins. Keep an eye on the portal for the submission start date. Start brainstorming your ideas!
            </p>
          </div>
          <Button href="/" variant="primary">Return to Homepage</Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
