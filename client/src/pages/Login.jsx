import { useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import GoogleOneTap from '../components/GoogleOneTap'
import { GOOGLE_CLIENT_ID } from '../config'
import { useAuth } from '../context/AuthContext'
import logoImg from '../assets/logo.png'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const redirect = searchParams.get('redirect') || '/browse'

  useEffect(() => {
    if (user) {
      navigate(redirect, { replace: true })
    }
  }, [user, navigate, redirect])

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-[var(--color-border-subtle)] rounded-sm p-8 shadow-sm text-center space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <img src={logoImg} alt="Huddle Logo" className="w-12 h-12 object-contain" />
          <h1 className="text-2xl font-black text-[var(--color-forest)] tracking-tight">
            Sign In to <span className="underline decoration-[var(--color-accent-lime)] decoration-4 underline-offset-2">Huddle</span>
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed max-w-xs">
            Log in with your Google account to create rooms, join live conversations, and view your room history.
          </p>
        </div>

        {/* Google One Tap & Sign-in Button */}
        <div className="flex flex-col items-center justify-center p-4 bg-[var(--color-bg-mint)] border border-[var(--color-border-subtle)] rounded-sm space-y-3">
          <GoogleOneTap clientId={GOOGLE_CLIENT_ID} />
          {!GOOGLE_CLIENT_ID && (
            <p className="text-xs text-red-600 font-semibold">
              Google Client ID is not configured.
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-[var(--color-border-subtle)]">
          <Link
            to="/browse"
            className="text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-forest)] transition-colors"
          >
            ← Back to Browse Rooms (Guest View)
          </Link>
        </div>
      </div>
    </div>
  )
}
