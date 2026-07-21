'use client'

import { useState } from 'react'
import Link from 'next/link'
import { completeTask, deleteTask } from '@/actions/tasks'
import { deleteProject, addProjectMember, removeProjectMember } from '@/actions/projects'
import { TaskForm } from '@/components/tasks/TaskForm'
import { formatDate, isOverdue, isDueSoon } from '@/lib/utils/dates'
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS, MEMBER_ROLE_LABELS } from '@/lib/utils/constants'
import { useRouter } from 'next/navigation'
import type { Profile, Task } from '@/lib/types/database'

interface ProjectDetailClientProps {
  project: any
  tasks: any[]
  members: Pick<Profile, 'id' | 'full_name' | 'email'>[]
  isAdmin: boolean
  currentUserId: string
}

export function ProjectDetailClient({ project, tasks, members, isAdmin, currentUserId }: ProjectDetailClientProps) {
  const router = useRouter()
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')

  const canCreateTasks = isAdmin || project.project_members?.some(
    (m: any) => m.user_id === currentUserId && (m.role === 'owner' || m.role === 'editor')
  )

  const filteredTasks = statusFilter === 'all'
    ? tasks
    : tasks.filter((t: any) => t.status === statusFilter)

  const handleComplete = async (taskId: string) => {
    setLoadingTaskId(taskId)
    await completeTask(taskId)
    setLoadingTaskId(null)
  }

  const handleDeleteProject = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar este proyecto? Se eliminarán todas las tareas asociadas.')) {
      await deleteProject(project.id)
      router.push('/projects')
    }
  }

  const handleAddMember = async () => {
    if (!selectedMemberId) return
    await addProjectMember(project.id, selectedMemberId)
    setSelectedMemberId('')
    setShowAddMember(false)
  }

  const handleRemoveMember = async (userId: string) => {
    if (confirm('¿Eliminar a este miembro del proyecto?')) {
      await removeProjectMember(project.id, userId)
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'
  }

  const existingMemberIds = project.project_members?.map((m: any) => m.user_id) || []
  const availableMembers = members.filter(m => !existingMemberIds.includes(m.id))

  return (
    <>
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <Link href="/projects" style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-sm)' }}>
          ← Volver a Proyectos
        </Link>
      </div>

      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: project.color }} />
          <div>
            <h1 className="page-title">{project.name}</h1>
            {project.description && (
              <p className="page-subtitle">{project.description}</p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          {canCreateTasks && (
            <button className="btn btn-primary" onClick={() => setShowTaskForm(true)}>
              + Nueva Tarea
            </button>
          )}
          {isAdmin && (
            <button className="btn btn-danger" onClick={handleDeleteProject}>
              Eliminar
            </button>
          )}
        </div>
      </div>

      {/* Members Section */}
      <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
          <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 700 }}>👥 Miembros del Proyecto</h3>
          {isAdmin && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowAddMember(!showAddMember)}>
              + Agregar
            </button>
          )}
        </div>

        {showAddMember && (
          <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            <select className="select" value={selectedMemberId} onChange={(e) => setSelectedMemberId(e.target.value)}>
              <option value="">Seleccionar miembro...</option>
              {availableMembers.map(m => (
                <option key={m.id} value={m.id}>{m.full_name || m.email}</option>
              ))}
            </select>
            <button className="btn btn-primary btn-sm" onClick={handleAddMember} disabled={!selectedMemberId}>
              Agregar
            </button>
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
          {project.project_members?.map((member: any) => (
            <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-sm) var(--space-md)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div className="avatar avatar-sm" style={{ background: project.color }}>
                {getInitials(member.profiles?.full_name || member.profiles?.email || '')}
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-sm)', fontWeight: 500 }}>{member.profiles?.full_name || member.profiles?.email}</div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{MEMBER_ROLE_LABELS[member.role] || member.role}</div>
              </div>
              {isAdmin && member.user_id !== currentUserId && (
                <button className="btn btn-ghost btn-sm" onClick={() => handleRemoveMember(member.user_id)} style={{ padding: '2px 6px', fontSize: 'var(--font-xs)' }}>×</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tasks Section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
        <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700 }}>Tareas ({tasks.length})</h3>
      </div>

      <div className="filters-bar">
        <button className={`filter-chip ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>Todas</button>
        {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
          <button key={value} className={`filter-chip ${statusFilter === value ? 'active' : ''}`} onClick={() => setStatusFilter(value)}>{label}</button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3 className="empty-state-title">No hay tareas</h3>
          <p className="empty-state-desc">
            {canCreateTasks ? 'Crea la primera tarea de este proyecto.' : 'No hay tareas en este proyecto aún.'}
          </p>
        </div>
      ) : (
        <div className="task-list">
          {filteredTasks.map((task: any) => {
            const overdue = isOverdue(task.due_date) && task.status !== 'completed'
            const dueSoon = isDueSoon(task.due_date) && task.status !== 'completed'
            const isCompleted = task.status === 'completed'

            return (
              <div key={task.id} className="task-item">
                <button
                  className={`task-checkbox ${isCompleted ? 'checked' : ''}`}
                  onClick={() => handleComplete(task.id)}
                  disabled={loadingTaskId === task.id}
                >
                  {loadingTaskId === task.id ? (
                    <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  ) : isCompleted ? '✓' : null}
                </button>

                <div className="task-info">
                  <div className={`task-title ${isCompleted ? 'completed' : ''}`}>{task.title}</div>
                  <div className="task-meta">
                    {task.profiles && (
                      <span className="task-meta-item">
                        👤 {task.profiles.full_name || task.profiles.email}
                      </span>
                    )}
                    {task.due_date && (
                      <span className={`task-meta-item ${overdue ? 'overdue' : dueSoon ? 'due-soon' : ''}`}>
                        📅 {formatDate(task.due_date)}
                      </span>
                    )}
                  </div>
                </div>

                <span className={`badge badge-${task.priority}`}>
                  {TASK_PRIORITY_LABELS[task.priority]}
                </span>

                <span className={`badge badge-${task.status}`}>
                  {TASK_STATUS_LABELS[task.status]}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {showTaskForm && (
        <TaskForm
          projects={[{ id: project.id, name: project.name, color: project.color }]}
          members={members}
          defaultProjectId={project.id}
          onClose={() => setShowTaskForm(false)}
        />
      )}
    </>
  )
}
