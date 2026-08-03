'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { approveTeam, rejectTeam } from './actions'

export default function RegistrationActions({ teamId }: { teamId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);

  const handleApprove = async () => {
    setLoading('approve');
    const res = await approveTeam(teamId);
    if (res?.error) alert(res.error);
    router.refresh();
    setLoading(null);
  }

  const handleReject = async () => {
    const reason = prompt('Reason for rejection:');
    if (reason === null) return; // cancelled
    setLoading('reject');
    const res = await rejectTeam(teamId, reason.trim());
    if (res?.error) alert(res.error);
    router.refresh();
    setLoading(null);
  }

  return (
    <div className="flex gap-2">
      <Button type="button" variant="success" size="sm" onClick={handleApprove} disabled={loading !== null}>
        {loading === 'approve' ? 'Approving...' : 'Approve'}
      </Button>
      <Button type="button" variant="danger" size="sm" onClick={handleReject} disabled={loading !== null}>
        {loading === 'reject' ? 'Rejecting...' : 'Reject'}
      </Button>
    </div>
  )
}
