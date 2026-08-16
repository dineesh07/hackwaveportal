'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Award,
  Activity,
  CheckSquare,
  ClipboardList,
  Scale,
  UserCheck,
  Target,
  FileText,
  Lightbulb
} from 'lucide-react';
import { signOut } from 'next-auth/react';

import { ForcePasswordChangeModal } from './ForcePasswordChangeModal';

type SidebarLayoutProps = {
  children: React.ReactNode;
  role?: string;
  userName: string;
  mustChangePassword?: boolean;
  rollNo?: string;
};

export function SidebarLayout({ children, role = '', userName, mustChangePassword, rollNo }: SidebarLayoutProps) {
  const pathname = usePathname();

  // Define navigation based on role
  let navItems: { label: string; href: string; icon: React.ReactNode }[] = [];
  
  if (role === 'TEAM') {
    navItems = [
      { label: 'Dashboard', href: '/dashboard/team', icon: <LayoutDashboard size={20} /> },
      { label: 'Submission', href: '/dashboard/team/submission', icon: <FileText size={20} /> },
      { label: 'My Team', href: '/dashboard/team/my-team', icon: <Users size={20} /> },
      { label: 'Problem Statements', href: '/dashboard/team/problem-statements', icon: <Lightbulb size={20} /> },
      { label: 'Mentor Tasks', href: '/dashboard/team/tasks', icon: <ClipboardList size={20} /> },
      { label: 'Settings', href: '/dashboard/team/settings', icon: <Settings size={20} /> }
    ];
  } else if (role === 'MENTOR') {
    navItems = [
      { label: 'Dashboard', href: '/dashboard/mentor', icon: <LayoutDashboard size={20} /> },
      { label: 'Settings', href: '/dashboard/mentor/settings', icon: <Settings size={20} /> }
    ];
  } else if (role === 'JURY') {
    navItems = [
      { label: 'Dashboard', href: '/dashboard/jury', icon: <LayoutDashboard size={20} /> },
      { label: 'Settings', href: '/dashboard/jury/settings', icon: <Settings size={20} /> }
    ];
  } else if (role === 'COORDINATOR') {
    navItems = [
      { label: 'Dashboard', href: '/dashboard/coordinator', icon: <LayoutDashboard size={20} /> },
      { label: 'Registrations', href: '/dashboard/coordinator/registrations', icon: <ClipboardList size={20} /> },
      { label: 'Team Management', href: '/dashboard/coordinator/teams', icon: <Users size={20} /> },
      { label: 'Mentor Mapping', href: '/dashboard/coordinator/mentors', icon: <UserCheck size={20} /> },
      { label: 'Jury Mapping', href: '/dashboard/coordinator/jury', icon: <Scale size={20} /> },
      { label: 'Monitoring', href: '/dashboard/coordinator/monitoring', icon: <Activity size={20} /> },
      { label: 'Tasks Monitoring', href: '/dashboard/coordinator/tasks', icon: <CheckSquare size={20} /> },
      { label: 'Leaderboard & Results', href: '/dashboard/coordinator/results', icon: <Target size={20} /> },
      { label: 'Awards Management', href: '/dashboard/coordinator/awards', icon: <Award size={20} /> },
      { label: 'Settings', href: '/dashboard/coordinator/settings', icon: <Settings size={20} /> }
    ];
  } else if (role === 'ADMIN') {
    navItems = [
      { label: 'Dashboard', href: '/dashboard/admin', icon: <LayoutDashboard size={20} /> },
      { label: 'User Management', href: '/dashboard/admin/users', icon: <Users size={20} /> },
      { label: 'Audit Logs', href: '/dashboard/admin/audit', icon: <ClipboardList size={20} /> },
      { label: 'Settings', href: '/dashboard/admin/settings', icon: <Settings size={20} /> }
    ];
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      
      {mustChangePassword && <ForcePasswordChangeModal userName={userName} rollNo={rollNo} />}

      {/* Sidebar */}
      <aside style={{
        width: '260px',
        backgroundColor: 'var(--sidebar-bg)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100
      }}>
        {/* Logo / Brand Area */}
        <div style={{ height: '80px', flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <img src="/logo.png" alt="Hackwave Logo" style={{ height: '48px', width: 'auto', objectFit: 'contain' }} />
        </div>

        {/* Scrollable Nav Area */}
        <nav className="no-scrollbar" style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
                borderRadius: '8px',
                backgroundColor: isActive ? 'var(--sidebar-active)' : 'transparent',
                color: isActive ? '#ffffff' : 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 500,
                transition: 'background-color 0.2s, color 0.2s'
              }}>
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{item.icon}</div>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                {isActive && <span style={{ marginLeft: 'auto', flexShrink: 0 }}>&rarr;</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer Area (always at bottom) */}
        <div style={{ flexShrink: 0, padding: '1.25rem 1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem', padding: '0 0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
            <UserCheck size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ color: '#ffffff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</span>
              <span style={{ fontSize: '0.75rem', textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{role.toLowerCase()}</span>
            </div>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'background-color 0.2s'
            }}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column' }}>
        


        {/* Page Content */}
        <main style={{ padding: '2rem', backgroundColor: '#ffffff', flex: 1 }}>
          {children}
        </main>

      </div>
    </div>
  );
}
