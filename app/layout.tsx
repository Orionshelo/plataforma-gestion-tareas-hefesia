import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'HefesIA Tasks — Gestión de Proyectos',
  description: 'Plataforma de gestión de tareas y proyectos para el equipo de HefesIA Consultoría.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
