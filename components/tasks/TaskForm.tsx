'use client'

import { useState } from 'react'
import { createTask, updateTask } from '@/actions/tasks'
import type { Project, Profile, TaskWithProject } from '@/lib/types/database'
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '@/lib/utils/constants'

interface TaskFormProps {
  projects: Pick<Project, 'id' | 'name' | 'color'>[]
  members: Pick<Profile, 'id' | 'full_name' | 'email'>[]
  defaultProjectId?: string
  task?: TaskWithProject
  onClose: () => void
  onSuccess?: () => void
}

export function TaskForm({ projects, members, defaultProjectId, task, onClose, onSuccess }: TaskFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isEditing = !!task

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    let result

    if (isEditing) {
      result = await updateTask(task.id, formData)
    } else {
      result = await createTask(formData)
    }

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
          <h2 className="modal-title">{isEditing ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error" style={{ marginBottom: 'var(--space-md)' }}>{error}</div>}

          <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
            <label className="form-label" htmlFor="task-title">Título *</label>
            <input id="task-title" name="title" className="input" placeholder="Nombre de la tarea" required defaultValue={task?.title || ''} />
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
            <label className="form-label" htmlFor="task-description">Descripción</label>
            <textarea id="task-description" name="description" className="textarea" placeholder="Describe la tarea..." defaultValue={task?.description || ''} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-project">Proyecto *</label>
              <select id="task-project" name="project_id" className="select" required defaultValue={task?.project_id || defaultProjectId || ''} disabled={isEditing}>
                <option value="" disabled>Seleccionar...</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-priority">Prioridad</label>
              <select id="task-priority" name="priority" className="select" defaultValue={task?.priority || 'medium'}>
                {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-assignee">Asignar a</label>
              <select id="task-assignee" name="assigned_to" className="select" defaultValue={task?.assigned_to || ''}>
                <option value="">Sin asignar</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.full_name || m.email}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-due">Fecha límite</label>
              <input id="task-due" name="due_date" type="date" className="input" defaultValue={task?.due_date || ''} />
            </div>
          </div>

          {isEditing && (
            <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
              <label className="form-label" htmlFor="task-status">Estado</label>
              <select id="task-status" name="status" className="select" defaultValue={task.status}>
                {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> {isEditing ? 'Guardando...' : 'Creando...'}</>
              ) : (
                isEditing ? 'Guardar Cambios' : 'Crear Tarea'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
