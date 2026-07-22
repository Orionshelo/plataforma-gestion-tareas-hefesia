'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Profile } from '@/lib/types/database'
import { LayoutDashboard, FolderKanban, CheckSquare, Users, User } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface SidebarProps {
  profile: Profile
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { href: '/projects', label: 'Proyectos', icon: <FolderKanban size={20} /> },
    { href: '/tasks', label: 'Mis Tareas', icon: <CheckSquare size={20} /> },
    { href: '/profile', label: 'Mi Perfil', icon: <User size={20} /> },
  ]

  const adminItems = [
    { href: '/team', label: 'Equipo', icon: <Users size={20} /> },
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
            {mounted && (
              <img 
                src={resolvedTheme === 'light' ? '/Logo oscuro 1.png' : '/Logo claro 1.png'} 
                alt="HefesIA Logo" 
                style={{ maxHeight: '36px', width: 'auto' }} 
              />
            )}
            {!mounted && <div style={{ height: '36px' }} />}
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
