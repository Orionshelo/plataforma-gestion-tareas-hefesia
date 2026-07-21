'use client'

import { ClipboardList, Zap, CheckCircle2, Clock } from 'lucide-react'

interface StatsCardsProps {
  pending: number
  inProgress: number
  completed: number
  overdue: number
}

export function StatsCards({ pending, inProgress, completed, overdue }: StatsCardsProps) {
  const stats = [
    {
      label: 'Pendientes',
      value: pending,
      icon: <ClipboardList size={24} />,
      bg: 'var(--warning-bg)',
      color: 'var(--warning)',
    },
    {
      label: 'En Progreso',
      value: inProgress,
      icon: <Zap size={24} />,
      bg: 'var(--info-bg)',
      color: 'var(--info)',
    },
    {
      label: 'Completadas',
      value: completed,
      icon: <CheckCircle2 size={24} />,
      bg: 'var(--success-bg)',
      color: 'var(--success)',
    },
    {
      label: 'Vencidas',
      value: overdue,
      icon: <Clock size={24} />,
      bg: 'var(--danger-bg)',
      color: 'var(--danger)',
    },
  ]

  return (
    <div className="stats-grid">
      {stats.map((stat) => (
        <div key={stat.label} className="stat-card card">
          <div
            className="stat-icon"
            style={{ background: stat.bg }}
          >
            {stat.icon}
          </div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
