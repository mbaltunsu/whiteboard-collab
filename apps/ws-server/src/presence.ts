import type { Socket, Server } from "socket.io"
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  CursorMovePayload,
  CursorLeavePayload,
  SelectionSetPayload,
  ViewportSharePayload,
  UserJoinPayload,
} from "@whiteboard/shared"
import type { SocketUserData } from "./auth"
import { RoomManager } from "./rooms"

type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketUserData
>

type AppServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketUserData
>

// UserJoinPayload extended with boardId sent by the client on connection
interface UserJoinWithBoard extends UserJoinPayload {
  boardId: string
}

export function setupPresenceHandlers(
  io: AppServer,
  socket: AppSocket,
  roomManager: RoomManager
): void {
  socket.on("user:join", (payload: UserJoinPayload) => {
    const { boardId } = payload as UserJoinWithBoard

    if (!boardId) {
      console.warn(`[presence] user:join missing boardId from ${socket.id}`)
      return
    }

    if (roomManager.isInRoom(socket, boardId)) return

    const user = roomManager.joinRoom(socket, boardId)

    // Broadcast the newly joined user (with server-assigned color) to others
    socket.to(boardId).emit("user:join", {
      userId: user.userId,
      name: user.name,
      avatar: user.avatar,
      color: user.color,
    })

    // Send all already-present users to the newly joined socket
    const existingUsers = roomManager.getRoomUsers(boardId)
    for (const existing of existingUsers) {
      if (existing.socketId !== socket.id) {
        socket.emit("user:join", {
          userId: existing.userId,
          name: existing.name,
          avatar: existing.avatar,
          color: existing.color,
        })
      }
    }

    console.log(
      `[presence] user:join — ${user.name} on board ${boardId}, color ${user.color}`
    )
  })

  socket.on("cursor:move", (payload: CursorMovePayload) => {
    const { boardId } = payload
    if (!boardId) return
    socket.to(boardId).emit("cursor:move", payload)
  })

  socket.on("cursor:leave", (payload: CursorLeavePayload) => {
    const { boardId } = payload
    if (!boardId) return
    socket.to(boardId).emit("cursor:leave", payload)
  })

  socket.on("selection:set", (payload: SelectionSetPayload) => {
    // selection:set has no boardId — route to socket's current room
    const boardId = roomManager.getRoomForSocket(socket.id)
    if (!boardId) return
    socket.to(boardId).emit("selection:set", payload)
  })

  socket.on("viewport:share", (payload: ViewportSharePayload) => {
    // viewport:share has no boardId — route to socket's current room
    const boardId = roomManager.getRoomForSocket(socket.id)
    if (!boardId) return
    socket.to(boardId).emit("viewport:share", payload)
  })

  socket.on("user:leave", (payload) => {
    const boardId = roomManager.getRoomForSocket(socket.id)
    if (!boardId) return
    roomManager.leaveRoom(socket, boardId)
    io.to(boardId).emit("user:leave", { userId: payload.userId })
  })

  socket.on("disconnect", () => {
    roomManager.handleDisconnect(socket, io)
  })
}
