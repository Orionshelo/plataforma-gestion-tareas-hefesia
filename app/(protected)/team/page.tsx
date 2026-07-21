import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TeamClient } from '@/components/team/TeamClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Equipo — HefesIA Tasks',
  description: 'Gestiona los miembros de tu equipo.',
}

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Verify admin access
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Fetch all team members
  const { data: members } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <TeamClient members={members || []} currentUserId={user.id} />
  )
}
