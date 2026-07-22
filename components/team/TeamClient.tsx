'use client'

import { useState } from 'react'
import { inviteUser, updateUserRole, updateUserFullName } from '@/actions/team'
import { formatDateTime } from '@/lib/utils/dates'
import type { Profile } from '@/lib/types/database'
import { Edit2 } from 'lucide-react'

interface TeamClientProps {
  members: Profile[]
  currentUserId: string
}

export function TeamClient({ members, currentUserId }: TeamClientProps) {
  const [showInvite, setShowInvite] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [updatingRole, setUpdatingRole] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<Profile | null>(null)

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'
  }

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const result = await inviteUser(formData)

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess('Usuario creado exitosamente.')
      setShowInvite(false)
      ;(e.target as HTMLFormElement).reset()
    }
    setLoading(false)
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingRole(userId)
    const result = await updateUserRole(userId, newRole)
    if (result?.error) {
      setError(result.error)
    }
    setUpdatingRole(null)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingUser) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const fullName = formData.get('full_name') as string

    const result = await updateUserFullName(editingUser.id, fullName)

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess('Perfil actualizado exitosamente.')
      setEditingUser(null)
    }
    setLoading(false)
  }

  const avatarColors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f97316', '#22c55e', '#06b6d4', '#3b82f6',
  ]

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Equipo</h1>
          <p className="page-subtitle">{members.length} miembro{members.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowInvite(true); setError(null); setSuccess(null) }}>
          + Invitar Miembro
        </button>
      </div>

      {error && <div className="auth-error" style={{ marginBottom: 'var(--space-md)' }}>{error}</div>}
      {success && (
        <div style={{ padding: 'var(--space-sm) var(--space-md)', background: 'var(--success-bg)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--radius-md)', color: 'var(--success)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-md)' }}>
          {success}
        </div>
      )}

      <div className="team-grid">
        {members.map((member, index) => (
          <div key={member.id} className="team-card card" style={{ animationDelay: `${index * 60}ms` }}>
            <div
              className="avatar avatar-lg"
              style={{ background: avatarColors[index % avatarColors.length] }}
            >
              {getInitials(member.full_name || member.email)}
            </div>
            <div className="team-card-info">
              <div className="team-card-name">{member.full_name || 'Sin nombre'}</div>
              <div className="team-card-email">{member.email}</div>
              <div style={{ marginTop: 'var(--space-xs)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                {member.id === currentUserId ? (
                  <span className={`badge badge-${member.role}`}>{member.role === 'admin' ? 'Administrador' : 'Miembro'} (Tú)</span>
                ) : (
                  <select
                    className="select"
                    style={{ width: 'auto', padding: '2px 28px 2px 8px', fontSize: 'var(--font-xs)' }}
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                    disabled={updatingRole === member.id}
                  >
                    <option value="admin">Administrador</option>
                    <option value="member">Miembro</option>
                  </select>
                )}
                <button 
                  className="btn btn-ghost btn-icon" 
                  style={{ marginLeft: 'auto', padding: '4px' }}
                  onClick={() => { setEditingUser(member); setError(null); setSuccess(null) }}
                  title="Editar Perfil"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowInvite(false) }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Invitar Miembro</h2>
              <button className="modal-close" onClick={() => setShowInvite(false)}>×</button>
            </div>

            <form onSubmit={handleInvite}>
              <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                <label className="form-label" htmlFor="invite-name">Nombre completo *</label>
                <input id="invite-name" name="full_name" className="input" placeholder="Juan Pérez" required />
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                <label className="form-label" htmlFor="invite-email">Correo electrónico *</label>
                <input id="invite-email" name="email" type="email" className="input" placeholder="juan@email.com" required />
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                <label className="form-label" htmlFor="invite-password">Contraseña temporal *</label>
                <input id="invite-password" name="password" type="text" className="input" placeholder="Contraseña inicial" required minLength={6} />
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                <label className="form-label" htmlFor="invite-role">Rol</label>
                <select id="invite-role" name="role" className="select" defaultValue="member">
                  <option value="member">Miembro</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowInvite(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (
                    <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creando...</>
                  ) : (
                    'Crear Usuario'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editingUser && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setEditingUser(null) }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Editar Perfil</h2>
              <button className="modal-close" onClick={() => setEditingUser(null)}>×</button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                <label className="form-label" htmlFor="edit-name">Nombre completo *</label>
                <input 
                  id="edit-name" 
                  name="full_name" 
                  className="input" 
                  defaultValue={editingUser.full_name || ''} 
                  required 
                />
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                <label className="form-label">Correo electrónico</label>
                <input 
                  className="input" 
                  defaultValue={editingUser.email} 
                  disabled 
                  style={{ opacity: 0.7 }}
                />
                <small style={{ color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                  El correo electrónico no se puede modificar desde aquí.
                </small>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>Cancelar</button>
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
        </div>
      )}
    </>
  )
}
