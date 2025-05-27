import { supabase } from './supabaseClient'

export async function getUserRole(userId: string): Promise<'client' | 'operator' | 'admin' | null> {
  console.log('Checking role for user:', userId)

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching role:', error)
    return null
  }

  return data?.role || null
}