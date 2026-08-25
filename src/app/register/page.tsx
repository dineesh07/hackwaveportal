"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { X, CheckCircle, Info } from "lucide-react";
import styles from "./page.module.css";

interface TeamMember {
  name: string;
  rollNo: string;
  phone: string;
}

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    teamName: "",
    leaderName: "",
    leaderRollNo: "",
    leaderPhone: "",
    leaderEmail: "",
    department: "CT - PG",
  });

  const [members, setMembers] = useState<TeamMember[]>([{ name: "", rollNo: "", phone: "" }]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const addMember = () => {
    if (members.length < 3) {
      setMembers([...members, { name: "", rollNo: "", phone: "" }]);
    }
  };

  const removeMember = (index: number) => {
    if (members.length > 1) {
      const updated = [...members];
      updated.splice(index, 1);
      setMembers(updated);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.teamName.trim()) newErrors.teamName = "Team Name is required";
    if (!formData.leaderName.trim()) newErrors.leaderName = "Leader Name is required";
    if (!formData.leaderRollNo.trim()) newErrors.leaderRollNo = "Leader Roll No is required";
    if (!formData.leaderPhone.trim()) newErrors.leaderPhone = "Leader Phone is required";
    
    // Member validation
    const seenRolls = new Set<string>();
    if (formData.leaderRollNo.trim()) {
      seenRolls.add(formData.leaderRollNo.trim().toUpperCase());
    }

    members.forEach((m, i) => {
      if (!m.name.trim()) newErrors[`member_${i}_name`] = "Required";
      if (!m.rollNo.trim()) {
        newErrors[`member_${i}_rollNo`] = "Required";
      } else {
        const rollUpper = m.rollNo.trim().toUpperCase();
        if (seenRolls.has(rollUpper)) {
          newErrors[`member_${i}_rollNo`] = "Duplicate Roll No";
          newErrors.general = `Roll number "${m.rollNo.trim()}" is duplicated in this team.`;
        } else {
          seenRolls.add(rollUpper);
        }
      }
    });

    const totalMembers = 1 + members.length;
    if (totalMembers < 2) newErrors.general = "A team must have at least 2 members.";
    if (totalMembers > 4) newErrors.general = "A team can have a maximum of 4 members.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, members })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }
      
      setIsSuccess(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.splitLayout}>
      {/* Left Pane: Gradient + Mascot */}
      <div className={styles.leftPane}>
        <div className={styles.leftContent}>
          <Image 
            src="/registerMascot.png" 
            alt="Register Mascot" 
            width={1125} 
            height={1125} 
            className={styles.mascot}
            priority
          />
        </div>
      </div>

      {/* Right Pane: Registration Form */}
      <div className={styles.rightPane}>
        <div className={styles.backLinkContainer}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#111827', textDecoration: 'none', fontWeight: 600 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Home
          </Link>
        </div>

        <div className={styles.formWrapper}>
          <div className={styles.formContainer}>
            {isSuccess ? (
              <div style={{ textAlign: 'center' }}>
                <div className={styles.successIconWrapper}>
                  <CheckCircle size={56} color="var(--success)" />
                </div>
                <h1 className={`${styles.successTitle} display-title`}>Registration Submitted!</h1>
                
                <p className={styles.subtitle} style={{ textAlign: 'center' }}>
                  Your team has successfully registered for HACKWAVE 2026.
                </p>

                {/* WhatsApp Group Invitation */}
                <div className={styles.whatsappCard}>
                  <div className={styles.whatsappHeader}>
                    <div className={styles.whatsappIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.06-2.123-.532-1.827-.757-3.003-2.618-3.094-2.74-.092-.121-.741-.987-.741-1.884 0-.898.468-1.339.635-1.522.167-.183.366-.228.488-.228.122 0 .244.002.35.007.112.006.262-.043.41.312.155.373.53 1.294.577 1.387.047.094.078.203.016.326-.062.122-.093.199-.186.307-.093.109-.196.244-.28.327-.094.093-.191.196-.083.382.108.187.481.794 1.033 1.285.711.633 1.31.83 1.498.923.187.093.296.078.405-.047.109-.125.467-.544.592-.731.125-.187.25-.156.421-.093.171.062 1.09.514 1.277.607.187.094.312.14.358.219.046.078.046.452-.098.857zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.176L2 22l4.981-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className={styles.whatsappTitle}>Join Official WhatsApp Group</h3>
                      <p className={styles.whatsappText}>All team members must join the official WhatsApp group for important announcements, schedule alerts, and mentor connect.</p>
                    </div>
                  </div>
                  <a
                    href="https://chat.whatsapp.com/LiQhKZYFOK63Td2UsWNeqP"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.whatsappButton}
                  >
                    Join WhatsApp Group →
                  </a>
                </div>
                
                <div className={styles.infoBox}>
                  <div className={styles.infoTitle}>
                    <Info size={24} color="var(--flame-red)" />
                    Important Next Steps
                  </div>
                  
                  <ul className={styles.infoList}>
                    <li>
                      <div className={styles.bullet}></div>
                      <div>Your registration is currently <strong>pending review</strong> by the coordinator.</div>
                    </li>
                    <li>
                      <div className={styles.bullet}></div>
                      <div>Once approved, an individual account will be automatically created for <strong>every team member</strong> listed in your registration &mdash; including the team leader.</div>
                    </li>
                    <li>
                      <div className={styles.bullet}></div>
                      <div>
                        Username: <strong>Your Roll Number</strong><br />
                        Default Password: <code className={styles.codeBlock}>12345</code>
                      </div>
                    </li>
                  </ul>
                  
                  <div className={styles.warningText}>
                    Each member must log in separately using their own roll number, and will be required to change their password immediately on first login.
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Button onClick={() => window.location.href = "/"} variant="primary">Return to Homepage</Button>
                </div>
              </div>
            ) : (
              <>
                <h1 className={styles.title}>Team Registration</h1>
                
                {serverError && <div className={styles.formError}>{serverError}</div>}
                {errors.general && <div className={styles.formError}>{errors.general}</div>}
                
                <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Team Name <span className={styles.required}>*</span></label>
              <input 
                type="text" 
                name="teamName" 
                value={formData.teamName} 
                onChange={handleInputChange} 
                className={`${styles.input} ${errors.teamName ? styles.inputError : ''}`} 
              />
              {errors.teamName && <span role="alert" className={styles.errorText}>{errors.teamName}</span>}
            </div>

            <div className={styles.sectionTitle}>Leader Information</div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={styles.formGroup}>
                <label className={styles.label}>Leader Name <span className={styles.required}>*</span></label>
                <input 
                  type="text" 
                  name="leaderName" 
                  value={formData.leaderName} 
                  onChange={handleInputChange} 
                  className={`${styles.input} ${errors.leaderName ? styles.inputError : ''}`} 
                />
                {errors.leaderName && <span role="alert" className={styles.errorText}>{errors.leaderName}</span>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Leader Roll No (Username) <span className={styles.required}>*</span></label>
                <input 
                  type="text" 
                  name="leaderRollNo" 
                  value={formData.leaderRollNo} 
                  onChange={handleInputChange} 
                  className={`${styles.input} ${errors.leaderRollNo ? styles.inputError : ''}`} 
                />
                {errors.leaderRollNo && <span role="alert" className={styles.errorText}>{errors.leaderRollNo}</span>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Phone Number <span className={styles.required}>*</span></label>
                <input 
                  type="tel" 
                  name="leaderPhone" 
                  value={formData.leaderPhone} 
                  onChange={handleInputChange} 
                  className={`${styles.input} ${errors.leaderPhone ? styles.inputError : ''}`} 
                />
                {errors.leaderPhone && <span role="alert" className={styles.errorText}>{errors.leaderPhone}</span>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input 
                  type="email" 
                  name="leaderEmail" 
                  value={formData.leaderEmail} 
                  onChange={handleInputChange} 
                  className={styles.input} 
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Department <span className={styles.required}>*</span></label>
              <input 
                type="text" 
                name="department" 
                value={formData.department} 
                disabled 
                className={styles.input} 
              />
            </div>

            <div className="flex justify-between items-center mb-4 mt-8 border-b border-[var(--line)] pb-2">
              <div className="text-xl font-bold">Additional Team Members</div>
              {members.length < 3 && (
                <Button type="button" variant="secondary" onClick={addMember} className="!py-1">+ Add Member</Button>
              )}
            </div>
            
            {members.map((member, index) => (
              <div key={index} className={styles.memberRow}>
                {members.length > 1 && (
                  <button type="button" className={styles.removeBtn} onClick={() => removeMember(index)}>
                    <X size={20} />
                  </button>
                )}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Member Name <span className={styles.required}>*</span></label>
                  <input 
                    type="text" 
                    value={member.name} 
                    onChange={e => handleMemberChange(index, "name", e.target.value)} 
                    className={`${styles.input} ${errors[`member_${index}_name`] ? styles.inputError : ''}`} 
                  />
                  {errors[`member_${index}_name`] && <span role="alert" className={styles.errorText}>{errors[`member_${index}_name`]}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Roll No <span className={styles.required}>*</span></label>
                  <input 
                    type="text" 
                    value={member.rollNo} 
                    onChange={e => handleMemberChange(index, "rollNo", e.target.value)} 
                    className={`${styles.input} ${errors[`member_${index}_rollNo`] ? styles.inputError : ''}`} 
                  />
                  {errors[`member_${index}_rollNo`] && <span role="alert" className={styles.errorText}>{errors[`member_${index}_rollNo`]}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Phone Number</label>
                  <input 
                    type="tel" 
                    value={member.phone} 
                    onChange={e => handleMemberChange(index, "phone", e.target.value)} 
                    className={styles.input} 
                  />
                </div>
              </div>
            ))}

            <div className={styles.actions}>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Registration"}
              </Button>
            </div>
          </form>
          </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
