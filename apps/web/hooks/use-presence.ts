"use client"

import { usePresenceStore } from "@/lib/stores/presence-store"
import type { PresenceState } from "@whiteboard/shared"

export interface UsePresenceReturn {
  remoteCursors: PresenceState[]
  remoteUsers: PresenceState[]
  userCount: number
}

export function usePresence(): UsePresenceReturn {
  const remoteUsers = usePresenceStore((s) => s.remoteUsers)

  const usersArray = Array.from(remoteUsers.values())

  const remoteCursors = usersArray.filter((u) => u.cursor !== null)

  return {
    remoteCursors,
    remoteUsers: usersArray,
    userCount: usersArray.length,
  }
}
