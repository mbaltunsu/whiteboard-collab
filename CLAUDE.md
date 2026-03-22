# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**CollaborativeWhiteBoard** — A realtime collaborative whiteboard app (Miro lite) with CRDT-based conflict resolution, live cursor presence, and a hand-drawn aesthetic. Built as both a portfolio showpiece and a usable MVP.

## Tech Stack

| Layer    | Technologies                                                                              |
| -------- | ----------------------------------------------------------------------------------------- |
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, shadcn/ui, rough.js, Zustand |
| Realtime | Yjs (CRDT), y-websocket, Socket.io, y-indexeddb                                           |
| Backend  | MongoDB Atlas, NextAuth.js (Google + GitHub OAuth), Mongoose                              |
| Infra    | Vercel (web), Railway (WS server), Turborepo monorepo                                     |

## Monorepo Layout

```
apps/web/          → Next.js app (Vercel)
apps/ws-server/    → Socket.io + y-websocket server (Railway)
packages/shared/   → Shared types, constants, Yjs schema
```

## Commands

```bash
# Prerequisites: Node.js 18+, MongoDB URI, OAuth credentials (see docs/rules.md for env vars)

# Install (from root)
npm install

# Dev — both apps
turbo dev

# Dev — individual apps
turbo dev --filter=web
turbo dev --filter=ws-server

# Build
turbo build

# Lint
turbo lint

# Type check
turbo typecheck

# Add shadcn/ui component (from apps/web)
npx shadcn-ui@latest add <component>
```

## Reference Docs

Detailed design documents for each system:

- [Architecture](docs/architecture.md) — System overview, data flows, monorepo structure, deployment topology
- [Tech Stack](docs/tech-stack.md) — All technology choices with rationale for each
- [Canvas Engine](docs/canvas-engine.md) — Rendering pipeline, element data models, interaction model
- [Realtime Sync](docs/realtime-sync.md) — Yjs CRDT sync, Socket.io presence, conflict resolution, reconnection
- [Features](docs/features.md) — MVP feature scope, page map with routes
- [Rules](docs/rules.md) — TypeScript, React, Yjs, Socket.io, naming, and git conventions
- [Design Tokens](docs/design-tokens.md) — Color palette, typography, spacing, shadows, component recipes from Stitch
- [Implementation Plan](docs/implementation-plan.md) — Phased build plan with agent assignments and parallel work streams

## Key Architectural Decisions

- **Dual-channel realtime**: Yjs for persistent board state (CRDT, conflict-free), Socket.io for ephemeral presence (cursors, typing indicators)
- **Element Store = Yjs Y.Map**: All board elements are CRDTs — no custom conflict resolution needed
- **rough.js rendering**: Hand-drawn Excalidraw-style aesthetic on HTML5 Canvas 2D API
- **HTML overlay for text**: Sticky notes use `contenteditable` divs positioned over the canvas, not canvas-rendered text
- **Separate WS server**: Vercel doesn't support WebSockets — WS server deploys independently on Railway
- **JWT shared between apps**: NextAuth JWT secret shared with WS server for auth validation on WebSocket connections

## Rules

See [docs/rules.md](docs/rules.md) for full conventions. Key points:

- TypeScript strict mode, no `any`
- All shared types in `packages/shared/types/`
- Yjs doc structure: `doc.getMap('elements')` for elements, `doc.getMap('meta')` for board metadata
- Socket.io events: `namespace:action` format (e.g., `cursor:move`)
- Files: `kebab-case.ts`, components: `PascalCase` exports
- Git: conventional commits (`feat:`, `fix:`, `refactor:`)
- Use "py" for terminal python commands
- Follow rules in `.claude/rules/` folder
- Use `STITCH_DESIGN.md` to fetch designs for reference at start

## Multi-Agent Workflow

- Each agent works in its own **git worktree** on a dedicated feature branch
- **Small commits** — one logical unit per commit (one model, one component, one route)
- **File ownership enforced** — see [Implementation Plan](docs/implementation-plan.md) for the ownership map
- `packages/shared/` is the single source of truth for types — only `typescript-pro` writes to it
- **Rebase + PR** before merging to main — code-reviewer gates every merge
- **scrum-master** coordinates between phases: verifies merges, checks ownership, tracks progress
- If confused about what to do or which files to touch, **ask for help** — don't guess

## Project Team

See [TEAM.md](TEAM.md) for the list of agents configured for this project.
Always use agents and subagents (only when parallel work is really needed).
Distribute work as much as possible.
Use ui-ux-pro-max for ui/ux design and improvements, playwright mcp when visual content needed.
Code reviewer should review after mid/big tasks not small changes.
Try to use design agents early in the development.
Regularly update current status and progress.
