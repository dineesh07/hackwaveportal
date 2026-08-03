"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";
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

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setMembers([...members, { name: "", rollNo: "", phone: "" }]);
  };

  const removeMember = (index: number) => {
    const updated = [...members];
    updated.splice(index, 1);
    setMembers(updated);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.teamName.trim()) newErrors.teamName = "Team Name is required";
    if (!formData.leaderName.trim()) newErrors.leaderName = "Leader Name is required";
    if (!formData.leaderRollNo.trim()) newErrors.leaderRollNo = "Leader Roll No is required";
    if (!formData.leaderPhone.trim()) newErrors.leaderPhone = "Leader Phone is required";
    
    // Member validation
    members.forEach((m, i) => {
      if (!m.name.trim()) newErrors[`member_${i}_name`] = "Required";
      if (!m.rollNo.trim()) newErrors[`member_${i}_rollNo`] = "Required";
    });

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
      
      router.push("/register/success");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="container">
        <div className={styles.formContainer}>
          <h1 className={`${styles.title} display-title`}>Team Registration</h1>
          <p className={styles.subtitle}>Register your team for Phase 1 of HACKWAVE 2026.</p>
          
          {serverError && <div className={styles.formError}>{serverError}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className={styles.sectionTitle}>Team Details</div>
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
              <div className="text-xl font-bold">Team Members (Optional)</div>
              <Button type="button" variant="secondary" onClick={addMember} className="!py-1">+ Add Member</Button>
            </div>
            
            {members.map((member, index) => (
              <div key={index} className={styles.memberRow}>
                <button type="button" className={styles.removeBtn} onClick={() => removeMember(index)}>
                  <X size={20} />
                </button>
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
        </div>
      </main>
      <Footer />
    </>
  );
}
