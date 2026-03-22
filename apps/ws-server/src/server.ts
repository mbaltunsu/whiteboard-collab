import cors from "cors"
import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@whiteboard/shared"
import { authenticateSocket } from "./auth"
import type { SocketUserData } from "./auth"
import { RoomManager } from "./rooms"
import { setupPresenceHandlers } from "./presence"
import { setupYjsWebSocket } from "./yjs-setup"
import { connectMongo } from "./persistence"

const PORT = process.env["PORT"] ? parseInt(process.env["PORT"], 10) : 4000
const CORS_ORIGIN = process.env["CORS_ORIGIN"] ?? "http://localhost:3000"

const app = express()

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
)

app.use(express.json())

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

const httpServer = createServer(app)

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketUserData
>(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    credentials: true,
  },
  transports: ["websocket", "polling"],
})

// JWT authentication middleware
io.use(authenticateSocket)

const roomManager = RoomManager.getInstance()

io.on("connection", (socket) => {
  console.log(
    `[ws] client connected: ${socket.id} — user: ${socket.data.userId}`
  )

  setupPresenceHandlers(io, socket, roomManager)

  socket.on("disconnect", (reason) => {
    console.log(
      `[ws] client disconnected: ${socket.id} — ${reason}`
    )
  })
})

// Set up y-websocket on /yjs path (intercepts HTTP upgrade before Socket.io)
setupYjsWebSocket(httpServer)

// Connect to MongoDB (non-blocking — server still starts without it)
connectMongo().catch((err: unknown) => {
  console.error("[server] MongoDB connection error:", err)
})

httpServer.listen(PORT, () => {
  console.log(`[ws-server] listening on port ${PORT}`)
  console.log(`[ws-server] CORS origin: ${CORS_ORIGIN}`)
})

export { httpServer, io }
