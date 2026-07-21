import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProjectsClient } from '@/components/projects/ProjectsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Proyectos — HefesIA Tasks',
  description: 'Gestiona tus proyectos de consultoría.',
}

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // Fetch projects with member count
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      project_members(
        id,
        user_id,
        role,
        profiles(full_name, email, avatar_url)
      )
    `)
    .order('created_at', { ascending: false })

  // Count tasks per project
  const { data: taskCounts } = await supabase
    .from('tasks')
    .select('project_id, id')

  const taskCountMap: Record<string, number> = {}
  taskCounts?.forEach(t => {
    taskCountMap[t.project_id] = (taskCountMap[t.project_id] || 0) + 1
  })

  const projectsWithCounts = (projects || []).map(p => ({
    ...p,
    task_count: taskCountMap[p.id] || 0,
  }))

  return (
    <ProjectsClient projects={projectsWithCounts} isAdmin={isAdmin} />
  )
}
