import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'
import { useLanguage } from '../lib/i18n.jsx'

const AuthContext = createContext(null)

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, role, ui_language, locked_at')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export function AuthProvider({ children }) {
  const { setLanguage } = useLanguage()
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) return undefined

    let active = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setSession(data.session)
      if (data.session?.user) {
        try {
          const loadedProfile = await fetchProfile(data.session.user.id)
          setProfile(loadedProfile)
          setLanguage(loadedProfile.ui_language)
        } catch {
          setProfile(null)
        }
      }
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (!nextSession?.user) {
        setProfile(null)
        return
      }
      setTimeout(() => {
        fetchProfile(nextSession.user.id).then((loadedProfile) => {
          setProfile(loadedProfile)
          setLanguage(loadedProfile.ui_language)
        }).catch(() => setProfile(null))
      }, 0)
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [setLanguage])

  async function refreshProfile() {
    if (!session?.user) return null
    const nextProfile = await fetchProfile(session.user.id)
    setProfile(nextProfile)
    return nextProfile
  }

  const value = useMemo(() => ({
    session,
    user: session?.user || null,
    profile,
    refreshProfile,
    loading,
    configured: isSupabaseConfigured,
    async signOut() {
      if (supabase) await supabase.auth.signOut()
    },
  }), [session, profile, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
