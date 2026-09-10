import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NicknameModal from '../components/NicknameModal'
import { getRoomSession, setRoomSession } from '../utils/session'
import { apiFetch } from '../config'

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

export default function BrowseRooms() {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState([])
  const [sort, setSort] = useState('recent') // 'recent' | 'active'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedRoom, setSelectedRoom] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')
  const [, setTick] = useState(0)

  // Fetch rooms list
  async function fetchRooms(showSpinner = true) {
    if (showSpinner) setLoading(true)
    setError('')
    try {
      const data = await apiFetch(`/rooms?sort=${sort}`)
      setRooms(data)
    } catch (err) {
      setError(err.message)
    } finally {
      if (showSpinner) setLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms(true)
    const interval = setInterval(() => fetchRooms(false), 15000)
    return () => clearInterval(interval)
  }, [sort])

  // Live timer tick for cards countdown display
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  function handleCardClick(room) {
    // Check if user already has session stored for this room
    const { sessionToken: existingToken, nickname: existingNick } = getRoomSession(room.id)

    if (existingToken && existingNick) {
      navigate(`/room/${room.id}`, {
        state: { sessionToken: existingToken, nickname: existingNick },
      })
    } else {
      setSelectedRoom(room)
      setShowModal(true)
    }
  }

  async function handleJoinSubmit(nickname) {
    if (!selectedRoom) return
    setModalLoading(true)
    setModalError('')

    try {
      const data = await apiFetch(`/rooms/${selectedRoom.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      })

      setRoomSession(selectedRoom.id, data.session_token, data.nickname)
      setShowModal(false)

      navigate(`/room/${selectedRoom.id}`, {
        state: { sessionToken: data.session_token, nickname: data.nickname },
      })
    } catch (err) {
      setModalError(err.message)
    } finally {
      setModalLoading(false)
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] px-4 py-10 max-w-6xl mx-auto">
      <NicknameModal
        isOpen={showModal}
        topic={selectedRoom?.topic}
        onSubmit={handleJoinSubmit}
        isLoading={modalLoading}
        error={modalError}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-[var(--color-forest)] tracking-tight mb-1">
            Active <span className="underline decoration-[var(--color-accent-lime)] decoration-4 underline-offset-2">Rooms</span>
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Explore live ephemeral discussions. Jump into any room before it auto-expires.
          </p>
        </div>

        {/* Sort Toggle */}
        <div className="flex items-center p-1 rounded-sm bg-white border border-[var(--color-border-subtle)] self-start sm:self-auto">
          <button
            onClick={() => setSort('ending_soon')}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
              sort === 'ending_soon'
                ? 'bg-[var(--color-forest)] text-[var(--color-accent-lime)] shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-forest)]'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ending Soon
          </button>
          <button
            onClick={() => setSort('active')}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
              sort === 'active'
                ? 'bg-[var(--color-forest)] text-[var(--color-accent-lime)] shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-forest)]'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Most Active
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
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
        <div className="glass-card p-12 text-center space-y-4 max-w-md mx-auto my-12 border border-[var(--color-border-subtle)] rounded-sm">
          <div className="w-12 h-12 rounded-sm bg-[var(--color-bg-mint)] text-[var(--color-forest)] flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-[var(--color-forest)]">No active rooms right now</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Be the pioneer! Create a fresh room and invite your friends to talk.
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
            const isHighActivity = (room.recent_message_count || 0) >= 3
            const countdown = formatCountdown(room.active_ends_at)

            return (
              <div
                key={room.id}
                onClick={() => handleCardClick(room)}
                className="bg-white border border-[var(--color-border-subtle)] rounded-sm p-6 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-forest)] hover:shadow-md group relative overflow-hidden"
              >
                {/* Subtle top lime indicator bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-accent-lime)] opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Topic & Badges */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-bold text-base text-[var(--color-forest)] leading-snug line-clamp-2 group-hover:text-[var(--color-forest)] transition-colors">
                      {room.topic}
                    </h3>
                    {isHighActivity && (
                      <span className="flex-shrink-0 px-2 py-0.5 rounded-sm bg-[var(--color-accent-lime)] text-[var(--color-forest)] text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Active
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[var(--color-text-muted)] mb-4">
                    Host: <span className="font-medium text-[var(--color-text-secondary)]">{room.creator_nickname}</span>
                  </p>
                </div>

                {/* Footer metadata */}
                <div className="pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs">
                  {/* Spots filled */}
                  <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)] font-medium">
                    <svg className="w-4 h-4 text-[var(--color-forest)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>
                      {room.participant_count ?? 0} / {room.max_participants} spots
                    </span>
                  </div>

                  {/* Countdown */}
                  <div className="flex items-center gap-1 font-mono text-[var(--color-forest)] font-bold bg-[var(--color-bg-mint)] px-2 py-0.5 rounded-sm">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{countdown}</span>
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
