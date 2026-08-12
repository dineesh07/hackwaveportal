import React from 'react'
import { auth } from '@/auth'
import { SidebarLayout } from '@/components/SidebarLayout'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  return (
    <SidebarLayout 
      role={session.user.role} 
      userName={session.user.name || 'User'} 
      mustChangePassword={session.user.mustChangePassword} 
      rollNo={session.user.rollNo}
    >
      {children}
    </SidebarLayout>
  )
}
