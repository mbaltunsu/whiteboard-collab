import { create } from 'zustand'
import type { PresenceState } from '@whiteboard/shared'

interface PresenceStore {
  remoteUsers: Map<string, PresenceState>

  setRemoteCursor: (userId: string, x: number, y: number) => void
  addUser: (user: PresenceState) => void
  removeUser: (userId: string) => void
  setUserSelection: (userId: string, elementIds: string[]) => void
  setUserTyping: (userId: string, isTyping: boolean) => void
  clearAll: () => void
}

export const usePresenceStore = create<PresenceStore>((set) => ({
  remoteUsers: new Map(),

  setRemoteCursor: (userId, x, y) =>
    set((state) => {
      const next = new Map(state.remoteUsers)
      const existing = next.get(userId)
      if (existing) {
        next.set(userId, { ...existing, cursor: { x, y }, lastSeen: Date.now() })
      }
      return { remoteUsers: next }
    }),

  addUser: (user) =>
    set((state) => {
      const next = new Map(state.remoteUsers)
      next.set(user.userId, user)
      return { remoteUsers: next }
    }),

  removeUser: (userId) =>
    set((state) => {
      const next = new Map(state.remoteUsers)
      next.delete(userId)
      return { remoteUsers: next }
    }),

  setUserSelection: (userId, elementIds) =>
    set((state) => {
      const next = new Map(state.remoteUsers)
      const existing = next.get(userId)
      if (existing) {
        next.set(userId, { ...existing, selectedElements: elementIds })
      }
      return { remoteUsers: next }
    }),

  setUserTyping: (userId, isTyping) =>
    set((state) => {
      const next = new Map(state.remoteUsers)
      const existing = next.get(userId)
      if (existing) {
        next.set(userId, { ...existing, isTyping })
      }
      return { remoteUsers: next }
    }),

  clearAll: () => set({ remoteUsers: new Map() }),
}))
