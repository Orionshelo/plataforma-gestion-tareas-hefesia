import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TasksClient } from '@/components/tasks/TasksClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mis Tareas — HefesIA Tasks',
  description: 'Gestiona tus tareas asignadas.',
}

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // Fetch tasks
  const tasksQuery = supabase
    .from('tasks')
    .select('*, projects(name, color)')
    .order('due_date', { ascending: true, nullsFirst: false })

  const { data: tasks } = await tasksQuery

  // Fetch projects and members for task creation
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, color')
    .eq('status', 'active')
    .order('name')

  const { data: members } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .order('full_name')

  return (
    <TasksClient
      tasks={tasks || []}
      projects={projects || []}
      members={members || []}
      isAdmin={isAdmin}
      currentUserId={user.id}
    />
  )
}
