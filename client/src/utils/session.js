export function getRoomSession(roomId) {
  if (!roomId) return { sessionToken: '', nickname: '' }
  const sessionToken =
    localStorage.getItem(`huddle_token_${roomId}`) ||
    sessionStorage.getItem(`huddle_token_${roomId}`) ||
    ''
  const nickname =
    localStorage.getItem(`huddle_nick_${roomId}`) ||
    sessionStorage.getItem(`huddle_nick_${roomId}`) ||
    ''
  return { sessionToken, nickname }
}

export function setRoomSession(roomId, sessionToken, nickname) {
  if (!roomId) return
  if (sessionToken) {
    localStorage.setItem(`huddle_token_${roomId}`, sessionToken)
    sessionStorage.setItem(`huddle_token_${roomId}`, sessionToken)
  }
  if (nickname) {
    localStorage.setItem(`huddle_nick_${roomId}`, nickname)
    sessionStorage.setItem(`huddle_nick_${roomId}`, nickname)
  }
}

export function clearRoomSession(roomId) {
  if (!roomId) return
  localStorage.removeItem(`huddle_token_${roomId}`)
  localStorage.removeItem(`huddle_nick_${roomId}`)
  sessionStorage.removeItem(`huddle_token_${roomId}`)
  sessionStorage.removeItem(`huddle_nick_${roomId}`)
}
