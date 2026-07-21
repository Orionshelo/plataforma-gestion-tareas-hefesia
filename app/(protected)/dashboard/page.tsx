import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { Calendar } from '@/components/dashboard/Calendar'
import { TaskSummary } from '@/components/dashboard/TaskSummary'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard — HefesIA Tasks',
  description: 'Vista general de tus tareas y proyectos.',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // Fetch tasks — admins see all, members see assigned
  let tasksQuery = supabase
    .from('tasks')
    .select('*, projects(name, color)')
    .order('due_date', { ascending: true, nullsFirst: false })

  if (!isAdmin) {
    tasksQuery = tasksQuery.eq('assigned_to', user.id)
  }

  const { data: tasks } = await tasksQuery

  const allTasks = tasks || []

  // Calculate stats
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const pending = allTasks.filter(t => t.status === 'pending').length
  const inProgress = allTasks.filter(t => t.status === 'in_progress').length
  const completed = allTasks.filter(t => t.status === 'completed').length
  const overdue = allTasks.filter(t => {
    if (!t.due_date || t.status === 'completed') return false
    const due = new Date(t.due_date)
    due.setHours(0, 0, 0, 0)
    return due < today
  }).length

  // Upcoming tasks (not completed, sorted by due date)
  const upcomingTasks = allTasks
    .filter(t => t.status !== 'completed')
    .slice(0, 8)

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            {isAdmin ? 'Vista general de todos los proyectos' : 'Tus tareas asignadas'}
          </p>
        </div>
      </div>

      <StatsCards
        pending={pending}
        inProgress={inProgress}
        completed={completed}
        overdue={overdue}
      />

      <DashboardClient tasks={allTasks} upcomingTasks={upcomingTasks} />
    </>
  )
}
