import { Outlet, Link, useLocation } from 'react-router-dom'
import logoImg from '../assets/logo.png'
import GoogleOneTap from './GoogleOneTap'
import Avatar from './Avatar'
import { GOOGLE_CLIENT_ID } from '../config'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const location = useLocation()
  const isLanding = location.pathname === '/'
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-grid bg-[var(--color-bg-primary)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src={logoImg}
              alt="Huddle Logo"
              className="w-8 h-8 object-contain transition-transform duration-150 group-hover:scale-105"
            />
            <span className="text-xl font-black text-[var(--color-forest)] tracking-tight">
              Huddle
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-3 sm:gap-4">
            {!isLanding && (
              <Link
                to="/browse"
                className="text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-forest)] transition-colors duration-150"
              >
                Browse Rooms
              </Link>
            )}
            <Link to="/create" className="btn-primary text-xs font-bold !py-2 !px-4 uppercase tracking-wider">
              Create Room
            </Link>

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-[var(--color-border-subtle)]">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-xs font-bold text-[var(--color-forest)] hover:opacity-80 transition-opacity"
                  title="View Profile"
                >
                  <Avatar src={user.picture} name={user.name} className="w-7 h-7 text-[10px]" />
                  <span className="hidden sm:inline-block max-w-[120px] truncate">{user.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-xs font-semibold text-[var(--color-text-muted)] hover:text-red-600 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <GoogleOneTap clientId={GOOGLE_CLIENT_ID} />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border-subtle)] bg-white/50 backdrop-blur-sm py-4 px-6 text-center text-xs text-[var(--color-text-muted)] font-mono">
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          <span>&copy; {new Date().getFullYear()} Huddle Platform</span>
        </div>
      </footer>
    </div>
  )
}
