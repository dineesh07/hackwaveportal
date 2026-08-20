"use client";

import React, { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 12000); // 12 seconds redirect

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <Navbar />
      <main className="container flex justify-center items-center py-24">
        <div className="max-w-[600px] bg-[var(--surface)] border border-[var(--line)] rounded-lg p-8 text-center flex flex-col items-center">
          <CheckCircle size={64} color="var(--success)" className="mb-6" />
          <h1 className="text-2xl font-bold display-title mb-4">Registration Submitted Successfully!</h1>
          
          <div className="bg-[var(--success)]/10 border border-[var(--success)] p-4 rounded-md mb-6 text-left w-full">
            <h3 className="font-bold text-[var(--success)] mb-2">Important Next Steps:</h3>
            <ul className="list-disc pl-5 opacity-90 space-y-2">
              <li>Your registration is currently <strong>pending review</strong> by the coordinator.</li>
              <li>Once approved, an account will be created for your team leader.</li>
              <li>Your username will be your <strong>Roll Number</strong>.</li>
              <li>Your default password will be set to <strong>12345</strong>.</li>
              <li><strong className="text-[var(--flame-red)]">You must change this password immediately upon your first login.</strong></li>
            </ul>
          </div>

          <p className="opacity-80 mb-6">
            You will be redirected to the homepage shortly...
          </p>
          
          <Button href="/" variant="primary">Return to Homepage</Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
