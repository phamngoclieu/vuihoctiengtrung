import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, Eye, EyeOff, LoaderCircle, Mail } from 'lucide-react'
import Brand from '../components/Brand.jsx'
import LanguageSwitch from '../components/LanguageSwitch.jsx'
import { navigate } from '../lib/hashRoute.js'
import { getAuthRedirectUrl, isSupabaseConfigured, supabase } from '../lib/supabase.js'
import TurnstileWidget, { turnstileSiteKey } from '../components/TurnstileWidget.jsx'
import { useLanguage } from '../lib/i18n.jsx'

function initialMode() {
  const hash = window.location.hash
  const pageQuery = new URLSearchParams(window.location.search)
  if (pageQuery.get('auth') === 'recovery' || hash.includes('mode=reset')) return 'reset'
  if (hash.includes('mode=register')) return 'register'
  if (hash.includes('mode=forgot')) return 'forgot'
  return 'login'
}

function confirmationState() {
  const hashQuery = window.location.hash.split('?')[1] || ''
  return new URLSearchParams(hashQuery).get('confirmation')
}

export default function AuthPage() {
  const { t } = useLanguage()
  const [mode, setMode] = useState(initialMode)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [captchaToken, setCaptchaToken] = useState(null)
  const [captchaResetKey, setCaptchaResetKey] = useState(0)
  const receiveCaptchaToken = useCallback((token) => setCaptchaToken(token), [])
  const isEmailConfirmationCallback = new URLSearchParams(window.location.search).get('auth') === 'confirmed'

  useEffect(() => {
    setCaptchaToken(null)
    setPasswordConfirmation('')
  }, [mode])

  useEffect(() => {
    const state = confirmationState()
    if (state === 'success') setMessage(t('emailConfirmed'))
    if (state === 'failed') setError(t('emailConfirmationFailed'))
  }, [t])

  useEffect(() => {
    if (!isEmailConfirmationCallback) return undefined
    let active = true
    const callbackParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))

    async function finishEmailConfirmation() {
      setMode('login')
      setBusy(true)
      let failed = callbackParams.has('error') || !supabase
      if (!failed && supabase) {
        try {
          const { data, error: sessionError } = await supabase.auth.getSession()
          failed = Boolean(sessionError || !data.session)
          if (data.session) await supabase.auth.signOut({ scope: 'local' })
        } catch {
          failed = true
        }
      }
      if (!active) return
      const confirmation = failed ? 'failed' : 'success'
      window.history.replaceState({}, '', `${window.location.pathname}#/auth?mode=login&confirmation=${confirmation}`)
      window.dispatchEvent(new HashChangeEvent('hashchange'))
      setBusy(false)
      if (failed) setError(t('emailConfirmationFailed'))
      else setMessage(t('emailConfirmed'))
    }

    finishEmailConfirmation()
    return () => { active = false }
  }, [isEmailConfirmationCallback, t])

  const heading = useMemo(() => t({ register: 'registerStudentTitle', forgot: 'resetPasswordTitle', reset: 'choosePasswordTitle', login: 'welcomeTitle' }[mode]), [mode, t])

  async function submit(event) {
    event.preventDefault()
    setError(null)
    setMessage(null)
    if (!isSupabaseConfigured) {
      setError(t('authNotConfigured'))
      return
    }

    if (mode !== 'forgot' && password !== passwordConfirmation) {
      setError(t('passwordMismatch'))
      return
    }

    setBusy(true)
    try {
      if (mode === 'register') {
        const emailRedirectTo = getAuthRedirectUrl('confirmed')
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { captchaToken: captchaToken || undefined, emailRedirectTo, data: { display_name: displayName.trim() } },
        })
        if (signUpError) throw signUpError
        setMessage(t('accountCreated'))
      } else if (mode === 'forgot') {
        const redirectTo = getAuthRedirectUrl('recovery')
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { captchaToken: captchaToken || undefined, redirectTo })
        if (resetError) throw resetError
        setMessage(t('resetSent'))
      } else if (mode === 'reset') {
        if (password !== passwordConfirmation) throw new Error(t('passwordMismatch'))
        const { error: updateError } = await supabase.auth.updateUser({ password })
        if (updateError) throw updateError
        window.history.replaceState({}, '', `${window.location.pathname}#/auth?mode=login`)
        window.dispatchEvent(new HashChangeEvent('hashchange'))
        setPassword('')
        setPasswordConfirmation('')
        setMode('login')
        setMessage(t('passwordChanged'))
      } else {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        const { data: signedInProfile, error: profileError } = await supabase.from('profiles').select('role').eq('id', signInData.user.id).single()
        if (profileError) throw profileError
        navigate(['owner', 'admin', 'teacher'].includes(signedInProfile.role) ? '/admin' : '/app')
      }
    } catch (authError) {
      setError(authError.message || t('authFailed'))
      if (mode === 'register' || mode === 'forgot') setCaptchaResetKey((value) => value + 1)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <header className="auth-header">
        <button className="text-button" onClick={() => navigate('/')} type="button"><ArrowLeft size={18} /> {t('publicHome')}</button>
        <LanguageSwitch />
      </header>

      <main className="auth-card">
        <Brand />
        <div className="auth-card__heading">
          <span className="eyebrow">{t('accountName')}</span>
          <h1>{heading}</h1>
          <p>{mode === 'register' ? t('registerDescription') : mode === 'reset' ? t('resetDescription') : t('loginDescription')}</p>
        </div>

        {mode === 'register' ? (
          <div className="auth-role-policy">
            <div><strong>{t('studentRegistration')}</strong><span>{t('selfRegister')}</span></div>
            <div><strong>{t('teacherAccount')}</strong><span>{t('ownerGrantsAccess')}</span></div>
            <div><strong>{t('adminAccount')}</strong><span>{t('ownerOnlyAccess')}</span></div>
          </div>
        ) : mode === 'login' ? <p className="auth-staff-note">{t('staffLoginNote')}</p> : null}

        <form onSubmit={submit}>
          {mode === 'register' ? (
            <label>
              <span>{t('displayName')}</span>
              <input autoComplete="name" onChange={(event) => setDisplayName(event.target.value)} required type="text" value={displayName} />
            </label>
          ) : null}
          {mode === 'reset' ? null : (
            <label>
              <span>{t('email')}</span>
              <span className="input-with-icon"><Mail size={18} /><input autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></span>
            </label>
          )}
          {mode === 'forgot' ? null : (
            <label>
              <span>{mode === 'reset' ? t('newPassword') : t('password')}</span>
              <span className="input-with-icon"><input autoComplete={mode === 'register' || mode === 'reset' ? 'new-password' : 'current-password'} minLength={8} onChange={(event) => setPassword(event.target.value)} required type={showPassword ? 'text' : 'password'} value={password} /><button aria-label={showPassword ? t('hidePassword') : t('showPassword')} onClick={() => setShowPassword((value) => !value)} type="button">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span>
            </label>
          )}
          {mode === 'register' || mode === 'login' || mode === 'reset' ? (
            <label>
              <span>{mode === 'reset' ? t('confirmNewPassword') : t('confirmPassword')}</span>
              <span className="input-with-icon"><input autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} onChange={(event) => setPasswordConfirmation(event.target.value)} required type={showPassword ? 'text' : 'password'} value={passwordConfirmation} /></span>
            </label>
          ) : null}

          {mode === 'register' || mode === 'forgot' ? <TurnstileWidget key={mode} onToken={receiveCaptchaToken} resetKey={captchaResetKey} /> : null}

          {error ? <p className="form-message form-message--error">{error}</p> : null}
          {message ? <p className="form-message form-message--success"><CheckCircle2 size={18} />{message}</p> : null}

          <button className="button button--primary button--block" disabled={busy || (Boolean(turnstileSiteKey) && (mode === 'register' || mode === 'forgot') && !captchaToken)} type="submit">
            {busy ? <LoaderCircle className="spin" size={18} /> : null}
            {mode === 'register' ? t('registerEmail') : mode === 'forgot' ? t('sendResetLink') : mode === 'reset' ? t('saveNewPassword') : t('login')}
          </button>
        </form>

        <div className="auth-card__links">
          {mode === 'login' ? <button onClick={() => setMode('forgot')} type="button">{t('forgotPassword')}?</button> : null}
          {mode === 'reset' ? null : (
            <button onClick={() => setMode(mode === 'register' ? 'login' : 'register')} type="button">
              {mode === 'register' ? t('alreadyRegistered') : t('noAccount')}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
