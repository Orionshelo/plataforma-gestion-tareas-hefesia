'use client'

import { usePathname } from 'next/navigation'
import { logout } from '@/actions/auth'
import type { Profile } from '@/lib/types/database'

interface NavbarProps {
  profile: Profile
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/projects': 'Proyectos',
  '/tasks': 'Mis Tareas',
  '/team': 'Equipo',
}

export function Navbar({ profile }: NavbarProps) {
  const pathname = usePathname()

  const getTitle = () => {
    // Check exact matches first
    if (pageTitles[pathname]) return pageTitles[pathname]
    // Check prefix matches
    if (pathname.startsWith('/projects/new')) return 'Nuevo Proyecto'
    if (pathname.startsWith('/projects/')) return 'Detalle del Proyecto'
    if (pathname.startsWith('/tasks/')) return 'Detalle de Tarea'
    return 'HefesIA Tasks'
  }

  const toggleMobileMenu = () => {
    const sidebar = document.getElementById('sidebar')
    const overlay = document.getElementById('sidebar-overlay')
    sidebar?.classList.toggle('open')
    overlay?.classList.toggle('visible')
  }

  return (
    <>
      <div id="sidebar-overlay" className="sidebar-overlay" onClick={toggleMobileMenu} />
      <header className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Menú">
            ☰
          </button>
          <h2 className="navbar-title">{getTitle()}</h2>
        </div>

        <div className="navbar-actions">
          <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
            {profile.full_name || profile.email}
          </span>
          <form action={logout}>
            <button type="submit" className="btn btn-ghost btn-sm">
              Salir
            </button>
          </form>
        </div>
      </header>
    </>
  )
}
