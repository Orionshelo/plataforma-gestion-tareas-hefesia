'use client'

import { useState } from 'react'
import { completeTask } from '@/actions/tasks'
import { formatDate, isOverdue, isDueSoon } from '@/lib/utils/dates'
import { TASK_PRIORITY_LABELS } from '@/lib/utils/constants'
import type { TaskWithProject } from '@/lib/types/database'

interface TaskSummaryProps {
  tasks: TaskWithProject[]
  title?: string
}

export function TaskSummary({ tasks, title = 'Próximas Tareas' }: TaskSummaryProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleComplete = async (taskId: string) => {
    setLoadingId(taskId)
    await completeTask(taskId)
    setLoadingId(null)
  }

  return (
    <div className="task-summary card">
      <div className="task-summary-header">
        <h3 className="task-summary-title">{title}</h3>
        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
          {tasks.length} tarea{tasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state" style={{ padding: 'var(--space-xl) 0' }}>
          <div className="empty-state-icon">🎉</div>
          <p className="empty-state-desc">
            No tienes tareas pendientes. ¡Buen trabajo!
          </p>
        </div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => {
            const overdue = isOverdue(task.due_date) && task.status !== 'completed'
            const dueSoon = isDueSoon(task.due_date) && task.status !== 'completed'
            const isCompleted = task.status === 'completed'

            return (
              <div key={task.id} className="task-item">
                <button
                  className={`task-checkbox ${isCompleted ? 'checked' : ''}`}
                  onClick={() => handleComplete(task.id)}
                  disabled={loadingId === task.id}
                  aria-label={isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}
                >
                  {loadingId === task.id ? (
                    <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  ) : isCompleted ? (
                    '✓'
                  ) : null}
                </button>

                <div className="task-info">
                  <div className={`task-title ${isCompleted ? 'completed' : ''}`}>
                    {task.title}
                  </div>
                  <div className="task-meta">
                    {task.projects && (
                      <span className="task-meta-item">
                        <span
                          className="task-project-dot"
                          style={{ backgroundColor: task.projects.color }}
                        />
                        {task.projects.name}
                      </span>
                    )}
                    {task.due_date && (
                      <span
                        className={`task-meta-item ${overdue ? 'overdue' : dueSoon ? 'due-soon' : ''}`}
                      >
                        📅 {formatDate(task.due_date)}
                      </span>
                    )}
                  </div>
                </div>

                <span className={`badge badge-${task.priority}`}>
                  {TASK_PRIORITY_LABELS[task.priority]}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
