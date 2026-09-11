import { useEffect, useRef } from 'react'
import { apiFetch } from '../config'
import { useAuth } from '../context/AuthContext'

const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client'

export default function GoogleOneTap({ clientId, onAuthenticated }) {
  const buttonRef = useRef(null)
  const { user, login } = useAuth()

  useEffect(() => {
    if (user || !clientId) return undefined
    if (!window.isSecureContext && window.location.hostname !== 'localhost') return undefined

    let cancelled = false

    const handleCredential = async (response) => {
      try {
        const data = await apiFetch('/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential }),
        })

        if (!cancelled && data?.user) {
          login(data.user)
          onAuthenticated?.(data.user)
        }
      } catch (error) {
        console.error('Google One Tap login failed:', error)
      }
    }

    const initialize = () => {
      if (cancelled || !window.google?.accounts?.id) return

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential,
        auto_select: false,
        cancel_on_tap_outside: false,
      })
      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'medium',
          text: 'signin_with',
          shape: 'rectangular',
        })
      }
      window.google.accounts.id.prompt()
    }

    const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_URL}"]`)
    if (existingScript) {
      existingScript.addEventListener('load', initialize)
      initialize()
      return () => {
        cancelled = true
        existingScript.removeEventListener('load', initialize)
      }
    }

    const script = document.createElement('script')
    script.src = GOOGLE_SCRIPT_URL
    script.async = true
    script.defer = true
    script.onload = initialize
    document.head.appendChild(script)

    return () => {
      cancelled = true
      script.onload = null
    }
  }, [clientId, user, login, onAuthenticated])

  if (user || !clientId) return null

  return <div ref={buttonRef} className="shrink-0 flex items-center justify-center min-h-[40px]" aria-label="Sign in with Google" />
}