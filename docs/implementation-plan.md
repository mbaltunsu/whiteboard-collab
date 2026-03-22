# Implementation Plan: CollaborativeWhiteBoard

## Context

The project has comprehensive design docs already written (`docs/architecture.md`, `docs/tech-stack.md`, `docs/canvas-engine.md`, `docs/realtime-sync.md`, `docs/features.md`, `docs/rules.md`) and a CLAUDE.md that references them. The codebase directory is empty — no code exists yet. 12 agents are configured in `.claude/agents/`. 4 Stitch screens provide design reference (IDs in `.claude/rules/STITCH_DESIGN.md`).

**Goal:** Implement the full collaborative whiteboard with clear agent assignments and parallel work streams.

---

## Pre-Phase 0: Fetch Stitch Designs

**Agent:** ui-designer (+ `ui-ux-pro-max` skill)
**Why first:** Every UI-building agent needs design reference before writing components.

| Task | Details |
|------|---------|
| Fetch 4 Stitch screens | Use `mcp__stitch__get_screen` for each screen ID from `STITCH_DESIGN.md` |
| Save design assets | Download images to `docs/designs/` |
| Extract design tokens | Document colors, spacing, typography into `docs/design-tokens.md` |

**Stitch Screen IDs:**
- Whiteboard Canvas: `c5d1a6df895b43859fd95cfbb77be717`
- Presence Details: `e7bcb2ca26364878badd58afea63dece`
- Architecture Dashboard: `4b28ec017b174746aa67c6b4a296b659`
- Room Dashboard: `8bab8f85bf1844e6a77b83eb8ff47fb4`
- Project ID: `5212631045652187184`

---

## Phase 1: Foundation (Monorepo + Types + Auth + CI)

### Track 1A: Monorepo Scaffold — `nextjs-developer`
- Initialize Turborepo root (`turbo.json`, root `package.json` with workspaces)
- Scaffold `apps/web/` (Next.js 14 App Router, TypeScript, Tailwind)
- Scaffold `apps/ws-server/` (Node.js + Express + TypeScript)
- Scaffold `packages/shared/` (TypeScript package, barrel exports)
- Shared `tsconfig.base.json`, `.env.example` files, `.gitignore`
- **Verify:** `turbo dev` starts both apps, `turbo build` succeeds

### Track 1B: Shared Types — `typescript-pro` (after 1A)
- Element types: `BaseElement`, `FreehandElement`, `StickyNoteElement`, `ShapeElement`, `CommentElement`
- Board/Room/User types, `RoomPermission`, `PresenceState`
- Socket.io typed events: `ServerToClientEvents`, `ClientToServerEvents`
- Constants: 12-color palette, limits, defaults, tool/shape types
- Yjs schema keys in `packages/shared/yjs-schema.ts`

### Track 1C: Database Models — `api-designer` (after 1B)
- Mongoose connection singleton (`apps/web/lib/mongodb.ts`)
- Models: `User`, `Board`, `Room`, `YjsDoc` with proper indexes

### Track 1D: Authentication — `nextjs-developer` (after 1C)
- NextAuth.js with Google + GitHub OAuth
- JWT strategy with userId/name/avatar in token
- Auth helpers, sign-in page, route protection middleware

### Track 1E: CI Pipeline — `deployment-engineer` (parallel with 1A)
- `.github/workflows/ci.yml`: lint, typecheck, build on PR

### Parallelism: `1A + 1E` in parallel → then `1B` → `1C` → `1D`

### Review Checkpoint: `code-reviewer` reviews monorepo structure, types, auth security

---

## Phase 2: Core Systems (Canvas + WS Server + API)

All 4 tracks run **in parallel** — they are independent.

### Track 2A: Canvas Rendering Engine — `react-specialist`
Reference: `docs/canvas-engine.md`
1. Viewport system (pan/zoom/transform matrix/visible bounds)
2. Renderer (Canvas 2D + rough.js, 4-layer pipeline: grid → elements → HTML overlay → presence)
3. Input handler (tool-based dispatch, hit testing, box select, move/resize)
4. Canvas Manager orchestration
5. React `<WhiteboardCanvas>` component
- **Deliverable:** Local drawing works (pen, shapes), pan/zoom, select/move/resize. No collaboration yet.

