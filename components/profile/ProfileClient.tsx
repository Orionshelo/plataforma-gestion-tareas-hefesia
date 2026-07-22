'use client'

import { useState } from 'react'
import { updateUserProfile } from '@/actions/team'
import type { Profile } from '@/lib/types/database'
import { User, Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ProfileClientProps {
  profile: Profile
}

export function ProfileClient({ profile }: ProfileClientProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile.avatar_url || null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const fullName = formData.get('full_name') as string

    let avatar_url = profile.avatar_url

    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, { upsert: true })

      if (uploadError) {
        setError(`Error al subir la imagen: ${uploadError.message}`)
        setLoading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      avatar_url = publicUrl
    }

    const result = await updateUserProfile(profile.id, { full_name: fullName, avatar_url })

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
          <div style={{ position: 'relative' }}>
            <div 
              className="avatar avatar-lg" 
              style={{ 
                background: previewUrl ? 'transparent' : 'var(--accent-gradient)', 
                width: '80px', 
                height: '80px', 
                fontSize: '32px',
                backgroundImage: previewUrl ? `url(${previewUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {!previewUrl && getInitials(profile.full_name || profile.email)}
            </div>
            <label 
              htmlFor="avatar-upload" 
              className="btn btn-icon" 
              style={{ 
                position: 'absolute', 
                bottom: '-5px', 
                right: '-5px', 
                background: 'var(--bg-card)',
                boxShadow: 'var(--shadow-sm)',
                borderRadius: '50%',
                padding: '6px',
                cursor: 'pointer'
              }}
              title="Cambiar foto"
            >
              <Camera size={16} />
            </label>
            <input 
              id="avatar-upload" 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0]
                  setAvatarFile(file)
                  setPreviewUrl(URL.createObjectURL(file))
                }
              }}
            />
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
