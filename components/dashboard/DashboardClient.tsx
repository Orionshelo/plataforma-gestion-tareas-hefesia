'use client'

import { useState } from 'react'
import { Calendar } from '@/components/dashboard/Calendar'
import { TaskSummary } from '@/components/dashboard/TaskSummary'
import { formatDate } from '@/lib/utils/dates'
import { TASK_PRIORITY_LABELS } from '@/lib/utils/constants'
import type { Task, TaskWithProject } from '@/lib/types/database'

interface DashboardClientProps {
  tasks: TaskWithProject[]
  upcomingTasks: TaskWithProject[]
}

export function DashboardClient({ tasks, upcomingTasks }: DashboardClientProps) {
  const [selectedDayTasks, setSelectedDayTasks] = useState<Task[] | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const handleDaySelect = (date: Date, dayTasks: Task[]) => {
    setSelectedDate(date)
    setSelectedDayTasks(dayTasks)
  }

  return (
    <div className="dashboard-grid">
      <div>
        <Calendar tasks={tasks} onDaySelect={handleDaySelect} />
        {selectedDayTasks && selectedDate && (
          <div className="card" style={{ marginTop: 'var(--space-md)', padding: 'var(--space-lg)' }}>
            <h4 style={{ marginBottom: 'var(--space-sm)', fontSize: 'var(--font-md)', fontWeight: 600 }}>
              📅 {formatDate(selectedDate.toISOString())}
            </h4>
            {selectedDayTasks.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-sm)' }}>
                No hay tareas para este día.
              </p>
            ) : (
              <div className="task-list">
                {selectedDayTasks.map(task => (
                  <div key={task.id} className="task-item">
                    <div className="task-info">
                      <div className="task-title">{task.title}</div>
                      <div className="task-meta">
                        <span className={`badge badge-${task.status}`}>
                          {task.status === 'pending' ? 'Pendiente' : task.status === 'in_progress' ? 'En Progreso' : 'Completada'}
                        </span>
                        <span className={`badge badge-${task.priority}`}>
                          {TASK_PRIORITY_LABELS[task.priority]}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <TaskSummary tasks={upcomingTasks} />
    </div>
  )
}
