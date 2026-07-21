'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anonKey) {
      return { error: `Error de Configuración: Variables de entorno no encontradas en Vercel (URL: ${Boolean(url)}, KEY: ${Boolean(anonKey)})` }
    }

    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return { error: 'Email y contraseña son requeridos.' }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      const details = error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error))
      return { error: `Supabase Error [${error.status || 'NoStatus'}]: ${details}` }
    }

    redirect('/dashboard')
  } catch (err: any) {
    if (err?.message === 'NEXT_REDIRECT') throw err;
    return { error: `Excepción: ${err?.message || String(err)}` }
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}
