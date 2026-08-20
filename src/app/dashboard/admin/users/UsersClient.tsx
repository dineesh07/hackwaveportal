'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { Field, Input, Select } from '@/components/ui/FormControls'
import { UserRound, UserCog, ShieldOff, RotateCcw, Trash2, ShieldCheck } from 'lucide-react'
import styles from '../../dashboard.module.css'

const ROLE_OPTIONS = [
  { value: 'TEAM', label: 'Team Leader' },
  { value: 'MENTOR', label: 'Mentor' },
  { value: 'JURY', label: 'Jury' },
  { value: 'COORDINATOR', label: 'Staff Coordinator' },
  { value: 'ADMIN', label: 'Administrator' },
];

type WorkspaceUser = {
  id: string;
  name: string;
  rollNo: string;
  email: string | null;
  role: string;
  status: string;
  organization: string | null;
  mustChangePassword: boolean;
  createdAt: Date;
};

export default function UsersClient({ users }: { users: WorkspaceUser[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', rollNo: '', password: '', role: 'MENTOR', organization: '' });

  const createUser = async () => {
    if (!newUser.name || !newUser.rollNo || !newUser.password) return alert("Name, roll number, and password required.");
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE', ...newUser })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to create user.");
        return;
      }
      setNewUser({ name: '', email: '', rollNo: '', password: '', role: 'MENTOR', organization: '' });
      router.refresh();
      alert("User created.");
    } catch {
      alert("Failed to create user.");
    }
    setIsSubmitting(false);
  }

  const sendAction = async (action: string, payload: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || `Action failed.`);
        return;
      }
      router.refresh();
    } catch {
      alert(`Action failed.`);
    }
    setIsSubmitting(false);
  }

  const updateUserRole = (userId: string, role: string) => sendAction('UPDATE_ROLE', { userId, role });
  const updateUserStatus = (userId: string, status: string) => sendAction('UPDATE_STATUS', { userId, status });
  const resetPassword = (userId: string) => {
    if (!confirm("Reset this user's password to the default (12345)?")) return;
    sendAction('RESET_PASSWORD', { userId });
  }
  const deleteUser = (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    sendAction('DELETE', { userId });
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '2rem', alignItems: 'start' }}>
      <Card style={{ padding: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <UserCog size={18} style={{ color: 'var(--flame-red)' }} /> Create User
        </h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Field label="Name" required>
            <Input value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
          </Field>
          <Field label="Roll Number (Username)" required>
            <Input value={newUser.rollNo} onChange={e => setNewUser({...newUser, rollNo: e.target.value})} />
          </Field>
          <Field label="Email">
            <Input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
          </Field>
          <Field label="Password" required helper="Defaults to 12345 if left blank">
            <Input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
          </Field>
          <Field label="Role">
            <Select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
              {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </Select>
          </Field>
          <Field label="Organization / Department (Optional)">
            <Input value={newUser.organization} onChange={e => setNewUser({...newUser, organization: e.target.value})} />
          </Field>
          <Button onClick={createUser} disabled={isSubmitting}>
            <UserRound size={16} /> Create User
          </Button>
        </div>
      </Card>

      <div style={{ minWidth: 0, overflowX: 'auto', paddingBottom: '1rem' }}>
        <div className={styles.tableContainer} style={{ marginBottom: 0 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>User</th>
                <th className={styles.th}>Roll No</th>
                <th className={styles.th}>Role</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Created</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={styles.tr}>
                  <td className={styles.td}>
                    <strong>{u.name}</strong>
                    {u.organization && <div className={styles.muted}>{u.organization}</div>}
                    {u.mustChangePassword && <div className={styles.muted} style={{ color: 'var(--flame-gold)', fontWeight: 600 }}>Must change password</div>}
                  </td>
                  <td className={styles.td}>{u.rollNo}</td>
                  <td className={styles.td}>
                    <Select
                      value={u.role}
                      onChange={(e) => updateUserRole(u.id, e.target.value)}
                      disabled={isSubmitting}
                      style={{ padding: '0.35rem 0.5rem', fontSize: '0.8125rem', width: 'auto' }}
                    >
                      {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.value}</option>)}
                    </Select>
                  </td>
                  <td className={styles.td}>
                    <Tag tone={u.status === 'ACTIVE' ? 'success' : u.status === 'LOCKED' ? 'danger' : 'neutral'}>{u.status}</Tag>
                  </td>
                  <td className={styles.td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className={styles.td}>
                    <div className={styles.actionCell} style={{ flexWrap: 'wrap' }}>
                      <Button
                        size="sm"
                        variant={u.status === 'ACTIVE' ? 'ghost' : 'success'}
                        onClick={() => updateUserStatus(u.id, u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                        disabled={isSubmitting}
                      >
                        {u.status === 'ACTIVE' ? <><ShieldOff size={13} /> Deactivate</> : <><ShieldCheck size={13} /> Activate</>}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => resetPassword(u.id)} disabled={isSubmitting}>
                        <RotateCcw size={13} /> Reset
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => deleteUser(u.id)} disabled={isSubmitting}>
                        <Trash2 size={13} /> Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}