"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { io, Socket } from "socket.io-client"
import { usePresenceStore } from "@/lib/stores/presence-store"
import { THROTTLE } from "@whiteboard/shared"
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  CursorMovePayload,
  SelectionSetPayload,
  UserJoinPayload,
} from "@whiteboard/shared"

type WhiteboardSocket = Socket<ServerToClientEvents, ClientToServerEvents>

interface SessionUser {
  userId?: string
  name?: string | null
  image?: string | null
}

interface Session {
  user?: SessionUser
  accessToken?: string
}

export interface UseSocketReturn {
  socket: WhiteboardSocket | null
  isConnected: boolean
  emitCursorMove: (x: number, y: number) => void
  emitSelectionSet: (elementIds: string[]) => void
}

function throttle<T extends (...args: Parameters<T>) => void>(
  fn: T,
  ms: number,
): T {
  let lastCall = 0
  return ((...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= ms) {
      lastCall = now
      fn(...args)
    }
  }) as T
}

export function useSocket(
  boardId: string,
  session: Session | null,
): UseSocketReturn {
  const socketRef = useRef<WhiteboardSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const setRemoteCursor = usePresenceStore((s) => s.setRemoteCursor)
  const addUser = usePresenceStore((s) => s.addUser)
  const removeUser = usePresenceStore((s) => s.removeUser)
  const setUserSelection = usePresenceStore((s) => s.setUserSelection)
  const clearAll = usePresenceStore((s) => s.clearAll)

  useEffect(() => {
    if (!boardId || !session?.user?.userId) return

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:4000"
    const userId = session.user.userId
    const name = session.user.name ?? "Anonymous"
    const avatar = session.user.image ?? ""
    const token = session.accessToken ?? ""

    const socket: WhiteboardSocket = io(wsUrl, {
      auth: { token },
      query: { boardId },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    socket.on("connect", () => {
      setIsConnected(true)
      const joinPayload: UserJoinPayload = {
        userId,
        name,
        avatar,
        color: "",
      }
      socket.emit("user:join", joinPayload)
    })

    socket.on("disconnect", () => {
      setIsConnected(false)
    })

    socket.on("cursor:move", (payload) => {
      setRemoteCursor(payload.userId, payload.x, payload.y)
    })

    socket.on("cursor:leave", (payload) => {
      setRemoteCursor(payload.userId, -1, -1)
      const store = usePresenceStore.getState()
      const user = store.remoteUsers.get(payload.userId)
      if (user) {
        store.remoteUsers.set(payload.userId, { ...user, cursor: null })
      }
    })

    socket.on("user:join", (payload) => {
      addUser({
        userId: payload.userId,
        name: payload.name,
        avatar: payload.avatar,
        color: payload.color,
        cursor: null,
        selectedElements: [],
        isTyping: false,
        lastSeen: Date.now(),
      })
    })

    socket.on("user:leave", (payload) => {
      removeUser(payload.userId)
    })

    socket.on("selection:set", (payload) => {
      setUserSelection(payload.userId, payload.elementIds)
    })

    return () => {
      if (socket.connected) {
        socket.emit("cursor:leave", { userId, boardId })
        socket.emit("user:leave", { userId })
      }
      socket.removeAllListeners()
      socket.disconnect()
      socketRef.current = null
      setIsConnected(false)
      clearAll()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId, session?.user?.userId])

  const emitCursorMove = useCallback(
    throttle((x: number, y: number) => {
      const socket = socketRef.current
      const userId = session?.user?.userId
      if (!socket || !userId || !socket.connected) return
      const payload: CursorMovePayload = { userId, x, y, boardId }
      socket.emit("cursor:move", payload)
    }, THROTTLE.CURSOR_MS),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [boardId, session?.user?.userId],
  )

  const emitSelectionSet = useCallback(
    (elementIds: string[]) => {
      const socket = socketRef.current
      const userId = session?.user?.userId
      if (!socket || !userId || !socket.connected) return
      const payload: SelectionSetPayload = { userId, elementIds }
      socket.emit("selection:set", payload)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session?.user?.userId],
  )

  return {
    socket: socketRef.current,
    isConnected,
    emitCursorMove,
    emitSelectionSet,
  }
}
