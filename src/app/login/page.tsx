"use client"
import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
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
        redirect: false // We handle redirect manually to check for errors
      })

      if (res?.error) {
        setError('Invalid Roll Number or Password')
      } else {
        window.location.href = '/login' // Middleware will intercept and redirect to correct dashboard
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="hero-bg" style={{ minHeight: 'calc(100vh - 140px)' }}>
        <div className="container">
          <div className={styles.loginContainer}>
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
      <Footer />
    </>
  )
}
