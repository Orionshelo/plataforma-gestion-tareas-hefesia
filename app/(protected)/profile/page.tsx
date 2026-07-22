import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileClient } from '@/components/profile/ProfileClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mi Perfil — HefesIA Tasks',
  description: 'Gestiona tu perfil de usuario.',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <ProfileClient profile={profile} />
  )
}
