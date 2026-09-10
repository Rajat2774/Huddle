// Centralized API configuration for Vercel (frontend) + Render (backend) deployment
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')


export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`
  
  let res
  try {
    res = await fetch(url, options)
  } catch (err) {
    throw new Error('Network error: Unable to connect to the backend server. If using Render, the server might be starting up.')
  }

  const contentType = res.headers.get('content-type') || ''
  let data = null

  if (contentType.includes('application/json')) {
    try {
      data = await res.json()
    } catch {
      data = null
    }
  }

  if (!res.ok) {
    const errorMsg = (data && data.error) || (data && data.message) || `Server returned status ${res.status}`
    throw new Error(errorMsg)
  }

  return data
}
