# Realtime Sync & Presence

## Two Communication Channels

### Channel 1: Yjs (CRDT — Document State)

Everything that persists on the board flows through Yjs:

```
Client A (Y.Doc) ──Yjs update──▶ y-websocket server ──broadcast──▶ Client B (Y.Doc)
                                        │
                                        ▼
                                   MongoDB (periodic snapshot)
```

**What flows through Yjs:**
- Element create / update / delete
- Sticky note text editing (Y.Text — character-level collaborative editing)
- Comment thread messages (Y.Array)
- Element z-index ordering

**Conflict Resolution (Automatic):**
- Two users move the same element → last-writer-wins per field
- Two users edit the same sticky note → character-level merge via Y.Text
- User goes offline, edits, reconnects → Yjs merges cleanly
- No manual conflict resolution code needed

**Yjs Document Structure:**

```
Y.Doc (one per board)
├── elements: Y.Map<string, Y.Map>    // elementId → element data
├── meta: Y.Map                        // board metadata (title, settings)
└── awareness                          // text-editing cursors inside sticky notes (NOT canvas pointer cursors)
```

### Channel 2: Socket.io (Ephemeral Events)

Transient data that doesn't need persistence:

```
Client A ──emit──▶ Socket.io server ──broadcast to room──▶ All other clients
```

**Event Schema:**

| Event | Payload | Throttle |
|-------|---------|----------|
| `cursor:move` | `{ userId, x, y, boardId }` | 50ms |
| `cursor:leave` | `{ userId, boardId }` | — |
| `user:join` | `{ userId, name, avatar, color }` | — |
| `user:leave` | `{ userId }` | — |
| `selection:set` | `{ userId, elementIds[] }` | — |
| `viewport:share` | `{ userId, bounds }` | 200ms |

## Presence System

### State Model (per user, per room)

```typescript
interface PresenceState {
  userId: string
  name: string
  avatar: string
  color: string          // unique per user from 12-color palette
  cursor: { x: number; y: number } | null
  selectedElements: string[]
  isTyping: boolean
  lastSeen: number       // timestamp
}
```

### Color Assignment

Server maintains a 12-color palette. On join, assigns the first unused color. On leave, the color is recycled. Colors are visually distinct for accessibility.

### Rendering

- **Cursors** — Colored arrow + name label following the remote user's mouse position
- **Selections** — Elements selected by remote users get a colored border matching their assigned color
- **Avatar Stack** — Top-right corner shows avatars of all connected users
- **Typing Indicator** — Pulsing dot on sticky notes being edited by remote users

## Optimistic Updates

```
User action
  → Immediately render locally (zero latency)
  → Send Yjs update to server
  → Server broadcasts to other clients
  → Other clients see update in ~50-100ms
  → If conflict: Yjs auto-merges (no user intervention)
```

The acting user never waits for server confirmation. All state is eventually consistent via CRDT.

## Reconnection

1. Client detects disconnect
2. y-indexeddb preserves local Yjs state in browser
3. On reconnect, Yjs syncs only the delta (not full document)
4. Socket.io auto-reconnects and re-joins room
5. Presence state is re-broadcast

Offline edits made during disconnect merge cleanly on reconnection.

## Persistence to MongoDB

The WS server periodically snapshots the Yjs document:

1. On document update, debounce 2 seconds
2. Encode Yjs doc as binary (`Y.encodeStateAsUpdate`)
3. Store in MongoDB `yjsDocs` collection as `Buffer`
4. On room load, decode and apply: `Y.applyUpdate(doc, buffer)`

This means boards survive server restarts and can be loaded on any WS server instance.

## Undo/Redo

Uses Yjs `Y.UndoManager` scoped to the elements map:

- Tracks only the local user's changes — undo never reverts remote users' edits
- Scoped to `doc.getMap('elements')` so metadata changes aren't part of the undo stack
- Keyboard shortcuts: `Ctrl+Z` / `Cmd+Z` for undo, `Ctrl+Shift+Z` / `Cmd+Shift+Z` for redo
- Works correctly with CRDT sync — undoing a local change while remote changes arrive produces consistent state
