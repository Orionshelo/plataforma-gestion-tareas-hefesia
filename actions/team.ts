'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function inviteUser(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado.' }

  // Verify admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Solo los administradores pueden invitar usuarios.' }
  }

  const email = formData.get('email') as string
  const fullName = formData.get('full_name') as string
  const role = formData.get('role') as string
  const password = formData.get('password') as string

  if (!email || !password || !fullName) {
    return { error: 'Email, nombre y contraseña son requeridos.' }
  }

  // Use admin client to create user (bypasses RLS)
  const adminClient = createAdminClient()

  const { error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: role || 'member',
    },
  })

  if (error) {
    if (error.message.includes('already been registered')) {
      return { error: 'Este email ya está registrado.' }
    }
    return { error: `Error al crear usuario: ${error.message}` }
  }

  revalidatePath('/team')
  return { success: true }
}

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado.' }

  // Verify admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Solo los administradores pueden cambiar roles.' }
  }

  // Don't allow changing own role
  if (userId === user.id) {
    return { error: 'No puedes cambiar tu propio rol.' }
  }

  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) {
    return { error: 'Error al actualizar el rol.' }
  }

  revalidatePath('/team')
  return { success: true }
}

export async function updateUserProfile(userId: string, data: { full_name?: string; avatar_url?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && user.id !== userId) {
    return { error: 'No tienes permiso para editar este perfil.' }
  }

  const adminClient = createAdminClient()

  // Update profile
  const { error: profileError } = await adminClient
    .from('profiles')
    .update(data)
    .eq('id', userId)

  if (profileError) {
    return { error: 'Error al actualizar el perfil.' }
  }

  // If full_name is updated, also update auth metadata
  if (data.full_name) {
    await adminClient.auth.admin.updateUserById(userId, {
      user_metadata: { full_name: data.full_name }
    })
  }

  revalidatePath('/team')
  return { success: true }
}
