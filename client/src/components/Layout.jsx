import { Outlet, Link, useLocation } from 'react-router-dom'

export default function Layout() {
  const location = useLocation()
  const isLanding = location.pathname === '/'

  return (
    <div className="min-h-screen flex flex-col bg-grid bg-[var(--color-bg-primary)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-sm bg-[var(--color-forest)] flex items-center justify-center text-[var(--color-accent-lime)] font-extrabold text-sm transition-transform duration-150 group-hover:scale-105">
              H
            </div>
            <span className="text-xl font-black text-[var(--color-forest)] tracking-tight">
              Huddle
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-4">
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
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
    </div>
  )
}
