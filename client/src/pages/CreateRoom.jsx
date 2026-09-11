import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { setRoomSession } from '../utils/session'
import { apiFetch } from '../config'
import { useAuth } from '../context/AuthContext'

const DURATION_PRESETS = [
  { label: '30 min', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
]

export default function CreateRoom() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [topic, setTopic] = useState('')
  const [nickname, setNickname] = useState(user?.name || '')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [customDuration, setCustomDuration] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [maxParticipants, setMaxParticipants] = useState(20)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full glass-card p-8 text-center space-y-4 border border-[var(--color-border-subtle)] rounded-sm">
          <div className="w-12 h-12 rounded-sm bg-[var(--color-bg-mint)] text-[var(--color-forest)] flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[var(--color-forest)]">Authentication Required</h2>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            Please log in with your Google account to create a room.
          </p>
          <Link to="/login?redirect=/create" className="btn-primary text-xs uppercase tracking-wider font-bold inline-block py-3 px-6">
            Log In With Google
          </Link>
        </div>
      </div>
    )
  }

  const activeDuration = isCustom ? Number(customDuration) : durationMinutes

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!topic.trim() || !nickname.trim()) {
      setError('Topic and nickname are required.')
      return
    }
    if (!activeDuration || activeDuration < 1) {
      setError('Duration must be at least 1 minute.')
      return
    }

    setSubmitting(true)
    try {
      // 1. Create the room
      const room = await apiFetch('/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          creatorNickname: nickname.trim(),
          creatorUserId: user?.id || null,
          durationMinutes: activeDuration,
          maxParticipants,
        }),
      })

      // 2. Auto-join as the creator
      const participant = await apiFetch(`/rooms/${room.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim() }),
      })

      // Save room session locally so tab close / page refresh keeps the session
      setRoomSession(room.id, participant.session_token, participant.nickname)

      // 3. Navigate to the chat room with session data
      navigate(`/room/${room.id}`, {
        state: {
          sessionToken: participant.session_token,
          nickname: participant.nickname,
        },
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-forest)] tracking-tight mb-2">
            Create a <span className="underline decoration-[var(--color-accent-lime)] decoration-4 underline-offset-2">Room</span>
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Set the topic, pick a timer, and start the conversation.
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="relative bg-white border border-[var(--color-border-subtle)] rounded-sm p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Close Button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-sm text-[var(--color-text-muted)] hover:text-[var(--color-forest)] hover:bg-[var(--color-bg-mint)] transition-all duration-150 cursor-pointer"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* Topic */}
          <div>
            <label htmlFor="topic" className="block text-xs font-bold uppercase tracking-wider text-[var(--color-forest)] mb-2">
              Topic
            </label>
            <input
              id="topic"
              type="text"
              className="input-field"
              placeholder="e.g. Product Design & UI Discussion"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              maxLength={120}
              autoFocus
            />
            <p className="mt-1 text-xs text-[var(--color-text-muted)] text-right font-mono">
              {topic.length}/120
            </p>
          </div>

          {/* Your Nickname */}
          <div>
            <label htmlFor="nickname" className="block text-xs font-bold uppercase tracking-wider text-[var(--color-forest)] mb-2">
              Your Nickname
            </label>
            <input
              id="nickname"
              type="text"
              className="input-field"
              placeholder="e.g. alex"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={30}
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-forest)] mb-3">
              Duration
            </label>
            <div className="flex flex-wrap gap-2">
              {DURATION_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    setDurationMinutes(preset.value)
                    setIsCustom(false)
                  }}
                  className={`px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                    !isCustom && durationMinutes === preset.value
                      ? 'bg-[var(--color-forest)] text-[var(--color-accent-lime)] border border-[var(--color-forest)]'
                      : 'bg-white border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-forest)]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={`px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                  isCustom
                    ? 'bg-[var(--color-forest)] text-[var(--color-accent-lime)] border border-[var(--color-forest)]'
                    : 'bg-white border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-forest)]'
                }`}
              >
                Custom
              </button>
            </div>
            {isCustom && (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="1440"
                  className="input-field !w-24 font-mono text-sm"
                  placeholder="45"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                />
                <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase">minutes</span>
              </div>
            )}
          </div>

          {/* Max Participants */}
          <div>
            <label htmlFor="maxParticipants" className="block text-xs font-bold uppercase tracking-wider text-[var(--color-forest)] mb-2">
              Max Participants
              <span className="ml-2 inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-sm bg-[var(--color-bg-mint)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-forest)] font-mono font-bold">
                {maxParticipants}
              </span>
            </label>
            <input
              id="maxParticipants"
              type="range"
              min="2"
              max="50"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(Number(e.target.value))}
              className="w-full h-2 rounded-none appearance-none cursor-pointer
                bg-[var(--color-bg-input)] accent-[var(--color-forest)]
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-none
                [&::-webkit-slider-thumb]:bg-[var(--color-forest)]
                [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between mt-1 text-xs text-[var(--color-text-muted)] font-mono">
              <span>2</span>
              <span>50</span>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 rounded-sm bg-red-500/10 border border-red-500/20 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full text-center text-xs uppercase tracking-wider font-bold !py-3.5"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating…
              </span>
            ) : (
              'Create & Join Room'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
