'use client'

import { useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Settings, Share2, Undo2, Redo2 } from 'lucide-react'

import { WhiteboardCanvas } from '@/components/canvas/whiteboard-canvas'
import {
  Toolbar,
  ColorPicker,
  StrokeWidthPicker,
  ZoomControls,
} from '@/components/toolbar'
import { AvatarStack } from '@/components/presence/avatar-stack'
import { RemoteCursor } from '@/components/presence/remote-cursor'

import { useYjs } from '@/hooks/use-yjs'
import { useSocket } from '@/hooks/use-socket'
import { usePresence } from '@/hooks/use-presence'
import { useUIStore } from '@/lib/stores/ui-store'
import type { ConnectionStatus } from '@/hooks/use-yjs'
import type { ElementCreatePayload, ElementUpdatePayload } from '@/components/canvas/input-handler'
import * as Y from 'yjs'
import type { WhiteboardElement } from '@whiteboard/shared'

// ---------------------------------------------------------------------------
// Connection status indicator
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  ConnectionStatus,
  { color: string; label: string; bg: string }
> = {
  connected: {
    color: '#22c55e',
    label: 'Connected',
    bg: 'rgba(34, 197, 94, 0.12)',
  },
  connecting: {
    color: '#f59e0b',
    label: 'Connecting',
    bg: 'rgba(245, 158, 11, 0.12)',
  },
  disconnected: {
    color: '#ef4444',
    label: 'Disconnected',
    bg: 'rgba(239, 68, 68, 0.12)',
  },
}

function ConnectionStatusBadge({ status }: { status: ConnectionStatus }) {
  const config = STATUS_CONFIG[status]
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '9999px',
        background: config.bg,
        border: '1px solid rgba(171, 173, 174, 0.15)',
      }}
      aria-label={`Connection status: ${config.label}`}
      role="status"
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          backgroundColor: config.color,
          display: 'inline-block',
          flexShrink: 0,
          boxShadow: `0 0 0 2px ${config.color}33`,
        }}
        aria-hidden="true"
      />
      <span
        style={{
          fontSize: '11px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          color: 'var(--wb-on-surface-variant, #595c5d)',
          userSelect: 'none',
        }}
      >
        {config.label}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Undo / Redo button
// ---------------------------------------------------------------------------

function HistoryButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: 'var(--wb-radius-md, 0.375rem)',
        background: 'transparent',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        color: 'var(--wb-on-surface-variant, #595c5d)',
        transition: 'background 120ms, color 120ms, opacity 120ms',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          ;(e.currentTarget as HTMLButtonElement).style.background =
            'var(--wb-surface-container-low, #eff1f2)'
          ;(e.currentTarget as HTMLButtonElement).style.color =
            'var(--wb-on-surface, #2c2f30)'
        }
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
        ;(e.currentTarget as HTMLButtonElement).style.color =
          'var(--wb-on-surface-variant, #595c5d)'
      }}
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Top bar
// ---------------------------------------------------------------------------

interface TopBarProps {
  boardId: string
  connectionStatus: ConnectionStatus
  remoteUsers: ReturnType<typeof usePresence>['remoteUsers']
}

function TopBar({ boardId, connectionStatus, remoteUsers }: TopBarProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 48,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(171,173,174,0.15)',
        pointerEvents: 'none',
      }}
    >
      {/* Left: connection status */}
      <div style={{ pointerEvents: 'auto' }}>
        <ConnectionStatusBadge status={connectionStatus} />
      </div>

      {/* Right: avatar stack + share + settings */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          pointerEvents: 'auto',
        }}
      >
        <AvatarStack users={remoteUsers} />

        <button
          type="button"
          aria-label="Share board"
          title="Share board"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            height: 32,
            padding: '0 12px',
            borderRadius: 'var(--wb-radius-md, 0.375rem)',
            background: 'linear-gradient(135deg, #0c0bff, #9097ff)',
            border: 'none',
            color: '#fff',
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(12,11,255,0.2)',
          }}
        >
          <Share2 size={13} aria-hidden="true" />
          Share
        </button>

        <Link
          href={`/board/${boardId}/settings`}
          aria-label="Board settings"
          title="Board settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 'var(--wb-radius-md, 0.375rem)',
            color: 'var(--wb-on-surface-variant, #595c5d)',
            transition: 'background 120ms',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.background =
              'var(--wb-surface-container-low, #eff1f2)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.background =
              'transparent'
          }}
        >
          <Settings size={16} aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Bottom bar (undo/redo)
// ---------------------------------------------------------------------------

interface BottomBarProps {
  undoManager: Y.UndoManager | null
}

function BottomBar({ undoManager }: BottomBarProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '6px 8px',
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: 'var(--wb-radius-xl, 0.75rem)',
        border: '1px solid rgba(171,173,174,0.15)',
        boxShadow: '0 12px 32px -4px rgba(12,15,16,0.08)',
      }}
      role="toolbar"
      aria-label="Edit history"
    >
      <HistoryButton
        onClick={() => undoManager?.undo()}
        disabled={!undoManager}
        label="Undo (Ctrl+Z)"
      >
        <Undo2 size={15} aria-hidden="true" />
      </HistoryButton>
      <HistoryButton
        onClick={() => undoManager?.redo()}
        disabled={!undoManager}
        label="Redo (Ctrl+Shift+Z)"
      >
        <Redo2 size={15} aria-hidden="true" />
      </HistoryButton>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Board page
