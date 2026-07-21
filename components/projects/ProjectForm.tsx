'use client'

import { useState } from 'react'
import { createProject } from '@/actions/projects'
import { PROJECT_COLORS } from '@/lib/utils/constants'

interface ProjectFormProps {
  onClose: () => void
  onSuccess?: () => void
}

export function ProjectForm({ onClose, onSuccess }: ProjectFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('color', selectedColor)

    const result = await createProject(formData)

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
          <h2 className="modal-title">Nuevo Proyecto</h2>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error" style={{ marginBottom: 'var(--space-md)' }}>{error}</div>}

          <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
            <label className="form-label" htmlFor="project-name">Nombre del proyecto *</label>
            <input id="project-name" name="name" className="input" placeholder="Ej: Consultoría ABC" required />
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
            <label className="form-label" htmlFor="project-description">Descripción</label>
            <textarea id="project-description" name="description" className="textarea" placeholder="Describe el proyecto..." />
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
            <label className="form-label">Color</label>
            <div className="color-picker">
              {PROJECT_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-swatch ${selectedColor === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  aria-label={`Color ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creando...</>
              ) : (
                'Crear Proyecto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
