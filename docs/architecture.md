# Architecture

## System Overview

CollaborativeWhiteBoard is a 4-layer system deployed as a Turborepo monorepo with two independently deployed applications and a shared package.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTS (Browser)                        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   User A     │  │   User B     │  │   User C     │          │
│  │  Canvas +    │  │  Canvas +    │  │  Canvas +    │          │
│  │  Yjs Doc     │  │  Yjs Doc     │  │  Yjs Doc     │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │  Yjs updates     │  Yjs updates     │                 │
│         │  + presence      │  + presence      │                 │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              WS SERVER (Railway/Render/Fly.io)                  │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │  y-websocket    │  │  Socket.io      │  │  Room Manager  │  │
│  │  Provider       │  │  (Presence +    │  │  (Join/Leave/  │  │
│  │  (CRDT Sync)    │  │   Cursors +     │  │   Permissions) │  │
│  │                 │  │   Ephemeral)    │  │                │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬───────┘  │
│           │                    │                     │          │
│           ▼                    ▼                     │          │
│  ┌─────────────────────────────────────┐             │          │
│  │     Persistence Layer               │◄────────────┘          │
│  │  (Yjs doc snapshots → MongoDB)      │                        │
│  └─────────────────┬───────────────────┘                        │
└────────────────────┼────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS APP (Vercel)                          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │  App Router  │  │  API Routes  │  │  NextAuth.js          │  │
│  │              │  │  (REST)      │  │  (Google/GitHub OAuth) │  │
│  │  - Landing   │  │  - Boards    │  │  - Session mgmt       │  │
│  │  - Dashboard │  │  - Users     │  │  - JWT tokens         │  │
│  │  - Board     │  │  - Rooms     │  │  - Protected routes   │  │
│  │  - Settings  │  │  - Invites   │  │                       │  │
│  └──────────────┘  └──────┬───────┘  └───────────────────────┘  │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MONGODB (Atlas)                               │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐   │
│  │  Users   │  │  Boards  │  │  Rooms   │  │  Yjs Docs     │   │
│  │  - name  │  │  - title │  │  - code  │  │  (Binary      │   │
│  │  - email │  │  - owner │  │  - users │  │   Snapshots)  │   │
│  │  - avatar│  │  - thumb │  │  - perms │  │               │   │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Dual-Channel Communication

The system uses two separate communication channels, each optimized for its data type:

### Channel 1: Yjs (CRDT — Persistent State)

All board data that needs to survive a page refresh flows through Yjs:

- Element create/update/delete
- Sticky note text editing (character-level collaborative editing via Y.Text)
- Comment thread messages
- Element z-ordering

**Flow:** User action → local Yjs doc update → y-websocket broadcasts CRDT delta → all clients merge automatically (conflict-free) → WS server periodically snapshots to MongoDB.

**Conflict resolution:** Automatic via CRDT. Two users moving the same element → last-writer-wins per field. Two users editing the same sticky note → character-level merge. Offline edits merge cleanly on reconnect.

### Channel 2: Socket.io (Ephemeral Events)

Transient data that doesn't need persistence flows through Socket.io:

- Cursor positions (throttled to 50ms)
- User join/leave notifications
- Typing indicators
- Selection highlights
- Viewport sharing ("follow me" mode)

**Flow:** Mouse move → Socket.io emit → server broadcasts to room → other clients render.

## Data Flows

| Flow | Path | Latency |
|------|------|---------|
| Drawing/editing | User → local Yjs → y-websocket → broadcast → merge | ~50-100ms |
| Cursor presence | User → Socket.io emit → broadcast | ~50ms (throttled) |
| Board persistence | WS server → periodic Yjs snapshot → MongoDB | Background |
| Room join | Invite link → NextAuth validate → WS server add to room | On connect |

## Monorepo Structure

```
CollaborativeWhiteBoard/
├── apps/
│   ├── web/                    # Next.js 14 (App Router) → Vercel
│   │   ├── app/
│   │   │   ├── (auth)/         # Auth pages
│   │   │   ├── (dashboard)/    # Dashboard layout group
│   │   │   ├── board/[id]/     # Whiteboard canvas page
│   │   │   └── api/            # REST API routes
│   │   ├── components/
│   │   │   ├── canvas/         # Canvas, renderer, viewport
│   │   │   ├── elements/       # Freehand, sticky, shape, comment
│   │   │   ├── toolbar/        # Tool palette, color picker
│   │   │   ├── presence/       # Cursors, avatar stack
│   │   │   └── ui/             # shadcn/ui components
│   │   ├── hooks/              # useCanvas, useYjs, usePresence, useSocket
│   │   ├── lib/                # Yjs setup, socket client, utils
│   │   └── styles/             # Tailwind config, globals
│   │
│   └── ws-server/              # WebSocket server → Railway
│       ├── src/
│       │   ├── server.ts       # Express + Socket.io + y-websocket
│       │   ├── rooms.ts        # Room lifecycle management
│       │   ├── presence.ts     # Presence tracking
│       │   ├── persistence.ts  # Yjs ↔ MongoDB snapshots
│       │   └── auth.ts         # JWT token validation
│       └── package.json
│
├── packages/
│   └── shared/                 # Shared types & constants
│       ├── types/              # Element, Board, User, Room types
│       ├── constants/          # Colors, limits, defaults
│       └── yjs-schema.ts       # Yjs document structure definition
│
├── turbo.json
├── package.json                # Root workspace
└── .github/workflows/          # CI/CD
```

## Deployment Topology

| App | Platform | URL |
|-----|----------|-----|
| `apps/web` | Vercel | Production domain |
| `apps/ws-server` | Railway (alternatives: Render, Fly.io) | WebSocket endpoint |
| MongoDB | Atlas | Connection string in env |
