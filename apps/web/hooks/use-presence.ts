"use client"

import { useMemo, useRef } from "react"
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
 * Derive a stable local color from remote peers so the local user
 * gets a distinct color from those already assigned.
 */
function pickLocalColor(remoteUsers: PresenceState[]): string {
  const usedColors = new Set(remoteUsers.map((u) => u.color))
  const available = PRESENCE_COLORS.find((c) => !usedColors.has(c))
  return available ?? PRESENCE_COLORS[0]
}

/**
 * usePresence — provides remote users and cursor data.
 *
 * Performance: We select the raw Map and derive arrays in useMemo.
 * Cursor-only updates (same user set, different positions) are separated
 * so components that only need the user list don't re-render on cursor ticks.
 */
export function usePresence(): UsePresenceReturn {
  const remoteUsers = usePresenceStore((s) => s.remoteUsers)

  // Track user count to detect join/leave (cheaper than deep-comparing the Map)
  const prevCountRef = useRef(0)
  const prevColorRef = useRef(PRESENCE_COLORS[0])

  const usersArray = useMemo(
    () => Array.from(remoteUsers.values()),
    [remoteUsers],
  )

  const remoteCursors = useMemo(
    () => usersArray.filter((u) => u.cursor !== null),
    [usersArray],
  )

  // Only recompute local color when user count changes (join/leave)
  const localColor = useMemo(() => {
    if (usersArray.length !== prevCountRef.current) {
      prevCountRef.current = usersArray.length
      prevColorRef.current = pickLocalColor(usersArray)
    }
    return prevColorRef.current
  }, [usersArray])

  return {
    remoteCursors,
    remoteUsers: usersArray,
    userCount: usersArray.length,
    localColor,
  }
}
