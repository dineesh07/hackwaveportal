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
      router.push("/login");
    }, 8000); // 8 seconds redirect

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <Navbar />
      <main className="container flex justify-center items-center py-24">
        <div className="max-w-[600px] bg-[var(--surface)] border border-[var(--line)] rounded-lg p-8 text-center flex flex-col items-center">
          <CheckCircle size={64} color="var(--success)" className="mb-6" />
          <h1 className="text-2xl font-bold display-title mb-4">Registration Successful!</h1>
          
          <div className="bg-[var(--success)]/10 border border-[var(--success)] p-4 rounded-md mb-6 text-left w-full">
            <h3 className="font-bold text-[var(--success)] mb-2">Important Next Steps:</h3>
            <ul className="list-disc pl-5 opacity-90 space-y-2">
              <li>An account has been created for your team leader.</li>
              <li>Your username is your <strong>Roll Number</strong>.</li>
              <li>Your default password is set to <strong>12345</strong>.</li>
              <li><strong className="text-[var(--flame-red)]">You must change this password immediately upon your first login.</strong></li>
            </ul>
          </div>

          <p className="opacity-80 mb-6">
            You will be redirected to the sign-in page shortly...
          </p>
          
          <Button href="/login" variant="primary">Go to Sign In</Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
