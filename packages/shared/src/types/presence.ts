export interface PresenceState {
  userId: string
  name: string
  avatar: string
  color: string
  cursor: { x: number; y: number } | null
  selectedElements: string[]
  isTyping: boolean
  lastSeen: number
}
