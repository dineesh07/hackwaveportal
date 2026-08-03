'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Lock, AlertCircle } from 'lucide-react';
import { signIn } from 'next-auth/react';

type ForcePasswordChangeModalProps = {
  userName: string;
  rollNo?: string;
};

export function ForcePasswordChangeModal({ userName, rollNo }: ForcePasswordChangeModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update password');
      }

      // Re-authenticate silently to update the JWT and clear the `mustChangePassword` flag
      if (rollNo) {
        await signIn('credentials', {
          rollNo,
          password,
          redirect: false,
        });
      }

      // Force a full refresh to get the updated session token
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      zIndex: 9999, // Super high z-index to cover everything including sidebar
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '3rem',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        width: '100%',
        maxWidth: '480px',
        border: '1px solid var(--line)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ 
            background: 'rgba(249, 115, 22, 0.1)', 
            padding: '1rem', 
            borderRadius: '50%',
            color: 'var(--flame-orange)'
          }}>
            <Lock size={32} />
          </div>
        </div>
        
        <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--ink)' }}>
          Action Required
        </h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem', lineHeight: 1.6 }}>
          Hello <strong>{userName}</strong>, for security reasons you must change your default password before accessing your dashboard.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && (
            <div role="alert" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: 'var(--danger)', 
              padding: '0.75rem 1rem', 
              borderRadius: '8px', 
              fontSize: '0.875rem' 
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)' }}>New Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--line)',
                outline: 'none',
                fontSize: '1rem'
              }}
              placeholder="Enter new password"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)' }}>Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--line)',
                outline: 'none',
                fontSize: '1rem'
              }}
              placeholder="Confirm new password"
            />
          </div>

          <Button type="submit" disabled={loading} style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
            {loading ? 'Updating...' : 'Update Password & Continue'}
          </Button>
        </form>
      </div>
    </div>
  );
}
