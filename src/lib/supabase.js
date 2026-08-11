import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
const configuredPublicAppUrl = import.meta.env.VITE_PUBLIC_APP_URL?.trim()

export const publicAppUrl = new URL(
  configuredPublicAppUrl || import.meta.env.BASE_URL,
  window.location.origin,
).toString()

export function getAuthRedirectUrl(action) {
  const redirectUrl = new URL(publicAppUrl)
  redirectUrl.searchParams.set('auth', action)
  return redirectUrl.toString()
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase chưa được kết nối cho bản xem trước này.')
  }
  return supabase
}
