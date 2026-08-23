"use client"
import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
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
        // Let the middleware handle role-based routing by refreshing the login page with the new session cookie
        window.location.href = '/login';
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className={styles.splitLayout}>
      {/* Left Pane: Gradient + Mascot */}
      <div className={styles.leftPane}>
        <div className={styles.leftContent}>
          <Image 
            src="/signinMascot.png" 
            alt="Sign In Mascot" 
            width={1688} 
            height={1688} 
            className={styles.mascot}
            priority
          />
        </div>
      </div>

      {/* Right Pane: Login Form */}
      <div className={styles.rightPane}>
        <div className={styles.backLinkContainer}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#111827', textDecoration: 'none', fontWeight: 600 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Home
          </Link>
        </div>

        <div className={styles.formWrapper}>
          <div className={styles.loginContainer}>
            <h1 className={styles.title}>Login</h1>
            <p className={styles.subtitle}>Log in to access your dashboard</p>
            
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
                <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Authenticating...' : 'Sign In'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
