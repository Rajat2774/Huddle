import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// 24 hours in milliseconds (at least 1 day session persistence)
const ONE_DAY_MS = 24 * 60 * 60 * 1000
const AUTH_STORAGE_KEY = 'huddle_google_user'

function loadSavedSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (!parsed) return null

    // Check if stored with timestamp format { user, loggedAt }
    const userObj = parsed.user || (parsed.id ? parsed : null)
    const loggedAt = parsed.loggedAt || (parsed.user ? null : Date.now())

    if (!userObj) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }

    // Check session expiration (1 day / 24 hours)
    if (loggedAt && Date.now() - loggedAt > ONE_DAY_MS) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }

    return userObj
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSavedSession)

  const login = (userData) => {
    if (!userData) return
    const sessionPayload = {
      user: userData,
      loggedAt: Date.now(),
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionPayload))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
