'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado.' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const color = formData.get('color') as string

  if (!name?.trim()) {
    return { error: 'El nombre del proyecto es requerido.' }
  }

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      name: name.trim(),
      description: description?.trim() || '',
      color: color || '#6366f1',
      created_by: user.id,
    })
    .select()
    .single()

  if (error || !project) {
    return { error: 'Error al crear el proyecto. Verifica que tienes permisos.' }
  }

  // Add creator as project owner
  await supabase
    .from('project_members')
    .insert({
      project_id: project.id,
      user_id: user.id,
      role: 'owner',
    })

  revalidatePath('/projects')
  revalidatePath('/dashboard')
  return { success: true, project }
}

export async function updateProject(projectId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado.' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const color = formData.get('color') as string
  const status = formData.get('status') as string

  const updateData: Record<string, string> = {}
  if (name) updateData.name = name.trim()
  if (description !== null) updateData.description = description?.trim() || ''
  if (color) updateData.color = color
  if (status) updateData.status = status

  const { error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', projectId)

  if (error) {
    return { error: 'Error al actualizar el proyecto.' }
  }

  revalidatePath('/projects')
  revalidatePath(`/projects/${projectId}`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) {
    return { error: 'Error al eliminar el proyecto.' }
  }

  revalidatePath('/projects')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function addProjectMember(projectId: string, userId: string, role: string = 'editor') {
  const supabase = await createClient()

  const { error } = await supabase
    .from('project_members')
    .insert({
      project_id: projectId,
      user_id: userId,
      role,
    })

  if (error) {
    if (error.code === '23505') {
      return { error: 'El usuario ya es miembro de este proyecto.' }
    }
    return { error: 'Error al agregar miembro.' }
  }

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

export async function removeProjectMember(projectId: string, userId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', userId)

  if (error) {
    return { error: 'Error al eliminar miembro.' }
  }

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}
