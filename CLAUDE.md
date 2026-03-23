# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**CollaborativeWhiteBoard** — A realtime collaborative whiteboard app (Miro/Excalidraw-style) with CRDT-based conflict resolution, live cursor presence, and a hand-drawn aesthetic via rough.js. Built as a portfolio showpiece and usable MVP.

**Live:** Vercel (web) + Railway (WS server)
**Repo:** Turborepo monorepo with npm workspaces

## Tech Stack (Pinned Versions)

| Layer       | Technology                  | Version  |
| ----------- | --------------------------- | -------- |
| Runtime     | Node.js                     | ≥22.0.0  |
| Frontend    | Next.js (App Router)        | 14.2.35  |
| UI          | React, TypeScript, Tailwind | 18.3, 5.7, 3.x |
| Components  | shadcn/ui, rough.js         | latest, 4.6.6 |
| State       | Zustand                     | 5.0.12   |
| CRDT        | Yjs, y-websocket, y-indexeddb | 13.6, 2.1, 9.0 |
| Realtime    | Socket.io (client + server) | 4.8.x    |
| Auth        | NextAuth.js (JWT strategy)  | 4.24.13  |
| Database    | MongoDB Atlas via Mongoose   | —        |
| Build       | Turborepo                   | 2.3.3    |
| Deploy      | Vercel (web), Railway (ws)  | —        |

## Monorepo Layout

```
apps/
  web/                        → Next.js 14 App Router (Vercel)
    app/
      (auth)/signin/           → NextAuth login (Google + GitHub)
      (dashboard)/             → Board grid, create/manage boards
      board/[id]/              → Main whiteboard canvas + settings
      invite/[code]/           → Invite acceptance, redirect to board
      api/
        auth/[...nextauth]/    → NextAuth handler
        boards/                → GET (list), POST (create)
        boards/[id]/           → GET, PATCH, DELETE
        boards/[id]/members/   → GET, POST, DELETE
        boards/[id]/invite/    → GET (generate code)
        invite/[code]/         → GET (redeem)
    components/
      canvas/                  → Canvas engine: manager, renderer, input, viewport, overlays
      toolbar/                 → Tool picker, color picker, stroke width, zoom controls
      presence/                → Remote cursors, user avatars, connection badge
      elements/                → Element-specific UI (shape selector)
      ui/                      → shadcn/ui primitives (button, popover, dialog, etc.)
    hooks/                     → use-yjs, use-socket, use-presence, use-viewport
    lib/
      stores/                  → Zustand: ui-store (tools, colors), presence-store (remote users)
      models/                  → Mongoose: User, Board, Room
      auth-config.ts           → NextAuth providers + JWT callbacks
      mongodb.ts               → DB connection singleton
      theme.ts                 → Canvas colors, fonts, gradients (resolved values, no CSS vars)
    __tests__/                 → Vitest unit + Playwright E2E

  ws-server/                   → Express + Socket.io + y-websocket (Railway)
    src/
      server.ts                → HTTP + two WS upgrade paths (y-websocket at /yjs/*, Socket.io)
      auth.ts                  → JWT verification middleware
      presence.ts              → cursor:move, user:join/leave, selection:set handlers
      rooms.ts                 → Room manager (join/leave, color allocation from 12-color palette)
      persistence.ts           → Periodic Yjs doc snapshots to MongoDB
      yjs-setup.ts             → y-websocket provider per board room
    Dockerfile                 → Multi-stage node:22-alpine build

packages/
  shared/                      → Shared types, constants, Yjs helpers
    src/
      types/elements.ts        → WhiteboardElement union, ElementType, ToolType, ShapeType
      types/board.ts           → Board, Member types
      types/socket-events.ts   → CursorMovePayload, UserJoinPayload, etc.
      types/presence.ts        → PresenceState (cursor, selection, typing)
      constants/               → PRESENCE_COLORS (12), STICKY_COLORS (5), DEFAULTS, THROTTLE, LIMITS
      yjs-schema.ts            → Doc structure helpers
```

## Commands

```bash
# Prerequisites: Node.js 22+, MongoDB URI, OAuth credentials

npm install                         # Install all workspaces (from root)
npx turbo dev                       # Dev both apps
npx turbo dev --filter=web          # Dev web only
npx turbo dev --filter=ws-server    # Dev WS server only
npx turbo build                     # Build all
npx turbo lint                      # ESLint all (--max-warnings 0)
npx turbo typecheck                 # tsc --noEmit all
npx shadcn-ui@latest add <name>    # Add shadcn component (run from apps/web)
```

