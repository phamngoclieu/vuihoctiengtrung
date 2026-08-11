import { requireSupabase } from './supabase.js'

export async function loadAccounts() {
  const client = requireSupabase()
  const { data, error } = await client
    .from('profiles')
    .select('id, email, display_name, role, locked_at, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function updateAccountAccess({ accountId, role, lockedAt }) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('profiles')
    .update({ role, locked_at: lockedAt })
    .eq('id', accountId)
    .select('id, email, display_name, role, locked_at, created_at')
    .single()

  if (error) throw error
  return data
}