### Track 2B: WebSocket Server — `websocket-engineer`
Reference: `docs/realtime-sync.md`
1. Express + Socket.io + y-websocket server setup
2. JWT auth middleware on WS connection
3. Room management (join/leave, permissions, color assignment)
4. Presence event handling (`cursor:move`, `user:join/leave`, `selection:set`, `viewport:share`)
5. Yjs persistence to MongoDB (debounced snapshots, load on room open)
- **Deliverable:** WS server authenticates, manages rooms, syncs Yjs, handles presence.

### Track 2C: Zustand UI Stores — `react-specialist`
- `ui-store.ts`: activeTool, activeShapeType, strokeColor, strokeWidth, zoom, isDarkMode, selectedElementIds
- `presence-store.ts`: remoteUsers map, cursor/selection actions

### Track 2D: REST API Routes — `api-designer`
- Board CRUD: `POST/GET/PATCH/DELETE /api/boards[/id]`
- Invite: `POST /api/boards/[id]/invite`, `GET /api/invite/[code]`
- Members: `GET/PATCH /api/boards/[id]/members[/userId]`

### Review Checkpoint: `code-reviewer` reviews canvas architecture, WS server security, API validation

---

## Phase 3: Integration + Main Pages

### Track 3A: Yjs Client Integration — `react-specialist` (needs 2A + 2B)
- `useYjs` hook (Y.Doc, y-websocket provider, y-indexeddb, Y.UndoManager)
- Element CRUD operations on Y.Map
- Sticky note with Y.Text + contenteditable overlay
- Connect canvas renderer to Y.Map as data source

### Track 3B: Socket.io Presence Client — `react-specialist` (needs 2B + 2C)
- `useSocket` hook (connect with JWT, join room, emit cursors throttled 50ms)
- `<RemoteCursor>`, `<AvatarStack>`, `<SelectionHighlight>` components

### Track 3C: Toolbar + UI — `ui-designer` (needs 2C + Stitch designs)
Reference: Stitch "Whiteboard Canvas" screen
- Install shadcn/ui components (Button, Popover, Dialog, Tooltip, Slider, etc.)
- Toolbar: tool selection, color picker, stroke width
- Zoom controls
- Use `ui-ux-pro-max` skill for design refinement

### Track 3D: Dashboard Page — `nextjs-developer` (needs 2D + Stitch designs)
Reference: Stitch "Room Dashboard" screen
- Board grid page, board cards with thumbnails, create board dialog

### Track 3E: Board Page Shell — `nextjs-developer` (needs 3A + 3B + 3C)
- `/board/[id]/page.tsx`: mount canvas, init Yjs, init Socket.io
- Layout: toolbar left, canvas center, avatars top-right, zoom bottom-right

### Parallelism: `3A + 3B` parallel, `3C + 3D` parallel → then `3E` after all

### Review Checkpoint: `code-reviewer` reviews integration, hook dependencies, memory leak risks

---

## Phase 4: Features + Polish (up to 6 parallel tracks)

| Track | Agent | Tasks |
|-------|-------|-------|
| 4A: Comment Threads | `react-specialist` | Pin rendering, popover panel, Y.Array messages, resolve/unresolve |
| 4B: Settings + Invites | `nextjs-developer` | `/board/[id]/settings`, `/invite/[code]`, member management |
| 4C: Landing Page | `ui-designer` + `ui-ux-pro-max` | Hero, features grid, CTA, responsive. Ref: Stitch "Architecture Dashboard" |
| 4D: Keyboard Shortcuts | `react-specialist` | Tool shortcuts (V/P/H/E/R/S/C), undo/redo, delete, select all |
| 4E: Minimap + Export | `react-specialist` | Minimap with viewport rect, PNG/SVG export |
| 4F: Dark/Light Mode | `ui-designer` | Tailwind class-based dark mode, canvas dark theme, toggle component |

