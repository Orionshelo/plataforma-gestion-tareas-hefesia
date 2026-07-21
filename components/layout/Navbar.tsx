'use client'

import { usePathname } from 'next/navigation'
import { logout } from '@/actions/auth'
import type { Profile } from '@/lib/types/database'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun, Menu, LogOut } from 'lucide-react'

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
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

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
            <Menu size={24} />
          </button>
          <h2 className="navbar-title">{getTitle()}</h2>
        </div>

        <div className="navbar-actions">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="btn btn-ghost btn-icon"
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}
          
          <span style={{ fontSize: 'var(--font-sm)' }} className="hidden sm:inline">
            {profile.full_name || profile.email}
          </span>
          <form action={logout}>
            <button type="submit" className="btn btn-ghost btn-icon" aria-label="Salir">
              <LogOut size={18} />
            </button>
          </form>
        </div>
      </header>
    </>
  )
}
