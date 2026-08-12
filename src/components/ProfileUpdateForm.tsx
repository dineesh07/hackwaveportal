'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { updateProfileName } from '@/app/dashboard/coordinator/settings/actions';

export function ProfileUpdateForm({ currentName }: { currentName: string }) {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await updateProfileName(name);
      if (res?.error) {
        throw new Error(res.error);
      }
      setSuccess('Profile name updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: '2rem',
      borderRadius: '12px',
      border: '1px solid var(--line)',
      maxWidth: '480px',
      marginBottom: '2rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ 
          background: 'rgba(232, 40, 63, 0.1)', 
          padding: '0.75rem', 
          borderRadius: '8px',
          color: 'var(--flame-red)'
        }}>
          <User size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Profile Details</h2>
          <p style={{ color: '#666', fontSize: '0.875rem', margin: 0 }}>Update your public display name</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem' }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        {success && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem' }}>
            <CheckCircle2 size={16} />
            {success}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)' }}>Display Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--line)', outline: 'none', fontSize: '1rem' }}
            placeholder="Enter your name"
          />
        </div>

        <Button type="submit" disabled={loading || name === currentName} style={{ width: '100%', marginTop: '0.5rem' }}>
          {loading ? 'Updating...' : 'Update Profile'}
        </Button>
      </form>
    </div>
  );
}
