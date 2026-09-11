import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../config'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/Avatar'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [passcode, setPasscode] = useState(
    () => localStorage.getItem('huddle_admin_passcode') || ''
  )
  const [inputPasscode, setInputPasscode] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const fetchStats = async (keyToUse = passcode) => {
    if (!keyToUse) {
      setIsAuthenticated(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await apiFetch('/api/admin/stats', {
        headers: {
          'x-admin-key': keyToUse,
        },
      })
      setStats(data)
      setIsAuthenticated(true)
      localStorage.setItem('huddle_admin_passcode', keyToUse)
    } catch (err) {
      setError(err.message || 'Failed to authenticate admin access')
      setIsAuthenticated(false)
      if (err.message?.toLowerCase().includes('unauthorized') || err.message?.toLowerCase().includes('passcode')) {
        localStorage.removeItem('huddle_admin_passcode')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && passcode) {
      fetchStats(passcode)
    }
  }, [user])

  const handlePasscodeSubmit = (e) => {
    e.preventDefault()
    if (!inputPasscode.trim()) return
    setPasscode(inputPasscode.trim())
    fetchStats(inputPasscode.trim())
  }

  const handleLogoutAdmin = () => {
    localStorage.removeItem('huddle_admin_passcode')
    setPasscode('')
    setInputPasscode('')
    setIsAuthenticated(false)
    setStats(null)
    setError('')
  }

  // 1. Google Authentication Gate
  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full glass-card p-8 text-center space-y-5 border border-[var(--color-border-subtle)] rounded-sm shadow-md bg-white">
          <div className="w-14 h-14 rounded-sm bg-emerald-50 text-[var(--color-forest)] flex items-center justify-center mx-auto border border-emerald-200">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-[var(--color-forest)] tracking-tight">Admin Authentication Required</h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-2 leading-relaxed">
              You must be signed in with a valid Google account to access the Admin Portal.
            </p>
          </div>
          <Link to="/login?redirect=/admin" className="btn-primary text-xs font-bold py-3.5 px-6 uppercase tracking-wider block text-center cursor-pointer">
            Sign In With Google First
          </Link>
        </div>
      </div>
    )
  }

  // Passcode Lock Gate UI
  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full glass-card p-8 text-center space-y-6 border border-[var(--color-border-subtle)] rounded-sm shadow-md bg-white">
          <div className="w-14 h-14 rounded-sm bg-emerald-50 text-[var(--color-forest)] flex items-center justify-center mx-auto border border-emerald-200">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <div>
            <h2 className="text-2xl font-black text-[var(--color-forest)] tracking-tight">Admin Gatekeeper</h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 leading-relaxed">
              This area is restricted. Enter your admin passcode (`ADMIN_KEY`) to access user analytics.
            </p>
          </div>

          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter Admin Passcode..."
                value={inputPasscode}
                onChange={(e) => setInputPasscode(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-sm border border-[var(--color-border-subtle)] bg-[var(--color-bg-input)] focus:outline-none focus:border-[var(--color-forest)] font-mono text-center tracking-widest"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-xs font-bold py-3 uppercase tracking-wider disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Verifying Passcode...' : 'Unlock Admin Dashboard'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  const filteredUsers = (stats?.users || []).filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white border border-[var(--color-border-subtle)] rounded-sm p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-sm bg-[var(--color-bg-mint)] text-[var(--color-forest)] text-[10px] font-extrabold uppercase tracking-wider">
              Admin Portal
            </span>
            <span className="px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
              Authenticated
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-forest)] tracking-tight mt-1">
            User Analytics & Dashboard
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Overview of total signed-in users and real-time platform activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchStats(passcode)}
            disabled={loading}
            className="btn-primary text-xs font-bold !py-2.5 !px-4 uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>

          <button
            onClick={handleLogoutAdmin}
            className="text-xs font-bold text-[var(--color-text-muted)] hover:text-red-600 border border-[var(--color-border-subtle)] px-3 py-2.5 rounded-sm transition-colors cursor-pointer"
            title="Lock Admin Session"
          >
            Lock Admin
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Signed-in Users */}
        <div className="bg-white border border-[var(--color-border-subtle)] rounded-sm p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-sm bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-black text-[var(--color-forest)]">
              {stats ? (stats.signedInUsers ?? stats.totalUsers) : '-'}
            </p>
            <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              Signed-in Users {stats?.totalUsers !== undefined && `(${stats.signedInUsers}/${stats.totalUsers})`}
            </p>
          </div>
        </div>

        {/* Total Rooms */}
        <div className="bg-white border border-[var(--color-border-subtle)] rounded-sm p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-sm bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200 shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-black text-[var(--color-forest)]">{stats ? stats.totalRooms : '-'}</p>
            <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Total Rooms</p>
          </div>
        </div>

        {/* Active Rooms */}
        <div className="bg-white border border-[var(--color-border-subtle)] rounded-sm p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-sm bg-lime-50 text-lime-800 flex items-center justify-center border border-lime-200 shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-black text-lime-900">{stats ? stats.activeRooms : '-'}</p>
            <p className="text-[11px] font-bold text-lime-700 uppercase tracking-wider">Live Active Rooms</p>
          </div>
        </div>

        {/* Total Messages */}
        <div className="bg-white border border-[var(--color-border-subtle)] rounded-sm p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-sm bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-black text-[var(--color-forest)]">{stats ? stats.totalMessages : '-'}</p>
            <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Messages Sent</p>
          </div>
        </div>
      </div>

      {/* Users List Section */}
      <div className="bg-white border border-[var(--color-border-subtle)] rounded-sm shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[var(--color-border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-[var(--color-forest)]">User Registry</h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              List of registered Google authentication users and their current sign-in status.
            </p>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search user by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-sm border border-[var(--color-border-subtle)] bg-[var(--color-bg-input)] focus:outline-none focus:border-[var(--color-forest)] font-mono"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-[var(--color-text-muted)]">
            Loading user registry...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--color-text-muted)]">
            {search ? 'No users matching search query.' : 'No users registered yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-[var(--color-border-subtle)] text-[var(--color-text-muted)] uppercase font-mono text-[10px]">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">First Login</th>
                  <th className="py-3 px-4">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)] font-mono text-[11px]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <Avatar src={u.picture} name={u.name} className="w-8 h-8 text-xs shrink-0" />
                      <span className="font-sans font-bold text-[var(--color-forest)]">{u.name}</span>
                    </td>
                    <td className="py-3 px-4 text-[var(--color-text-secondary)]">{u.email}</td>
                    <td className="py-3 px-4">
                      {u.is_signed_in !== false ? (
                        <span className="px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                          Signed In
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-sm bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase">
                          Signed Out
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[var(--color-text-muted)]">
                      {new Date(u.signed_in_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-[var(--color-forest)] font-semibold">
                      {new Date(u.last_active_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
