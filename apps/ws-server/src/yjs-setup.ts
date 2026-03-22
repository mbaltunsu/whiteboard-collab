import { IncomingMessage } from "http"
import { WebSocketServer, WebSocket } from "ws"
import type { Server as HttpServer } from "http"
import { YJS_WEBSOCKET_PATH } from "@whiteboard/shared"

// y-websocket bin/utils is CJS; require() is safe here (CommonJS output target)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { setupWSConnection, setPersistence } = require("y-websocket/bin/utils")

import { mongoPersistence } from "./persistence"

export function setupYjsWebSocket(httpServer: HttpServer): void {
  // Register MongoDB persistence with y-websocket
  setPersistence(mongoPersistence)

  const wss = new WebSocketServer({ noServer: true })

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    // docName is the boardId extracted from the URL path segment after /yjs/
    // e.g. /yjs/board-123 → docName = "board-123"
    const url = req.url ?? "/"
    const docName = url.replace(YJS_WEBSOCKET_PATH, "").replace(/^\//, "").split("?")[0]

    setupWSConnection(ws, req, { docName: docName || url.slice(1).split("?")[0] })
  })

  // Route WS upgrade requests: /yjs/* → Yjs, everything else → Socket.io
  httpServer.on("upgrade", (req: IncomingMessage, socket, head) => {
    const pathname = req.url ?? "/"
    if (pathname.startsWith(YJS_WEBSOCKET_PATH)) {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req)
      })
    }
    // Socket.io handles its own upgrades on /socket.io — no action needed here
  })

  console.log(`[yjs] y-websocket listening on path ${YJS_WEBSOCKET_PATH}`)
}
