# MVP Features

## Core Canvas

- Infinite pan/zoom canvas with dot grid background
- Freehand drawing with pen, highlighter, and eraser tools
- Shapes: rectangle, ellipse, diamond, arrow, line
- Sticky notes with collaborative rich text editing
- Comment threads pinned to canvas positions
- Element select, move, resize, delete
- Undo/redo via Yjs UndoManager
- Hand-drawn aesthetic via rough.js
- Color picker and stroke width controls

## Realtime Collaboration

- Live cursor presence with user names and assigned colors
- Multi-user simultaneous editing (conflict-free via CRDT)
- Selection awareness — see which elements others have selected
- User avatar stack showing who's currently in the room
- Typing indicators on sticky notes being edited by others
- Optimistic updates — zero perceived latency for the acting user
- Automatic reconnection with state recovery
- Offline editing support via y-indexeddb

## Rooms & Authentication

- NextAuth.js authentication with Google and GitHub OAuth
- Board creation from dashboard
- Invite via shareable link with unique room code
- Room-level permissions: owner, editor, viewer
- Board thumbnails displayed on dashboard
- Full board persistence — close browser and return later
- Board settings page (rename, manage members, permissions)

## UX Polish

- Toolbar with tool selection, color picker, stroke width
- Keyboard shortcuts for common actions
- Dark/light mode toggle
- Minimap for canvas navigation
- Zoom controls (+/-, fit to screen, zoom to selection)
- Export board as PNG or SVG
- Responsive layout (desktop-first, tablet-aware)

## Page Map

| Route | Page | Auth Required |
|-------|------|--------------|
| `/` | Landing page — hero, features, CTA | No |
| `/auth/signin` | NextAuth sign-in (Google/GitHub) | No |
| `/dashboard` | Board grid — view, create, manage boards | Yes |
| `/board/[id]` | Whiteboard canvas (main app) | Yes |
| `/board/[id]/settings` | Board settings, members, permissions | Yes (owner) |
| `/invite/[code]` | Accept invite → redirect to board | Yes |
