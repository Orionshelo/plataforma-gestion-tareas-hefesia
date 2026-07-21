'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { PROJECT_STATUS_LABELS } from '@/lib/utils/constants'
import type { ProjectWithMembers } from '@/lib/types/database'

interface ProjectsClientProps {
  projects: (ProjectWithMembers & { task_count: number })[]
  isAdmin: boolean
}

export function ProjectsClient({ projects, isAdmin }: ProjectsClientProps) {
  const [showForm, setShowForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredProjects = statusFilter === 'all'
    ? projects
    : projects.filter(p => p.status === statusFilter)

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Proyectos</h1>
          <p className="page-subtitle">{projects.length} proyecto{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Nuevo Proyecto
          </button>
        )}
      </div>

      <div className="filters-bar">
        <button
          className={`filter-chip ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          Todos
        </button>
        {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
          <button
            key={value}
            className={`filter-chip ${statusFilter === value ? 'active' : ''}`}
            onClick={() => setStatusFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {filteredProjects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <h3 className="empty-state-title">No hay proyectos</h3>
          <p className="empty-state-desc">
            {isAdmin
              ? 'Crea tu primer proyecto para empezar a organizar tareas.'
              : 'Aún no tienes proyectos asignados.'}
          </p>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              + Crear Proyecto
            </button>
          )}
        </div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map((project, index) => (
            <Link key={project.id} href={`/projects/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div
                className="project-card card card-interactive"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: project.color, borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }} />
                <div className="project-card-header">
                  <h3 className="project-card-name">{project.name}</h3>
                  <span className={`badge badge-${project.status === 'active' ? 'in_progress' : project.status === 'completed' ? 'completed' : 'pending'}`}>
                    {PROJECT_STATUS_LABELS[project.status]}
                  </span>
                </div>
                {project.description && (
                  <p className="project-card-desc">{project.description}</p>
                )}
                <div className="project-card-stats">
                  <span className="project-card-stat">
                    📋 {project.task_count} tarea{project.task_count !== 1 ? 's' : ''}
                  </span>
                  <span className="project-card-stat">
                    👥 {project.project_members?.length || 0} miembro{(project.project_members?.length || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
                {project.project_members && project.project_members.length > 0 && (
                  <div className="project-card-members">
                    {project.project_members.slice(0, 4).map((member) => (
                      <div
                        key={member.id}
                        className="avatar avatar-sm"
                        style={{ background: project.color }}
                        title={member.profiles?.full_name || member.profiles?.email}
                      >
                        {getInitials(member.profiles?.full_name || member.profiles?.email || '')}
                      </div>
                    ))}
                    {project.project_members.length > 4 && (
                      <div className="avatar avatar-sm" style={{ background: 'var(--bg-tertiary)', fontSize: 'var(--font-xs)' }}>
                        +{project.project_members.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {showForm && <ProjectForm onClose={() => setShowForm(false)} />}
    </>
  )
}
