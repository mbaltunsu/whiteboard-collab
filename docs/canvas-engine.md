# Canvas Engine

## Architecture

The canvas system has three core subsystems coordinated by a Canvas Manager:

```
┌─────────────────────────────────────────────────────┐
│                  Canvas Manager                      │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Viewport   │  │  Input       │  │  Renderer  │ │
│  │  (Pan/Zoom) │  │  Handler     │  │  (rough.js │ │
│  │             │  │  (Mouse/     │  │   + Canvas │ │
│  │  - transform│  │   Touch/     │  │   2D API)  │ │
│  │  - bounds   │  │   Keyboard)  │  │            │ │
│  │  - minimap  │  │              │  │  - render  │ │
│  └─────────────┘  └──────────────┘  │    loop    │ │
│                                     │  - layers   │ │
│                                     └─────────────┘ │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │         Element Store (Yjs Y.Map)            │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

- **Viewport** — Manages pan/zoom transforms, calculates visible bounds, drives minimap
- **Input Handler** — Translates mouse/touch/keyboard events into canvas actions based on active tool
- **Renderer** — Draws all elements using rough.js (hand-drawn aesthetic) on HTML5 Canvas 2D API
- **Element Store** — Backed by Yjs `Y.Map` — every element is a CRDT, automatically synced

## Rendering Pipeline (4 Layers)

Rendered bottom-to-top:

| Layer | Content | Technology |
|-------|---------|------------|
| 1. Grid | Infinite dot grid background, scales with zoom | Canvas 2D |
| 2. Elements | Freehand strokes, shapes — sorted by z-index | rough.js on Canvas 2D |
| 3. HTML Overlay | Sticky notes (contenteditable), comments (popovers), selection handles | React DOM positioned over canvas |
| 4. Presence | Remote cursors with name labels, selection outlines in user colors | Canvas 2D overlay |

## Element Data Model

Every element stored in the Yjs Y.Map shares a base schema:

```typescript
interface BaseElement {
  id: string
  type: "freehand" | "sticky" | "shape" | "comment"
  position: { x: number; y: number }
  size: { w: number; h: number }
  style: { color: string; strokeWidth: number; opacity: number }
  zIndex: number
  createdBy: string  // userId
  locked: boolean
}
```

### Freehand

```typescript
interface FreehandData {
  points: [number, number, number][]  // [x, y, pressure]
  tool: "pen" | "highlighter" | "eraser"
  roughness: number  // rough.js hand-drawn intensity (0-3)
}
```

Rendered via `rough.linearPath()` with pressure-sensitive stroke width.

### Sticky Note

```typescript
// Runtime type — uses Yjs collaborative text
interface StickyNoteData {
  text: Y.Text       // Yjs collaborative rich text (runtime only)
  color: "yellow" | "pink" | "blue" | "green" | "purple"
  fontSize: number
}

// Serialized type in packages/shared — no Yjs dependency
interface StickyNoteDataSerialized {
  text: string       // Plain text representation for REST API / DB
  color: "yellow" | "pink" | "blue" | "green" | "purple"
  fontSize: number
}
```

Rendered as HTML overlay (`contenteditable` div) positioned on the canvas. Multi-user text-editing cursors within sticky notes use Yjs awareness protocol (distinct from canvas-level mouse cursors which use Socket.io).

### Shape

```typescript
interface ShapeData {
  shapeType: "rectangle" | "ellipse" | "diamond" | "arrow" | "line"
  fill: string | null
  roughness: number
  connectedTo: string[]  // element IDs for arrow connections
}
```

Rendered via rough.js shape primitives (`rough.rectangle()`, `rough.ellipse()`, etc.).

### Comment Thread

```typescript
interface CommentData {
  resolved: boolean
  messages: Y.Array<{
    author: string    // userId
    text: string
    timestamp: number
  }>
}
```

Rendered as a pin icon on the canvas. Clicking opens a popover panel (shadcn/ui Popover) showing the thread.

## Interaction Model

| Tool | Click | Drag | Double-click |
|------|-------|------|-------------|
| Select | Select element | Move element / box select | Edit text (sticky) |
| Pen | Start stroke | Draw freehand | — |
| Shape | Place shape | Draw shape from corner | — |
| Sticky | Place sticky note | — | — |
| Comment | Place comment pin | — | — |
| Hand | — | Pan canvas | — |
| Eraser | Delete element | Erase stroke segments | — |
