'use client'

import { useState } from 'react'
import { getMonthDays, isSameDay, getMonthName } from '@/lib/utils/dates'
import { TASK_PRIORITY_COLORS } from '@/lib/utils/constants'
import type { Task } from '@/lib/types/database'

interface CalendarProps {
  tasks: Task[]
  onDaySelect?: (date: Date, dayTasks: Task[]) => void
}

export function Calendar({ tasks, onDaySelect }: CalendarProps) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const days = getMonthDays(currentYear, currentMonth)
  const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false
      const dueDate = new Date(task.due_date + 'T00:00:00')
      return isSameDay(dueDate, date)
    })
  }

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    const dayTasks = getTasksForDate(date)
    onDaySelect?.(date, dayTasks)
  }

  return (
    <div className="calendar card">
      <div className="calendar-header">
        <h3 className="calendar-title">
          {getMonthName(currentMonth)} {currentYear}
        </h3>
        <div className="calendar-nav">
          <button onClick={prevMonth} aria-label="Mes anterior">‹</button>
          <button onClick={nextMonth} aria-label="Mes siguiente">›</button>
        </div>
      </div>

      <div className="calendar-weekdays">
        {weekdays.map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-days">
        {days.map((date, index) => {
          const dayTasks = getTasksForDate(date)
          const isCurrentMonth = date.getMonth() === currentMonth
          const isToday = isSameDay(date, today)
          const isSelected = selectedDate && isSameDay(date, selectedDate)

          return (
            <div
              key={index}
              className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => handleDayClick(date)}
            >
              <span className="calendar-day-number">{date.getDate()}</span>
              {dayTasks.length > 0 && (
                <div className="calendar-day-dots">
                  {dayTasks.slice(0, 3).map((task, i) => (
                    <div
                      key={i}
                      className="calendar-dot"
                      style={{
                        backgroundColor: TASK_PRIORITY_COLORS[task.priority] || 'var(--accent)',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
