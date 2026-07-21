export const APP_NAME = 'HefesIA Tasks'

export const TASK_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  in_progress: 'En Progreso',
  completed: 'Completada',
}

export const TASK_PRIORITY_LABELS: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
}

export const TASK_PRIORITY_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#f97316',
  urgent: '#ef4444',
}

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  archived: 'Archivado',
  completed: 'Completado',
}

export const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316',
  '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
]

export const MEMBER_ROLE_LABELS: Record<string, string> = {
  owner: 'Propietario',
  editor: 'Editor',
  viewer: 'Visualizador',
}
