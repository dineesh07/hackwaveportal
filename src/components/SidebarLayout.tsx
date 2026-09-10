'use client';

import React, { useState, useEffect } from 'react';
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
  Lightbulb,
  Menu,
  X
} from 'lucide-react';
import { signOut } from 'next-auth/react';

import { ForcePasswordChangeModal } from './ForcePasswordChangeModal';
import styles from './SidebarLayout.module.css';

type SidebarLayoutProps = {
  children: React.ReactNode;
  role?: string;
  userName: string;
  mustChangePassword?: boolean;
  rollNo?: string;
};

export function SidebarLayout({ children, role = '', userName, mustChangePassword, rollNo }: SidebarLayoutProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile drawer when pathname changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Prevent background body scrolling when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

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
      { label: 'Problem Statements', href: '/dashboard/mentor/problem-statements', icon: <Lightbulb size={20} /> },
      { label: 'Settings', href: '/dashboard/mentor/settings', icon: <Settings size={20} /> }
    ];
  } else if (role === 'JURY') {
    navItems = [
      { label: 'Dashboard', href: '/dashboard/jury', icon: <LayoutDashboard size={20} /> },
      { label: 'Projects', href: '/dashboard/jury/projects', icon: <ClipboardList size={20} /> },
      { label: 'Problem Statements', href: '/dashboard/jury/problem-statements', icon: <Lightbulb size={20} /> },
      { label: 'Settings', href: '/dashboard/jury/settings', icon: <Settings size={20} /> }
    ];
  } else if (role === 'COORDINATOR') {
    navItems = [
      { label: 'Dashboard', href: '/dashboard/coordinator', icon: <LayoutDashboard size={20} /> },
      { label: 'Registrations', href: '/dashboard/coordinator/registrations', icon: <ClipboardList size={20} /> },
      { label: 'Team Management', href: '/dashboard/coordinator/teams', icon: <Users size={20} /> },
      { label: 'Problem Statements', href: '/dashboard/coordinator/problem-statements', icon: <Lightbulb size={20} /> },
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
    <div className={styles.wrapper}>
      
      {mustChangePassword && <ForcePasswordChangeModal userName={userName} rollNo={rollNo} />}

      {/* Mobile Top Header */}
      <header className={styles.mobileHeader}>
        <div className={styles.mobileLogoArea}>
          <button 
            type="button"
            className={styles.mobileMenuButton}
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open Navigation Menu"
          >
            <Menu size={22} />
          </button>
          <img src="/logo.png" alt="Hackwave Logo" className={styles.mobileLogo} />
        </div>
        <div className={styles.mobileUserBadge}>
          {role.toLowerCase()}
        </div>
      </header>

      {/* Mobile Backdrop Overlay */}
      <div 
        className={`${styles.backdrop} ${isMobileOpen ? styles.backdropOpen : ''}`} 
        onClick={() => setIsMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar Navigation */}
      <aside className={`${styles.sidebar} ${isMobileOpen ? styles.sidebarOpen : ''}`}>
        {/* Logo / Brand Area */}
        <div className={styles.brandArea}>
          <img src="/logo.png" alt="Hackwave Logo" className={styles.brandLogo} />
          <button
            type="button"
            className={styles.closeMobileBtn}
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close Navigation Menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Nav Area */}
        <nav className={`no-scrollbar ${styles.navList}`}>
          {navItems.map((item) => {
            const isDashboardRoot = [
              '/dashboard/team',
              '/dashboard/mentor',
              '/dashboard/jury',
              '/dashboard/coordinator',
              '/dashboard/admin'
            ].includes(item.href);

            const isActive = isDashboardRoot
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={() => setIsMobileOpen(false)}
              >
                <div className={styles.navIcon}>{item.icon}</div>
                <span className={styles.navLabel}>{item.label}</span>
                {isActive && <span className={styles.navArrow}>&rarr;</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <UserCheck size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div className={styles.userText}>
              <span className={styles.userName}>{userName}</span>
              <span className={styles.userRole}>{role.toLowerCase()}</span>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className={styles.logoutBtn}
          >
            <LogOut size={16} style={{ flexShrink: 0 }} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={styles.mainArea}>
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
