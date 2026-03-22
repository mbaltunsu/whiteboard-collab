import type { Socket, Server } from "socket.io"
import { PRESENCE_COLORS } from "@whiteboard/shared"
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@whiteboard/shared"
import type { SocketUserData } from "./auth"

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

interface RoomUser {
  socketId: string
  userId: string
  name: string
  avatar: string
  color: string
}

interface RoomState {
  users: Map<string, RoomUser>
  usedColors: Set<string>
}

export class RoomManager {
  private static instance: RoomManager
  private rooms: Map<string, RoomState> = new Map()
  private socketToRoom: Map<string, string> = new Map()

  static getInstance(): RoomManager {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager()
    }
    return RoomManager.instance
  }

  private getOrCreateRoom(boardId: string): RoomState {
    let room = this.rooms.get(boardId)
    if (!room) {
      room = { users: new Map(), usedColors: new Set() }
      this.rooms.set(boardId, room)
    }
    return room
  }

  private assignColor(room: RoomState): string {
    for (const color of PRESENCE_COLORS) {
      if (!room.usedColors.has(color)) {
        room.usedColors.add(color)
        return color
      }
    }
    // Fallback: all colors taken, cycle from start
    return PRESENCE_COLORS[room.users.size % PRESENCE_COLORS.length] ?? PRESENCE_COLORS[0]
  }

  joinRoom(socket: AppSocket, boardId: string): RoomUser {
    const room = this.getOrCreateRoom(boardId)
    const color = this.assignColor(room)

    const user: RoomUser = {
      socketId: socket.id,
      userId: socket.data.userId,
      name: socket.data.name,
      avatar: socket.data.avatar,
      color,
    }

    room.users.set(socket.id, user)
    this.socketToRoom.set(socket.id, boardId)

    socket.join(boardId)

    console.log(
      `[rooms] ${user.name} (${socket.id}) joined board ${boardId}, color ${color}`
    )

    return user
  }

  leaveRoom(socket: AppSocket, boardId: string): void {
    const room = this.rooms.get(boardId)
    if (!room) return

    const user = room.users.get(socket.id)
    if (user) {
      room.usedColors.delete(user.color)
      room.users.delete(socket.id)
      console.log(
        `[rooms] ${user.name} (${socket.id}) left board ${boardId}`
      )
    }

    this.socketToRoom.delete(socket.id)
    socket.leave(boardId)

    // Clean up empty rooms
    if (room.users.size === 0) {
      this.rooms.delete(boardId)
    }
  }

  getRoomForSocket(socketId: string): string | undefined {
    return this.socketToRoom.get(socketId)
  }

  getRoomUsers(boardId: string): RoomUser[] {
    const room = this.rooms.get(boardId)
    if (!room) return []
    return Array.from(room.users.values())
  }

  isInRoom(socket: AppSocket, boardId: string): boolean {
    const room = this.rooms.get(boardId)
    if (!room) return false
    return room.users.has(socket.id)
  }

  handleDisconnect(socket: AppSocket, io: AppServer): void {
    const boardId = this.socketToRoom.get(socket.id)
    if (!boardId) return

    const room = this.rooms.get(boardId)
    const user = room?.users.get(socket.id)

    this.leaveRoom(socket, boardId)

    if (user) {
      io.to(boardId).emit("user:leave", { userId: user.userId })
      console.log(
        `[rooms] broadcast user:leave for ${user.name} on board ${boardId}`
      )
    }
  }
}