## Architecture — How It Works

### Dual-Channel Realtime

```
Browser ──┬── y-websocket ──→ WS Server (/yjs/*) ──→ Yjs doc sync + MongoDB snapshots
          └── Socket.io ────→ WS Server (default)  ──→ Ephemeral presence (cursors, typing)
```

- **Yjs channel**: Persistent board state. All elements stored as `Y.Map` entries in `doc.getMap('elements')`. CRDT = automatic conflict resolution. UndoManager scoped to elements only. y-indexeddb for offline persistence.
- **Socket.io channel**: Ephemeral presence. Cursors, selections, typing indicators, user join/leave. Not persisted. Events use `namespace:action` format (`cursor:move`, `user:join`).
- **JWT shared**: NextAuth JWT secret = WS server JWT secret. Socket.io middleware validates token on connect.

### Canvas Engine (apps/web/components/canvas/)

```
CanvasManager (orchestrator)
├── Viewport        → pan/zoom transforms, screenToCanvas / canvasToScreen
├── InputHandler    → mouse/touch/keyboard events, hit testing, gesture detection
└── Renderer        → requestAnimationFrame loop, rough.js drawing, grid, cursors
```

- **Two render paths**: Canvas 2D draws shapes/freehand (rough.js for hand-drawn look). HTML overlays (`position: absolute` divs) for sticky notes, comments, text fields (`contenteditable`).
- **Hit testing**: 4px padding, sorted by zIndex descending, used for select/move/erase/context-menu.
- **Input modes**: Pen (accumulate [x,y,pressure] points), Shape (start/end drag), Select (click or box), Hand/Pan (middle-click, right-click, two-finger trackpad), Pinch-zoom (two-finger touch).
- **Viewport**: min zoom 0.1, max 5.0. `screenToCanvas(sx, sy)` / `canvasToScreen(cx, cy)` for coordinate conversion.

### State Management

- **UIStore (Zustand)**: `activeTool`, `activeShapeType`, `strokeColor`, `fillColor`, `strokeWidth`, `roughness`, `zoom`, `isDarkMode`, `selectedElementIds`
- **PresenceStore (Zustand)**: `remoteUsers: Map<userId, PresenceState>` — cursors, selections, typing status
- **Yjs Doc**: Source of truth for all element data. Observed via `doc.getMap('elements').observeDeep()`.

### Stale Callback Pattern (Critical)

CanvasManager callbacks (`onElementCreate`, `onElementUpdate`, `onElementSelect`, `onElementDelete`, `onContextMenu`) are set during mount `useEffect`. Since Yjs initializes asynchronously, these callbacks close over `null` values initially. **Fix**: Separate `useEffect([onCallback])` hooks re-register callbacks when dependencies change. This is essential — do not combine into the mount effect.

```typescript
// whiteboard-canvas.tsx — pattern for each callback
useEffect(() => {
  if (onElementCreate) managerRef.current?.onElementCreate(onElementCreate)
}, [onElementCreate])
```

## Environment Variables

```bash
# Web (.env.local)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random-string>
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
MONGODB_URI=mongodb+srv://...
NEXT_PUBLIC_WS_SERVER_URL=http://localhost:4000   # exposed to browser

# WS Server (.env)
PORT=4000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<must-match-NEXTAUTH_SECRET>
CORS_ORIGIN=http://localhost:3000
```

## Key Architectural Decisions

- **Dual-channel realtime**: Yjs for persistent state (CRDT), Socket.io for ephemeral presence
- **Element Store = Yjs Y.Map**: No custom conflict resolution needed
- **rough.js rendering**: Hand-drawn Excalidraw-style aesthetic on Canvas 2D
- **HTML overlay for text**: Sticky notes/comments use `contenteditable` divs, not canvas text
- **Separate WS server**: Vercel doesn't support WebSockets — Railway hosts WS independently
- **JWT shared between apps**: Single secret for NextAuth + WS server auth
- **Canvas coords vs screen coords**: Always convert to canvas world coords before emitting cursor positions or storing element positions

## Element Types & Data Model

| Type      | Rendered Via    | Key Data Fields                                    |
| --------- | --------------- | -------------------------------------------------- |
| freehand  | Canvas (rough)  | points: [x,y,pressure][], tool: pen/highlighter    |
| shape     | Canvas (rough)  | shapeType, width, height, connectedTo              |
| sticky    | HTML overlay    | text, color (from STICKY_COLORS palette)            |
| comment   | HTML overlay    | title (text content), glass card with backdrop blur |
| text      | HTML overlay    | content, fontSize, fontFamily                       |

