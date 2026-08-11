import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../lib/i18n.jsx'

export const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() || ''

let turnstileLoader

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (turnstileLoader) return turnstileLoader
  turnstileLoader = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-liuliuliu-turnstile]')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.turnstile), { once: true })
      existingScript.addEventListener('error', reject, { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.dataset.liuliuliuTurnstile = 'true'
    script.onload = () => resolve(window.turnstile)
    script.onerror = reject
    document.head.appendChild(script)
  })
  return turnstileLoader
}

export default function TurnstileWidget({ onToken, resetKey }) {
  const { l } = useLanguage()
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!turnstileSiteKey || !containerRef.current) return undefined
    let active = true
    loadTurnstile()
      .then((turnstile) => {
        if (!active || !turnstile || widgetIdRef.current !== null) return
        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: turnstileSiteKey,
          language: 'vi',
          theme: 'light',
          callback: (token) => onToken(token),
          'expired-callback': () => onToken(null),
          'error-callback': () => { onToken(null); setError(l('Không thể xác minh. Vui lòng thử lại.', 'Unable to verify. Please try again.', '无法完成验证，请重试。')) },
        })
      })
      .catch(() => active && setError(l('Không thể tải bước xác minh.', 'Unable to load verification.', '无法加载验证。')))

    return () => {
      active = false
      if (window.turnstile && widgetIdRef.current !== null) window.turnstile.remove(widgetIdRef.current)
      widgetIdRef.current = null
    }
  }, [l, onToken])

  useEffect(() => {
    if (window.turnstile && widgetIdRef.current !== null) {
      window.turnstile.reset(widgetIdRef.current)
      onToken(null)
    }
  }, [resetKey, onToken])

  if (!turnstileSiteKey) return null
  return <div className="turnstile-field"><div ref={containerRef} />{error ? <p className="form-message form-message--error">{error}</p> : null}</div>
}
