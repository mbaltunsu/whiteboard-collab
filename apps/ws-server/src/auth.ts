import jwt from "jsonwebtoken"
import type { Socket } from "socket.io"
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@whiteboard/shared"

export interface SocketUserData {
  userId: string
  name: string
  avatar: string
}

type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketUserData
>

export function authenticateSocket(
  socket: AppSocket,
  next: (err?: Error) => void
): void {
  const token = socket.handshake.auth["token"] as string | undefined

  if (!token) {
    next(new Error("Authentication required: no token provided"))
    return
  }

  const secret = process.env["JWT_SECRET"]
  if (!secret) {
    console.error("[auth] JWT_SECRET env var is not set")
    next(new Error("Server misconfiguration"))
    return
  }

  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload

    const userId =
      (decoded["sub"] as string | undefined) ??
      (decoded["userId"] as string | undefined)
    const name =
      (decoded["name"] as string | undefined) ?? "Anonymous"
    const avatar = (decoded["picture"] as string | undefined) ?? ""

    if (!userId) {
      next(new Error("Authentication failed: invalid token payload"))
      return
    }

    socket.data.userId = userId
    socket.data.name = name
    socket.data.avatar = avatar

    next()
  } catch {
    next(new Error("Authentication failed: invalid or expired token"))
  }
}