// ---------------------------------------------------------------------------

export default function BoardPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const boardId = params.id

  const { data: session, status: sessionStatus } = useSession()

  const {
    elements,
    undoManager,
    connectionStatus,
    elementsMap,
    doc,
  } = useYjs(boardId)

  const { emitCursorMove, emitSelectionSet } = useSocket(
    boardId,
    session as Parameters<typeof useSocket>[1],
  )

  const { remoteCursors, remoteUsers } = usePresence()

  const { activeTool, setSelectedElementIds } = useUIStore()

  // Redirect unauthenticated users (layout handles server-side, this guards
  // client-side hydration races)
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.replace('/auth/signin')
    }
  }, [sessionStatus, router])

  // Sync keyboard undo/redo to Yjs undoManager
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!undoManager) return
      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const ctrl = isMac ? e.metaKey : e.ctrlKey
      if (!ctrl) return
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undoManager.undo()
      } else if (e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        undoManager.redo()
      } else if (e.key === 'y') {
        e.preventDefault()
        undoManager.redo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undoManager])

  // ---------------------------------------------------------------------------
  // Canvas event handlers — write mutations directly into the Yjs elementsMap
  // ---------------------------------------------------------------------------

  const handleElementCreate = useMemo(
    () =>
      (payload: ElementCreatePayload & { id: string }) => {
        if (!elementsMap || !doc) return
        doc.transact(() => {
          const yEl = new Y.Map<unknown>()
          const element: WhiteboardElement = {
            id: payload.id,
            type: payload.type,
            x: payload.x,
            y: payload.y,
            width: payload.width ?? 0,
            height: payload.height ?? 0,
            points: (payload as { points?: { x: number; y: number }[] }).points ?? [],
            strokeColor: payload.strokeColor ?? '#2c2f30',
            strokeWidth: payload.strokeWidth ?? 2,
            fillColor: payload.fillColor ?? null,
            roughness: payload.roughness ?? 1,
            opacity: payload.opacity ?? 1,
            zIndex: elementsMap.size,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            createdBy: session?.user?.userId ?? 'anonymous',
          }
          Object.entries(element).forEach(([k, v]) => yEl.set(k, v))
          elementsMap.set(payload.id, yEl as Y.Map<unknown>)
        })
      },
    [elementsMap, doc, session?.user?.userId],
  )

  const handleElementUpdate = useMemo(
    () =>
      (payload: ElementUpdatePayload) => {
        if (!elementsMap || !doc) return
        doc.transact(() => {
          const yEl = elementsMap.get(payload.id)
          if (!yEl) return
          Object.entries(payload.changes).forEach(([k, v]) => {
            yEl.set(k, v)
          })
          yEl.set('updatedAt', Date.now())
        })
      },
    [elementsMap, doc],
  )

  const handleElementSelect = useMemo(
    () =>
      (ids: string[]) => {
        setSelectedElementIds(ids)
        emitSelectionSet(ids)
      },
    [setSelectedElementIds, emitSelectionSet],
  )

  const handleElementDelete = useMemo(
    () =>
      (ids: string[]) => {
        if (!elementsMap || !doc) return
        doc.transact(() => {
          ids.forEach((id) => elementsMap.delete(id))
        })
      },
    [elementsMap, doc],
  )

  const handleViewportChange = useMemo(
    () => () => {
      // Viewport changes are local-only; no Yjs update needed
    },
    [],
  )

  if (sessionStatus === 'loading') {
    return null
  }

  return (
    <>
      {/* Top bar */}
      <TopBar
        boardId={boardId}
        connectionStatus={connectionStatus}
        remoteUsers={remoteUsers}
      />

      {/* Full-viewport canvas — onMouseMove wires cursor position to Socket.io */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          overflow: 'hidden',
        }}
        aria-label="Whiteboard canvas"
        onMouseMove={(e) => emitCursorMove(e.clientX, e.clientY)}
      >
        <WhiteboardCanvas
          elements={elements}
          activeTool={activeTool}
          remoteCursors={remoteCursors}
          onElementCreate={handleElementCreate}
          onElementUpdate={handleElementUpdate}
          onElementSelect={handleElementSelect}
          onElementDelete={handleElementDelete}
          onViewportChange={handleViewportChange}
          className="w-full h-full"
        />

        {/* Remote cursor overlays — positioned absolutely over the canvas */}
        {remoteCursors.map((user) =>
          user.cursor ? (
            <RemoteCursor
              key={user.userId}
              name={user.name}
              color={user.color}
              x={user.cursor.x}
              y={user.cursor.y}
            />
          ) : null,
        )}
      </div>

      {/* Floating toolbar — left center */}
      <Toolbar />

      {/* Color + stroke pickers attached below the toolbar */}
      <div
        style={{
          position: 'fixed',
          left: 16,
          bottom: 72,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          padding: '6px',
          background: 'rgba(239,241,242,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 'var(--wb-radius-xl, 0.75rem)',
          border: '1px solid rgba(171,173,174,0.15)',
          boxShadow: '0 12px 32px -4px rgba(12,15,16,0.08)',
        }}
        role="toolbar"
        aria-label="Drawing options"
      >
        <ColorPicker showFill />
        <StrokeWidthPicker />
      </div>

      {/* Zoom controls — bottom right (self-positioned via fixed) */}
      <ZoomControls />

      {/* Undo / Redo — bottom center */}
      <BottomBar undoManager={undoManager} />
    </>
  )
}
