"use client"
import React, { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import styles from './page.module.css'

export default function LoginPage() {
  const [rollNo, setRollNo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!rollNo || !password) {
      setError('Please fill in both fields')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await signIn('credentials', { 
        rollNo, 
        password, 
        redirect: false 
      })

      if (res?.error) {
        setError('Invalid Roll Number or Password')
      } else {
        const session = await getSession();
        if (session?.user?.role === 'COORDINATOR') {
          window.location.href = '/dashboard/coordinator';
        } else if (session?.user?.role === 'TEAM') {
          window.location.href = '/dashboard/team';
        } else if (session?.user?.role === 'MENTOR') {
          window.location.href = '/dashboard/mentor';
        } else if (session?.user?.role === 'JURY') {
          window.location.href = '/dashboard/jury';
        } else {
          window.location.href = '/';
        }
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="hero-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '2rem', position: 'relative', zIndex: 50 }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#000000', textDecoration: 'none', fontWeight: 600 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to Home
        </Link>
      </div>
      <div className="container" style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className={styles.loginContainer} style={{ marginTop: '-4rem' }}>
          <h1 className={`${styles.title} display-title`}>Welcome Back</h1>
            <p className={styles.subtitle}>Sign in to your HACKWAVE 2026 Portal</p>
            
            {error && <div role="alert" className={styles.errorText}>{error}</div>}
            
            <form onSubmit={handleLogin}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Roll Number / Username</label>
                <input 
                  type="text"
                  placeholder="Enter your Roll No" 
                  value={rollNo} 
                  onChange={(e) => setRollNo(e.target.value)} 
                  className={styles.input}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Password</label>
                <input 
                  type="password"
                  placeholder="Enter your Password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className={styles.input}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className={styles.actions}>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Authenticating...' : 'Sign In'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
  )
}