### Review Checkpoint: `code-reviewer` reviews full app — UX flows, accessibility, error/empty/loading states

---

## Phase 5: Testing + Performance + Deployment

### Track 5A: Testing — `test-automator`
- Unit tests (Vitest): shared types, element operations, viewport transforms, hit testing, API routes
- Integration tests: auth flow, board CRUD, Yjs sync between two clients
- E2E tests (Playwright): sign in, create board, draw, two-browser collab, invite flow

### Track 5B: Performance — `performance-engineer`
- Canvas: element culling, dirty-rect rendering, throttle renders during rapid Yjs updates
- WebSocket: cursor throttle verification, Yjs payload optimization
- Frontend: bundle analysis, lazy loading, Core Web Vitals audit

### Track 5C: Deployment — `deployment-engineer` + `devops-engineer`
- Vercel config for `apps/web` (build command, env vars)
- Railway config for `apps/ws-server` (Dockerfile, health check, env vars)
- MongoDB Atlas production setup
- Production CORS, JWT secrets, logging

### Final Review: `code-reviewer` — security audit, production readiness

---

## Agent Utilization Summary

| Agent | Phases Active |
|-------|--------------|
| nextjs-developer | 1A, 1D, 3D, 3E, 4B |
| react-specialist | 2A, 2C, 3A, 3B, 4A, 4D, 4E |
| typescript-pro | 1B |
| websocket-engineer | 2B |
| api-designer | 1C, 2D |
| ui-designer | Phase 0, 3C, 4C, 4F |
| code-reviewer | Review after each phase |
| test-automator | 5A |
| performance-engineer | 5B |
| deployment-engineer | 1E, 5C |
| devops-engineer | 5C |

## Max Parallel Agents per Phase

| Phase | Parallel Agents | Which |
|-------|----------------|-------|
| 0 | 1 | ui-designer |
| 1 | 2 | nextjs-developer + deployment-engineer |
| 2 | **4** | react-specialist, websocket-engineer, api-designer |
| 3 | 3 | react-specialist, ui-designer, nextjs-developer |
| 4 | **3** | react-specialist, nextjs-developer, ui-designer |
| 5 | **3** | test-automator, performance-engineer, deployment+devops |

## Critical Risk Areas

1. **Canvas + Yjs integration (Track 3A)** — Most complex integration point. Canvas renderer must efficiently observe Y.Map changes and re-render only affected elements.
2. **y-websocket + Socket.io coexistence (Track 2B)** — Two WebSocket protocols on same server. y-websocket uses `/yjs` upgrade path, Socket.io uses `/socket.io`.
3. **Sticky note HTML overlay positioning (Track 3A)** — Positioning `contenteditable` divs over canvas coordinates during pan/zoom is error-prone.
4. **Offline/reconnection (Track 3A)** — y-indexeddb + reconnection needs careful testing. UI must handle reconnection states gracefully.

## Critical Reference Files

- `docs/architecture.md` — Monorepo folder layout (lines 106-141) for scaffolding
- `docs/canvas-engine.md` — 4-layer rendering, element data models, interaction model
- `docs/realtime-sync.md` — Yjs doc structure, Socket.io events, persistence, reconnection
- `docs/rules.md` — TypeScript/React/Yjs/Socket.io conventions, env vars
- `.claude/rules/STITCH_DESIGN.md` — Stitch project + screen IDs for design fetch

## Verification

After each phase:
1. `turbo build` succeeds (no type errors)
2. `turbo lint` passes
3. Manual smoke test of new features
4. Code review checkpoint passes

End-to-end verification after Phase 5:
1. Sign in via Google/GitHub OAuth
2. Create board from dashboard
3. Open board, draw freehand + shapes + sticky notes
4. Open same board in second browser — verify real-time sync
5. Verify cursor presence, avatar stack, selection awareness
6. Test invite flow, board settings
7. Test offline → reconnect → merge
8. Lighthouse audit on landing page and dashboard
