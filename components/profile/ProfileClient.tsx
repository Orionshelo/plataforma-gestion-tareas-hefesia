'use client'

import { useState } from 'react'
import { updateUserFullName } from '@/actions/team'
import type { Profile } from '@/lib/types/database'
import { User } from 'lucide-react'

interface ProfileClientProps {
  profile: Profile
}

export function ProfileClient({ profile }: ProfileClientProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const fullName = formData.get('full_name') as string

    const result = await updateUserFullName(profile.id, fullName)

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess('Tu perfil ha sido actualizado exitosamente.')
    }
    setLoading(false)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Mi Perfil</h1>
          <p className="page-subtitle">Gestiona tu información personal</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', marginTop: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
          <div className="avatar avatar-lg" style={{ background: 'var(--accent-gradient)', width: '80px', height: '80px', fontSize: '32px' }}>
            {getInitials(profile.full_name || profile.email)}
          </div>
          <div>
            <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 'bold' }}>{profile.full_name || 'Sin nombre'}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{profile.role === 'admin' ? 'Administrador' : 'Miembro'}</p>
          </div>
        </div>

        {error && <div className="auth-error" style={{ marginBottom: 'var(--space-md)' }}>{error}</div>}
        {success && (
          <div style={{ padding: 'var(--space-sm) var(--space-md)', background: 'var(--success-bg)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--radius-md)', color: 'var(--success)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-md)' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
            <label className="form-label" htmlFor="full_name">Nombre completo</label>
            <input 
              id="full_name" 
              name="full_name" 
              className="input" 
              defaultValue={profile.full_name || ''} 
              required 
            />
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-xl)' }}>
            <label className="form-label">Correo electrónico</label>
            <input 
              className="input" 
              defaultValue={profile.email} 
              disabled 
              style={{ opacity: 0.7 }}
            />
            <small style={{ color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
              Para cambiar tu correo electrónico, contacta al administrador.
            </small>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Guardando...</>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
