import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import NicknameModal from '../components/NicknameModal'
import { getRoomSession, setRoomSession, clearRoomSession } from '../utils/session'
import { API_BASE, apiFetch } from '../config'

// Avatar background color generator based on nickname
const AVATAR_COLORS = [
  'from-pink-500 to-rose-500',
  'from-purple-500 to-indigo-500',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-violet-500 to-purple-500',
]

function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function formatTimeRemaining(activeEndsAt) {
  if (!activeEndsAt) return '00:00'
  const diff = new Date(activeEndsAt).getTime() - Date.now()
  if (diff <= 0) return 'Ended'
  const totalSeconds = Math.floor(diff / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export default function ChatRoom() {
  const { id: roomId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const savedSession = getRoomSession(roomId)

  const [room, setRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [participants, setParticipants] = useState(new Set())
  const [sessionToken, setSessionToken] = useState(
    location.state?.sessionToken || savedSession.sessionToken || ''
  )
  const [nickname, setNickname] = useState(
    location.state?.nickname || savedSession.nickname || ''
  )

  const [inputMessage, setInputMessage] = useState('')
  const [showNicknameModal, setShowNicknameModal] = useState(!sessionToken || !nickname)
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState('')
  const [copied, setCopied] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState('')
  const [isEnded, setIsEnded] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Sync state into persistent storage
  useEffect(() => {
    if (sessionToken && nickname) {
      setRoomSession(roomId, sessionToken, nickname)
    }
  }, [roomId, sessionToken, nickname])

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch room metadata & initial messages
  useEffect(() => {
    async function loadRoomData() {
      try {
        const roomData = await apiFetch(`/rooms/${roomId}`)
        setRoom(roomData)

        if (roomData.status === 'archived' || roomData.status === 'expired' || new Date() > new Date(roomData.active_ends_at)) {
          setIsEnded(true)
        }

        try {
          const msgData = await apiFetch(`/rooms/${roomId}/messages`)
          setMessages(msgData)
        } catch {
          // Ignore message load error if room is newly created
        }
      } catch (err) {
        console.error('Error fetching room:', err)
        navigate('/browse', { replace: true })
      }
    }
    loadRoomData()
  }, [roomId, navigate])

  // Live countdown timer
  useEffect(() => {
    if (!room?.active_ends_at) return

    const updateTimer = () => {
      const remaining = formatTimeRemaining(room.active_ends_at)
      setTimeRemaining(remaining)
      if (remaining === 'Ended') {
        setIsEnded(true)
      }
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)
    return () => clearInterval(timer)
  }, [room?.active_ends_at])

  // Join Room API Call (when prompted via modal)
  async function handleJoinSubmit(selectedNickname) {
    setJoinLoading(true)
    setJoinError('')

    try {
      const data = await apiFetch(`/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: selectedNickname }),
      })

      setSessionToken(data.session_token)
      setNickname(data.nickname)
      setRoomSession(roomId, data.session_token, data.nickname)
      setShowNicknameModal(false)
    } catch (err) {
      setJoinError(err.message)
    } finally {
      setJoinLoading(false)
    }
  }

  // Socket.IO real-time connection
  useEffect(() => {
    if (!sessionToken || !nickname || showNicknameModal) return

    const socket = io(API_BASE || undefined)
    socketRef.current = socket

    socket.emit('join_room', { roomId, sessionToken }, (ack) => {
      if (ack?.error) {
        console.error('Socket join error:', ack.error)
        if (ack.error === 'This room has ended') {
          setIsEnded(true)
        } else if (ack.error === 'Invalid room or session token') {
          clearRoomSession(roomId)
          setSessionToken('')
          setNickname('')
          setShowNicknameModal(true)
          setJoinError('Session expired. Please enter a nickname to rejoin.')
        }
      }
    })

    socket.on('new_message', (msg) => {
      setMessages((prev) => [...prev, msg])
    })

    socket.on('user_joined', ({ nickname: joinedNick }) => {
      setMessages((prev) => [
        ...prev,
        { id: `sys-${Date.now()}`, type: 'system', text: `${joinedNick} joined the room` },
      ])
      setParticipants((prev) => new Set(prev).add(joinedNick))
    })

    socket.on('user_left', ({ nickname: leftNick }) => {
      setMessages((prev) => [
        ...prev,
        { id: `sys-${Date.now()}`, type: 'system', text: `${leftNick} left the room` },
      ])
      setParticipants((prev) => {
        const next = new Set(prev)
        next.delete(leftNick)
        return next
      })
    })

    socket.on('room_ended', () => {
      setIsEnded(true)
    })

    return () => {
      socket.disconnect()
    }
  }, [roomId, sessionToken, nickname, showNicknameModal])

  // Explicit Leave Room Handler
  async function handleLeaveRoom() {
    if (isLeaving) return
    setIsLeaving(true)

    try {
      if (sessionToken) {
        await apiFetch(`/rooms/${roomId}/leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionToken }),
        })
      }
    } catch (err) {
      console.error('Error leaving room:', err)
    } finally {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
      clearRoomSession(roomId)
      navigate('/browse', { replace: true })
    }
  }

  // Send Message
  function handleSendMessage(e) {
    e.preventDefault()
    if (!inputMessage.trim() || !socketRef.current || isEnded) return

    socketRef.current.emit('send_message', { body: inputMessage.trim() }, (ack) => {
      if (ack?.error) {
        alert(ack.error)
      } else {
        setInputMessage('')
      }
    })
  }

  // Copy share link
  function handleCopyShareLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col bg-[var(--color-bg-primary)]">
      <NicknameModal
        isOpen={showNicknameModal}
        topic={room?.topic}
        onSubmit={handleJoinSubmit}
        isLoading={joinLoading}
        error={joinError}
      />

      {/* Header Bar */}
      <div className="border-b border-[var(--color-border-subtle)] bg-white/90 backdrop-blur-md sticky top-16 z-10 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-[var(--color-forest)] line-clamp-1">{room?.topic || 'Chat Room'}</h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm text-xs font-bold uppercase tracking-wider ${
                    isEnded
                      ? 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                      : 'bg-[var(--color-bg-mint)] text-[var(--color-forest)] border border-[var(--color-border-subtle)]'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-none ${
                      isEnded ? 'bg-zinc-400' : 'bg-[var(--color-active)]'
                    }`}
                  />
                  {isEnded ? 'Archived' : 'Live'}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Created by <span className="font-medium text-[var(--color-forest)]">{room?.creator_nickname}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live Timer */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-[var(--color-bg-mint)] border border-[var(--color-border-subtle)]">
              <svg className="w-4 h-4 text-[var(--color-forest)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-mono text-sm font-bold text-[var(--color-forest)]">
                {timeRemaining}
              </span>
            </div>

            {/* Share Button */}
            <button
              onClick={handleCopyShareLink}
              className="btn-outline !py-1.5 !px-3 text-xs sm:text-sm flex items-center gap-1.5 rounded-sm"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-5.367 3 3 0 000 5.367zm0 8.474a3 3 0 100-5.367 3 3 0 000 5.367z" />
                  </svg>
                  <span>Share Room</span>
                </>
              )}
            </button>

            {/* Leave Room Button */}
            {!showNicknameModal && (
              <button
                onClick={handleLeaveRoom}
                disabled={isLeaving}
                className="px-3 py-1.5 rounded-sm text-xs sm:text-sm font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-all duration-150 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>{isLeaving ? 'Leaving…' : 'Leave Room'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Archive Warning Banner */}
      {isEnded && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs sm:text-sm text-amber-900 font-semibold flex items-center justify-center gap-2">
          <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          This room has auto-expired. Messages are preserved in read-only mode for 24 hours.
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col justify-between">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
          {messages.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-[var(--color-text-muted)] space-y-2">
              <svg className="w-12 h-12 text-[var(--color-forest)] opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm font-bold text-[var(--color-forest)]">No messages yet</p>
              <p className="text-xs">Be the first to start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              if (msg.type === 'system') {
                return (
                  <div key={msg.id || index} className="flex justify-center my-2">
                    <span className="text-xs px-3 py-1 rounded-sm bg-white border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] font-medium">
                      {msg.text}
                    </span>
                  </div>
                )
              }

              const isMe = msg.nickname === nickname

              return (
                <div
                  key={msg.id || index}
                  className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}
                >
                  {/* User Avatar */}
                  <div
                    className={`w-8 h-8 rounded-sm ${
                      isMe
                        ? 'bg-[var(--color-forest)] text-[var(--color-accent-lime)]'
                        : 'bg-[var(--color-bg-mint)] text-[var(--color-forest)] border border-[var(--color-border-subtle)]'
                    } flex items-center justify-center font-bold text-xs shrink-0`}
                  >
                    {msg.nickname ? msg.nickname[0].toUpperCase() : '?'}
                  </div>

                  {/* Message Bubble */}
                  <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end text-right' : ''}`}>
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-xs font-bold text-[var(--color-forest)]">
                        {msg.nickname}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                        {msg.created_at
                          ? new Date(msg.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'now'}
                      </span>
                    </div>

                    <div
                      className={`p-3.5 rounded-sm text-sm leading-relaxed ${
                        isMe
                          ? 'bg-[var(--color-accent-lime)] text-[var(--color-forest)] border border-[var(--color-forest)] font-semibold'
                          : 'bg-white text-[var(--color-forest)] border border-[var(--color-border-subtle)] font-normal'
                      }`}
                    >
                      {msg.body}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="relative mt-auto">
          <div className="bg-white border border-[var(--color-border-subtle)] p-2 flex items-center gap-2 rounded-sm shadow-sm">
            <input
              type="text"
              className="flex-1 bg-transparent px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none disabled:opacity-50"
              placeholder={
                isEnded
                  ? 'This room has ended.'
                  : showNicknameModal
                  ? 'Join to send messages…'
                  : 'Type your message…'
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isEnded || showNicknameModal}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isEnded || showNicknameModal}
              className="btn-primary !py-2 !px-4 text-xs font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 rounded-sm"
            >
              <span>Send</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9-2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
