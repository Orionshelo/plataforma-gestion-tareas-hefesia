import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ProjectDetailClient } from '@/components/projects/ProjectDetailClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Detalle del Proyecto — HefesIA Tasks',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // Fetch project with members
  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      project_members(
        id,
        user_id,
        role,
        profiles(id, full_name, email, avatar_url)
      )
    `)
    .eq('id', id)
    .single()

  if (!project) notFound()

  // Fetch tasks for this project
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, profiles:assigned_to(full_name, email, avatar_url)')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  // Fetch all profiles for assignment
  const { data: allMembers } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .order('full_name')

  return (
    <ProjectDetailClient
      project={project}
      tasks={tasks || []}
      members={allMembers || []}
      isAdmin={isAdmin}
      currentUserId={user.id}
    />
  )
}
