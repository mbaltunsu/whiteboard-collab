# Tech Stack

## Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 14 (App Router) | React framework, SSR, API routes, file-based routing |
| **React** | 18 | UI rendering, component model |
| **TypeScript** | 5.x | Type safety across entire monorepo |
| **Tailwind CSS** | 3.x | Utility-first styling |
| **shadcn/ui** | latest | Pre-built accessible UI components (dialogs, dropdowns, buttons) |
| **rough.js** | 4.x | Hand-drawn/sketchy rendering aesthetic for canvas elements |
| **Zustand** | 4.x | Lightweight client state (tool selection, UI state — NOT board data) |

### Why These Choices

- **Next.js 14 App Router** — Server components for dashboard, API routes for board CRUD, deployed on Vercel with zero config. App Router over Pages Router for modern patterns.
- **rough.js** — Gives the whiteboard a distinctive Excalidraw-like hand-drawn feel. Differentiates from generic canvas apps in portfolio.
- **Zustand over Redux** — Board state lives in Yjs (CRDT), so we only need local UI state management. Zustand is minimal and sufficient.
- **shadcn/ui** — Copy-paste components we own (not a dependency). Pairs naturally with Tailwind. Used for toolbar, dialogs, popovers — not canvas elements.

## Realtime

| Technology | Purpose |
|-----------|---------|
| **Yjs** | CRDT library for conflict-free collaborative editing of board state |
| **y-websocket** | Yjs WebSocket provider — syncs Yjs documents between clients via server |
| **Socket.io** | Ephemeral events — cursor positions, presence, typing indicators |
| **y-indexeddb** | Client-side Yjs persistence for offline support and faster reconnection |

### Why These Choices

- **Yjs** — Mature, battle-tested CRDT. Handles conflict resolution automatically. Supports sub-document types (Y.Map, Y.Array, Y.Text) that map directly to whiteboard elements. High interview impact — demonstrates understanding of distributed systems.
- **Socket.io over raw WebSockets** — Automatic reconnection, room support, fallback transports. The overhead is worth it for presence/cursor features.
- **Dual-channel (Yjs + Socket.io)** — Yjs handles persistent state (elements, text). Socket.io handles ephemeral data (cursors, presence). Clean separation of concerns.

## Backend & Database

| Technology | Purpose |
|-----------|---------|
| **MongoDB Atlas** | Document database — stores users, boards, rooms, Yjs binary snapshots |
| **NextAuth.js** | Authentication — Google + GitHub OAuth providers, JWT sessions |
| **Mongoose** | MongoDB ODM for schema validation and queries in API routes |

### Why These Choices

- **MongoDB** — Document model fits naturally: boards contain elements, rooms contain users. Yjs snapshots are binary blobs stored as Buffer fields. No relational joins needed.
- **NextAuth.js** — Standard auth for Next.js. OAuth providers (Google/GitHub) mean no password management. JWT sessions work across both the Next.js app and the WS server (shared secret).

## Infrastructure

| Technology | Purpose |
|-----------|---------|
| **Vercel** | Hosts Next.js app — automatic deploys from git, edge functions, CDN |
| **Railway** | Hosts WebSocket server — persistent processes (Vercel doesn't support WebSockets) |
| **Turborepo** | Monorepo build orchestration — parallel builds, shared caching |

### Why These Choices

- **Separate deploys** — Vercel can't run persistent WebSocket connections. Railway/Render handles long-lived WS processes. This separation also allows independent scaling.
- **Turborepo** — Manages the monorepo build pipeline. Shared types in `packages/shared` are built first, then both apps build in parallel. Caching speeds up CI.
