import { useState } from 'react'

export default function NicknameModal({ isOpen, topic, onSubmit, isLoading, error: externalError, defaultNickname = '' }) {
  const [nickname, setNickname] = useState(defaultNickname)
  const [error, setError] = useState('')

  if (!isOpen) return null

  function handleSubmit(e) {
    e.preventDefault()
    if (!nickname.trim()) {
      setError('Please enter a nickname.')
      return
    }
    setError('')
    onSubmit(nickname.trim())
  }

  const activeError = externalError || error

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-md p-6 sm:p-8 relative shadow-xl border border-[var(--color-border-subtle)] rounded-sm">
        <h2 className="text-2xl font-black text-[var(--color-forest)] tracking-tight mb-1">Join Room</h2>
        {topic && (
          <p className="text-sm text-[var(--color-text-secondary)] mb-6 line-clamp-2">
            <span className="text-[var(--color-text-muted)] font-semibold">Topic:</span> "{topic}"
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="modal-nickname" className="block text-xs font-bold uppercase tracking-wider text-[var(--color-forest)] mb-2">
              Choose a Nickname
            </label>
            <input
              id="modal-nickname"
              type="text"
              className="input-field"
              placeholder="e.g. alex"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={30}
              autoFocus
            />
          </div>

          {activeError && (
            <div className="p-3 rounded-sm bg-red-500/10 border border-red-500/20 text-red-700 text-xs font-medium">
              {activeError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full text-center py-3 text-xs uppercase tracking-wider font-bold cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Joining…
              </span>
            ) : (
              'Join Conversation'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
