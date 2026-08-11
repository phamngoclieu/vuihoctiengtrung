import { requireSupabase } from './supabase.js'

export async function loadNotifications({ userId, limit = 10 }) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('notifications')
    .select('id, type, title, body, link, read_at, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

export async function markNotificationRead({ notificationId }) {
  const client = requireSupabase()
  const { error } = await client
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)

  if (error) throw error
}
