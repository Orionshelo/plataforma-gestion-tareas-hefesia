'use client'

import { useState } from 'react'
import { createTask } from '@/actions/tasks'
import type { Project, Profile } from '@/lib/types/database'
import { TASK_PRIORITY_LABELS } from '@/lib/utils/constants'

interface TaskFormProps {
  projects: Pick<Project, 'id' | 'name' | 'color'>[]
  members: Pick<Profile, 'id' | 'full_name' | 'email'>[]
  defaultProjectId?: string
  onClose: () => void
  onSuccess?: () => void
}

export function TaskForm({ projects, members, defaultProjectId, onClose, onSuccess }: TaskFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await createTask(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      onSuccess?.()
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Nueva Tarea</h2>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error" style={{ marginBottom: 'var(--space-md)' }}>{error}</div>}

          <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
            <label className="form-label" htmlFor="task-title">Título *</label>
            <input id="task-title" name="title" className="input" placeholder="Nombre de la tarea" required />
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
            <label className="form-label" htmlFor="task-description">Descripción</label>
            <textarea id="task-description" name="description" className="textarea" placeholder="Describe la tarea..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-project">Proyecto *</label>
              <select id="task-project" name="project_id" className="select" required defaultValue={defaultProjectId || ''}>
                <option value="" disabled>Seleccionar...</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-priority">Prioridad</label>
              <select id="task-priority" name="priority" className="select" defaultValue="medium">
                {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-assignee">Asignar a</label>
              <select id="task-assignee" name="assigned_to" className="select" defaultValue="">
                <option value="">Sin asignar</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.full_name || m.email}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-due">Fecha límite</label>
              <input id="task-due" name="due_date" type="date" className="input" />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creando...</>
              ) : (
                'Crear Tarea'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
