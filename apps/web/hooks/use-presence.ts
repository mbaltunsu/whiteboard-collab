"use client"

import { usePresenceStore } from "@/lib/stores/presence-store"
import { PRESENCE_COLORS } from "@whiteboard/shared"
import type { PresenceState } from "@whiteboard/shared"

export interface UsePresenceReturn {
  remoteCursors: PresenceState[]
  remoteUsers: PresenceState[]
  userCount: number
  localColor: string
}

/**
 * Derive a stable local color from the current user count so the local user
 * gets a distinct color from those already assigned to remote peers.
 */
function pickLocalColor(remoteUsers: PresenceState[]): string {
  const usedColors = new Set(remoteUsers.map((u) => u.color))
  const available = PRESENCE_COLORS.find((c) => !usedColors.has(c))
  return available ?? PRESENCE_COLORS[0]
}

export function usePresence(): UsePresenceReturn {
  const remoteUsers = usePresenceStore((s) => s.remoteUsers)

  const usersArray = Array.from(remoteUsers.values())
  const remoteCursors = usersArray.filter((u) => u.cursor !== null)
  const localColor = pickLocalColor(usersArray)

  return {
    remoteCursors,
    remoteUsers: usersArray,
    userCount: usersArray.length,
    localColor,
  }
}
