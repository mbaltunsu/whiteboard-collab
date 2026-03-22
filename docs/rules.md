# Development Rules & Conventions

## TypeScript

- Strict mode enabled (`strict: true` in tsconfig)
- No `any` types — use `unknown` and narrow, or define proper types
- All shared types live in `packages/shared/types/`
- Prefer interfaces for object shapes, types for unions/intersections

## React & Components

- Use functional components exclusively
- Colocate component, styles, and tests in the same directory when possible
- Canvas components (`components/canvas/`, `components/elements/`) handle rendering logic
- UI components (`components/ui/`) are shadcn/ui primitives — don't modify directly, wrap if needed
- Custom hooks in `hooks/` for stateful logic: `useCanvas`, `useYjs`, `usePresence`, `useSocket`
- Avoid prop drilling — use Zustand for UI state, Yjs awareness for collaboration state

## Yjs Document Conventions

- One Y.Doc per board
- Element store: `doc.getMap('elements')` — each element is a nested Y.Map
- Board metadata: `doc.getMap('meta')`
- Sticky note text: individual `Y.Text` instances within element data
- Comment messages: `Y.Array` within element data
- Never read Yjs state outside React's render cycle — use `useSyncExternalStore` or observer pattern
- Use `Y.UndoManager` scoped to the elements map for undo/redo

## Socket.io Event Naming

- Format: `namespace:action` (e.g., `cursor:move`, `user:join`)
- Namespaces: `cursor`, `user`, `selection`, `viewport`
- All events scoped to rooms — never broadcast globally
- Throttle `cursor:move` to 50ms, `viewport:share` to 200ms

## File & Folder Naming

- Files: `kebab-case.ts` / `kebab-case.tsx`
- React components: `PascalCase` export from `kebab-case.tsx` file
- Hooks: `use-canvas.ts` exports `useCanvas`
- Types: `PascalCase` for interfaces and type aliases
- Constants: `SCREAMING_SNAKE_CASE`

## Git Workflow

- Branch naming: `feat/description`, `fix/description`, `refactor/description`
- Commit messages: conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`)
- One feature per branch, one concern per commit
- Never commit `.env` files or secrets

## Git Worktree Rules (Multi-Agent Development)

- Each agent works in its own **git worktree** on a dedicated feature branch
- **One logical unit per commit** — one model, one component, one route, one hook
- Never batch multiple features into a single commit
- **File ownership** — each agent owns specific directories (see `docs/implementation-plan.md` for the map). Never edit files owned by another agent
- `packages/shared/` is owned by `typescript-pro` — other agents import from it, never write to it
- **Rebase onto latest `main`** before opening a PR
- **PR per feature branch** — code-reviewer reviews before merge to main
- If you need a type/constant that doesn't exist in `packages/shared/`, ask (don't create it yourself)
- If confused about file ownership or approach, ask for help rather than guessing

## Environment Variables

```
# apps/web/.env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random-secret>
GOOGLE_CLIENT_ID=<oauth-id>
GOOGLE_CLIENT_SECRET=<oauth-secret>
GITHUB_CLIENT_ID=<oauth-id>
GITHUB_CLIENT_SECRET=<oauth-secret>
MONGODB_URI=mongodb+srv://...
NEXT_PUBLIC_WS_URL=ws://localhost:4000

# apps/ws-server/.env
PORT=4000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<same-as-NEXTAUTH_SECRET>
CORS_ORIGIN=http://localhost:3000
```
