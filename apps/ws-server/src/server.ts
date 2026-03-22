import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const PORT = process.env["PORT"] ? parseInt(process.env["PORT"], 10) : 4000;
const CORS_ORIGIN = process.env["CORS_ORIGIN"] ?? "http://localhost:3000";

const app = express();

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  console.log(`[ws] client connected: ${socket.id}`);

  socket.on("disconnect", (reason) => {
    console.log(`[ws] client disconnected: ${socket.id} — ${reason}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`[ws-server] listening on port ${PORT}`);
  console.log(`[ws-server] CORS origin: ${CORS_ORIGIN}`);
});

export { httpServer, io };
