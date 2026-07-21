'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado.' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const priority = formData.get('priority') as string
  const projectId = formData.get('project_id') as string
  const assignedTo = formData.get('assigned_to') as string
  const dueDate = formData.get('due_date') as string

  if (!title?.trim()) {
    return { error: 'El título de la tarea es requerido.' }
  }

  if (!projectId) {
    return { error: 'Debes seleccionar un proyecto.' }
  }

  const { error } = await supabase
    .from('tasks')
    .insert({
      title: title.trim(),
      description: description?.trim() || '',
      priority: priority || 'medium',
      project_id: projectId,
      created_by: user.id,
      assigned_to: assignedTo || null,
      due_date: dueDate || null,
    })

  if (error) {
    return { error: 'Error al crear la tarea. Verifica que tienes permisos.' }
  }

  revalidatePath('/tasks')
  revalidatePath('/dashboard')
  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

export async function updateTask(taskId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado.' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const priority = formData.get('priority') as string
  const status = formData.get('status') as string
  const assignedTo = formData.get('assigned_to') as string
  const dueDate = formData.get('due_date') as string

  const updateData: Record<string, unknown> = {}
  if (title) updateData.title = title.trim()
  if (description !== null && description !== undefined) updateData.description = description?.trim() || ''
  if (priority) updateData.priority = priority
  if (status) updateData.status = status
  if (assignedTo !== undefined) updateData.assigned_to = assignedTo || null
  if (dueDate !== undefined) updateData.due_date = dueDate || null

  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString()
  } else if (status && status !== 'completed') {
    updateData.completed_at = null
  }

  const { error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId)

  if (error) {
    return { error: 'Error al actualizar la tarea.' }
  }

  revalidatePath('/tasks')
  revalidatePath('/dashboard')
  revalidatePath('/projects')
  return { success: true }
}

export async function completeTask(taskId: string) {
  const supabase = await createClient()

  const { data: task } = await supabase
    .from('tasks')
    .select('status')
    .eq('id', taskId)
    .single()

  const newStatus = task?.status === 'completed' ? 'pending' : 'completed'

  const { error } = await supabase
    .from('tasks')
    .update({
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
    })
    .eq('id', taskId)

  if (error) {
    return { error: 'Error al actualizar la tarea.' }
  }

  revalidatePath('/tasks')
  revalidatePath('/dashboard')
  revalidatePath('/projects')
  return { success: true }
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) {
    return { error: 'Error al eliminar la tarea.' }
  }

  revalidatePath('/tasks')
  revalidatePath('/dashboard')
  revalidatePath('/projects')
  return { success: true }
}
