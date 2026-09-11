import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../config'
import Avatar from '../components/Avatar'

function formatCountdown(activeEndsAt) {
  if (!activeEndsAt) return 'Ended'
  const diff = new Date(activeEndsAt).getTime() - Date.now()
  if (diff <= 0) return 'Ended'
  const totalSeconds = Math.floor(diff / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes > 60) {
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m`
  }
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`
}

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!user) return

    async function fetchUserRooms() {
      setLoading(true)
      setError('')
      try {
        const data = await apiFetch(`/rooms/user/${user.id}`)
        setRooms(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserRooms()
  }, [user])

  // Live timer tick for cards countdown display
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  async function handleDeleteRoom(e, roomId) {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this room? This action cannot be undone.')) return

    try {
      await apiFetch(`/rooms/${roomId}`, { method: 'DELETE' })
      setRooms((prev) => prev.filter((r) => r.id !== roomId))
    } catch (err) {
      setError(err.message)
    }
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full glass-card p-8 text-center space-y-4 border border-[var(--color-border-subtle)] rounded-sm">
          <div className="w-12 h-12 rounded-sm bg-[var(--color-bg-mint)] text-[var(--color-forest)] flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[var(--color-forest)]">Authentication Required</h2>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            Please log in with your Google account to access your profile and view your created rooms.
          </p>
          <Link to="/login?redirect=/profile" className="btn-primary text-xs uppercase tracking-wider font-bold inline-block py-3 px-6">
            Log In With Google
          </Link>
        </div>
      </div>
    )
  }

  const activeRoomsCount = rooms.filter((r) => r.status === 'active').length
  const endedRoomsCount = rooms.filter((r) => r.status !== 'active').length

  return (
    <div className="relative min-h-[calc(100vh-4rem)] px-4 py-10 max-w-6xl mx-auto space-y-8">
      {/* Profile Header Banner */}
      <div className="bg-white border border-[var(--color-border-subtle)] rounded-sm p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Avatar src={user.picture} name={user.name} className="w-16 h-16 text-xl border-2 border-[var(--color-forest)]" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-forest)] tracking-tight">
              {user.name}
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)] font-mono">{user.email}</p>
          </div>
        </div>

        {/* User Stats */}
        <div className="flex items-center gap-4 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-[var(--color-border-subtle)] pt-4 sm:pt-0 sm:pl-6">
          <div className="text-center p-3 bg-[var(--color-bg-mint)] rounded-sm border border-[var(--color-border-subtle)] flex-1 sm:flex-none sm:w-28">
            <p className="text-xl font-black text-[var(--color-forest)]">{rooms.length}</p>
            <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Total Created</p>
          </div>
          <div className="text-center p-3 bg-emerald-50 rounded-sm border border-emerald-200 flex-1 sm:flex-none sm:w-28">
            <p className="text-xl font-black text-emerald-800">{activeRoomsCount}</p>
            <p className="text-[10px] font-bold text-emerald-700 uppercase">Active Now</p>
          </div>
          <div className="text-center p-3 bg-zinc-50 rounded-sm border border-zinc-200 flex-1 sm:flex-none sm:w-28">
            <p className="text-xl font-black text-zinc-700">{endedRoomsCount}</p>
            <p className="text-[10px] font-bold text-zinc-500 uppercase">Ended / Archived</p>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[var(--color-forest)] tracking-tight">
            Rooms Created By You
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Manage and view discussions you have hosted.
          </p>
        </div>
        <Link to="/create" className="btn-primary text-xs font-bold !py-2 !px-4 uppercase tracking-wider">
          + Create New Room
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white border border-[var(--color-border-subtle)] rounded-sm p-6 h-48 animate-pulse space-y-4">
              <div className="h-5 bg-[var(--color-bg-input)] rounded-sm w-3/4" />
              <div className="h-4 bg-[var(--color-bg-input)] rounded-sm w-1/2" />
              <div className="h-8 bg-[var(--color-bg-input)] rounded-sm mt-auto" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-sm bg-red-500/10 border border-red-500/20 text-red-700 font-medium text-center text-sm">
          {error}
        </div>
      ) : rooms.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4 max-w-md mx-auto my-8 border border-[var(--color-border-subtle)] rounded-sm">
          <div className="w-12 h-12 rounded-sm bg-[var(--color-bg-mint)] text-[var(--color-forest)] flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-[var(--color-forest)]">No rooms created yet</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            You haven't created any rooms. Start your first real-time discussion now!
          </p>
          <button
            onClick={() => navigate('/create')}
            className="btn-primary text-xs uppercase tracking-wider font-bold mt-2"
          >
            Create a Room
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const isActive = room.status === 'active'
            const countdown = formatCountdown(room.active_ends_at)

            return (
              <div
                key={room.id}
                onClick={() => navigate(`/room/${room.id}`)}
                className="bg-white border border-[var(--color-border-subtle)] rounded-sm p-6 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-forest)] hover:shadow-md group relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${isActive ? 'bg-[var(--color-accent-lime)]' : 'bg-zinc-300'}`} />

                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteRoom(e, room.id)}
                  className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-sm text-[var(--color-text-muted)] hover:text-red-600 hover:bg-red-50 transition-all duration-150 opacity-0 group-hover:opacity-100 cursor-pointer z-10"
                  title="Delete room"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-bold text-base text-[var(--color-forest)] leading-snug line-clamp-2 pr-6">
                      {room.topic}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-extrabold uppercase tracking-wider ${
                        isActive
                          ? 'bg-[var(--color-accent-lime)] text-[var(--color-forest)]'
                          : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[var(--color-active)]' : 'bg-zinc-400'}`} />
                      {isActive ? 'Live' : 'Ended'}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)] font-mono">
                      {new Date(room.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Footer metadata */}
                <div className="pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)] font-medium">
                    <svg className="w-4 h-4 text-[var(--color-forest)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>
                      {room.participant_count ?? 0} / {room.max_participants}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-mono text-[var(--color-forest)] font-bold bg-[var(--color-bg-mint)] px-2 py-0.5 rounded-sm">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{isActive ? countdown : 'Ended'}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
