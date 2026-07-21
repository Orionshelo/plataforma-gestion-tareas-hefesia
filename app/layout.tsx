import type { Metadata } from 'next'
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
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
