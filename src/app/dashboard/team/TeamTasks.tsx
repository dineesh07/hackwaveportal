'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Tag } from '@/components/ui/Tag'
import { CheckCircle2, Circle } from 'lucide-react'
import styles from '../dashboard.module.css'

type TeamTask = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: Date | null;
};

export default function TeamTasks({ tasks }: { tasks: TeamTask[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const completeTask = async (taskId: string) => {
    setLoadingId(taskId);
    try {
      const res = await fetch(`/api/team/task/${taskId}`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update task.');
        return;
      }
      router.refresh();
    } catch {
      alert('Failed to update task.');
    }
    setLoadingId(null);
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {tasks.map(task => (
        <li key={task.id} className={styles.taskRow}>
          <div>
            <strong style={{ display: 'block' }}>{task.title}</strong>
            <div style={{ marginTop: '0.25rem', marginBottom: '0.25rem' }}>
              <Tag tone={task.priority === 'HIGH' ? 'danger' : task.priority === 'MEDIUM' ? 'gold' : 'neutral'}>{task.priority} Priority</Tag>
            </div>
            <span className={styles.muted}>{task.description}</span>
            {task.dueDate && (
              <div suppressHydrationWarning className={styles.muted} style={{ marginTop: '0.25rem', fontSize: '0.8125rem' }}>
                Due {new Date(task.dueDate).toLocaleDateString()}
              </div>
            )}

          </div>
          {task.status === 'COMPLETED' ? (
            <Tag tone="success"><CheckCircle2 size={13} /> Completed</Tag>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => completeTask(task.id)} disabled={loadingId === task.id}>
              <Circle size={13} /> {loadingId === task.id ? 'Updating...' : 'Mark Complete'}
            </Button>
          )}
        </li>
      ))}
    </ul>
  )
}
