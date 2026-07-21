import { LoginForm } from '@/components/auth/LoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar Sesión — HefesIA Tasks',
  description: 'Inicia sesión en la plataforma de gestión de tareas de HefesIA.',
}

export default function LoginPage() {
  return (
    <div className="auth-card">
      <div className="auth-logo">
        <img src="/Logo claro 1.png" alt="HefesIA Logo" style={{ maxWidth: '240px', margin: '0 auto 10px' }} />
        <p>Gestión de proyectos y tareas</p>
      </div>
      <LoginForm />
    </div>
  )
}
