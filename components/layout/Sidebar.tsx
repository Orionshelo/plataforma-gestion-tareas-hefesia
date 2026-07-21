'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Profile } from '@/lib/types/database'

interface SidebarProps {
  profile: Profile
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/projects', label: 'Proyectos', icon: '📁' },
    { href: '/tasks', label: 'Mis Tareas', icon: '✅' },
  ]

  const adminItems = [
    { href: '/team', label: 'Equipo', icon: '👥' },
  ]

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || '?'
  }

  return (
    <>
      <aside className="sidebar" id="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img src="/Logo claro 1.png" alt="HefesIA Logo" style={{ maxHeight: '36px', width: 'auto' }} />
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Menú</div>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href || pathname.startsWith(item.href + '/') ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          {profile.role === 'admin' && (
            <>
              <div className="sidebar-section-label">Administración</div>
              {adminItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div
              className="avatar"
              style={{ background: 'var(--accent-gradient)' }}
            >
              {getInitials(profile.full_name || profile.email)}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">
                {profile.full_name || 'Usuario'}
              </div>
              <div className="sidebar-user-role">{profile.role}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
