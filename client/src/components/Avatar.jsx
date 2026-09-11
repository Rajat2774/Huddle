import { useState } from 'react'

export function getInitials(name) {
  if (!name || typeof name !== 'string') return 'U'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return parts[0][0].toUpperCase()
}

export default function Avatar({ src, name, className = 'w-7 h-7 text-xs' }) {
  const [imgError, setImgError] = useState(false)
  const initials = getInitials(name)

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name || 'User avatar'}
        onError={() => setImgError(true)}
        className={`${className} rounded-full object-cover border border-[var(--color-border-subtle)] shrink-0`}
      />
    )
  }

  return (
    <div
      className={`${className} rounded-full bg-[var(--color-forest)] text-[var(--color-accent-lime)] flex items-center justify-center font-bold tracking-wider shrink-0 uppercase select-none`}
    >
      {initials}
    </div>
  )
}
