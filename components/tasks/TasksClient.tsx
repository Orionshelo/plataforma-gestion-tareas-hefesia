'use client'

import { useState } from 'react'
import { completeTask } from '@/actions/tasks'
import { TaskForm } from '@/components/tasks/TaskForm'
import { formatDate, isOverdue, isDueSoon } from '@/lib/utils/dates'
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '@/lib/utils/constants'
import type { TaskWithProject, Profile, Project } from '@/lib/types/database'

interface TasksClientProps {
  tasks: TaskWithProject[]
  projects: Pick<Project, 'id' | 'name' | 'color'>[]
  members: Pick<Profile, 'id' | 'full_name' | 'email'>[]
  isAdmin: boolean
  currentUserId?: string
}

export function TasksClient({ tasks, projects, members, isAdmin, currentUserId }: TasksClientProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskWithProject | null>(null)
  const [viewMode, setViewMode] = useState<'mine' | 'team'>('mine')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const filteredTasks = tasks.filter(t => {
    if (viewMode === 'mine' && currentUserId && t.assigned_to !== currentUserId) return false
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
    return true
  })

  const handleEdit = (task: TaskWithProject) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setEditingTask(null)
    setShowForm(false)
  }

  const handleComplete = async (taskId: string) => {
    setLoadingId(taskId)
    await completeTask(taskId)
    setLoadingId(null)
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">{viewMode === 'mine' ? 'Mis Tareas' : 'Tareas del Equipo'}</h1>
          <p className="page-subtitle">{filteredTasks.length} tarea{filteredTasks.length !== 1 ? 's' : ''} encontrada{filteredTasks.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && projects.length > 0 && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Nueva Tarea
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <button 
          className={`btn ${viewMode === 'mine' ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={() => setViewMode('mine')}
        >
          Mis Tareas
        </button>
        <button 
          className={`btn ${viewMode === 'team' ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={() => setViewMode('team')}
        >
          Tareas del Equipo
        </button>
      </div>

      <div className="filters-bar">
        <button className={`filter-chip ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>Todos los estados</button>
        {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
          <button key={value} className={`filter-chip ${statusFilter === value ? 'active' : ''}`} onClick={() => setStatusFilter(value)}>{label}</button>
        ))}
        <div style={{ width: 1, height: 24, background: 'var(--border-color)', margin: '0 var(--space-xs)' }} />
        <button className={`filter-chip ${priorityFilter === 'all' ? 'active' : ''}`} onClick={() => setPriorityFilter('all')}>Toda prioridad</button>
        {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
          <button key={value} className={`filter-chip ${priorityFilter === value ? 'active' : ''}`} onClick={() => setPriorityFilter(value)}>{label}</button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <h3 className="empty-state-title">
            {tasks.length === 0 ? 'No hay tareas' : 'Sin resultados'}
          </h3>
          <p className="empty-state-desc">
            {tasks.length === 0
              ? 'No tienes tareas asignadas aún.'
              : 'No hay tareas con los filtros seleccionados.'}
          </p>
        </div>
      ) : (
        <div className="task-list">
          {filteredTasks.map((task, index) => {
            const overdue = isOverdue(task.due_date) && task.status !== 'completed'
            const dueSoon = isDueSoon(task.due_date) && task.status !== 'completed'
            const isCompleted = task.status === 'completed'

            return (
              <div key={task.id} className="task-item" style={{ animationDelay: `${index * 50}ms` }}>
                <button
                  className={`task-checkbox ${isCompleted ? 'checked' : ''}`}
                  onClick={() => handleComplete(task.id)}
                  disabled={loadingId === task.id}
                  aria-label={isCompleted ? 'Marcar como pendiente' : 'Completar tarea'}
                >
                  {loadingId === task.id ? (
                    <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  ) : isCompleted ? '✓' : null}
                </button>

                <div className="task-info">
                  <div className={`task-title ${isCompleted ? 'completed' : ''}`}>{task.title}</div>
                  <div className="task-meta">
                    {task.projects && (
                      <span className="task-meta-item">
                        <span className="task-project-dot" style={{ backgroundColor: task.projects.color }} />
                        {task.projects.name}
                      </span>
                    )}
                    {task.due_date && (
                      <span className={`task-meta-item ${overdue ? 'overdue' : dueSoon ? 'due-soon' : ''}`}>
                        📅 {formatDate(task.due_date)}
                        {overdue && ' (Vencida)'}
                        {dueSoon && !overdue && ' (Próxima)'}
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
                
                {(isAdmin || task.created_by === currentUserId || task.assigned_to === currentUserId) && (
                  <button 
                    className="btn btn-ghost btn-icon" 
                    onClick={() => handleEdit(task)}
                    aria-label="Editar tarea"
                    style={{ marginLeft: 'var(--space-sm)' }}
                  >
                    ✎
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <TaskForm
          projects={projects}
          members={members}
          task={editingTask || undefined}
          onClose={handleCloseForm}
        />
      )}
    </>
  )
}