**BaseElement**: `id, type, position: {x,y}, size: {w,h}, style: {color, strokeWidth, opacity, roughness}, zIndex, createdBy, locked`

## Current Feature Status

### Working
- Infinite canvas with pan/zoom (mouse, trackpad, touch pinch)
- Freehand drawing (pen, highlighter, eraser)
- Shapes (rectangle, ellipse, diamond, arrow, line)
- Sticky notes (drag, edit, color)
- Comments (glass card, double-click to edit, drag)
- Text fields (long-press drag on mobile)
- Live cursor presence with names + colors
- Selection awareness (remote users' selections highlighted)
- Undo/redo (Ctrl+Z / Ctrl+Y)
- Right-click context menu (delete, change color)
- Backspace/Delete removes selected elements
- Middle-click / right-click canvas pan
- Two-finger pinch-zoom and pan on mobile
- Auto-switch to select tool after creating sticky/text/comment
- OAuth login (Google + GitHub)
- Board CRUD + member management + invite links
- Offline persistence (y-indexeddb)
- Dark/light mode (CSS variables, toggle in store)

### Needs Work
- Dark mode not fully wired to all canvas rendering
- Board settings page may be incomplete
- Board permissions not fully enforced server-side
- No error boundaries or loading skeletons
- No rate limiting on API routes
- Test coverage limited (7 test files, no canvas/socket/Yjs tests)
- Follow mode (viewport:share event defined but no UI)
- Element locking (field exists but no UI)
- Shape connections (connectedTo field exists but no connector UI)

## Reference Docs

- [Architecture](docs/architecture.md) — System overview, data flows, deployment topology
- [Tech Stack](docs/tech-stack.md) — Technology choices with rationale
- [Canvas Engine](docs/canvas-engine.md) — Rendering pipeline, element models, interaction model
- [Realtime Sync](docs/realtime-sync.md) — Yjs CRDT sync, Socket.io presence, reconnection
- [Features](docs/features.md) — MVP feature scope, page map with routes
- [Rules](docs/rules.md) — TypeScript, React, Yjs, Socket.io, naming, git conventions
- [Design Tokens](docs/design-tokens.md) — Color palette, typography, spacing, shadows
- [Implementation Plan](docs/implementation-plan.md) — Phased build plan with agent assignments
- [Deployment](DEPLOYMENT.md) — Vercel + Railway setup, env vars, build commands

## Rules

See [docs/rules.md](docs/rules.md) for full conventions. Key points:

- TypeScript strict mode, no `any`
- All shared types in `packages/shared/src/types/`
- Yjs doc structure: `doc.getMap('elements')` for elements, `doc.getMap('meta')` for metadata
- Socket.io events: `namespace:action` format (`cursor:move`, `user:join`)
- Files: `kebab-case.ts`, components: `PascalCase` exports
- Git: conventional commits (`feat:`, `fix:`, `refactor:`)
- ESLint: `consistent-type-imports` enforced — use `import type` for type-only imports
- Follow rules in `.claude/rules/` folder
- Use `STITCH_DESIGN.md` to fetch designs for reference at start

## Multi-Agent Workflow

- Each agent works in its own **git worktree** on a dedicated feature branch
- **Small commits** — one logical unit per commit (one model, one component, one route)
- **File ownership enforced** — see [Implementation Plan](docs/implementation-plan.md)
- `packages/shared/` is the single source of truth for types — only `typescript-pro` writes to it
- **Rebase + PR** before merging to main — code-reviewer gates every merge
- If confused about what to do or which files to touch, **ask for help** — don't guess

## Project Team

See [TEAM.md](TEAM.md) for the list of agents configured for this project.
- Always use agents and subagents when parallel work is possible
- Use `ui-ux-pro-max` for UI/UX design and improvements, Playwright for visual testing
- Code reviewer should review after mid/big tasks, not small changes
- Use design agents early in development
- Regularly update current status and progress

## CI/CD Pipeline

GitHub Actions (`.github/workflows/ci.yml`):
1. Trigger: push/PR to main
2. Node.js 22, Ubuntu latest
3. `npm ci --legacy-peer-deps`
4. `npx turbo typecheck`
5. `npx turbo lint`

**Important**: Lint uses `--max-warnings 0` — all warnings are errors. Use `import type` for type-only imports (ESLint `consistent-type-imports` rule).
