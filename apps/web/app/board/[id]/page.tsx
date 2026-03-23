'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Settings, Share2, Undo2, Redo2 } from 'lucide-react'
import { FONTS, GRADIENTS, STATUS_COLORS } from '@/lib/theme'

import { WhiteboardCanvas } from '@/components/canvas/whiteboard-canvas'
import type { WhiteboardCanvasHandle } from '@/components/canvas/whiteboard-canvas'
import { StickyNoteOverlay } from '@/components/canvas/sticky-note-overlay'
import { CommentOverlay } from '@/components/canvas/comment-overlay'
import { TextOverlay } from '@/components/canvas/text-overlay'
import { CanvasContextMenu } from '@/components/canvas/canvas-context-menu'
import {
  Toolbar,
  ColorPicker,
  StrokeWidthPicker,
  ZoomControls,
} from '@/components/toolbar'
import { AvatarStack } from '@/components/presence/avatar-stack'

import { useYjs } from '@/hooks/use-yjs'
import { useSocket } from '@/hooks/use-socket'
import { usePresence } from '@/hooks/use-presence'
import { useUIStore } from '@/lib/stores/ui-store'
import type { ConnectionStatus } from '@/hooks/use-yjs'
import type { ElementCreatePayload, ElementUpdatePayload } from '@/components/canvas/input-handler'
import * as Y from 'yjs'
import type { CommentElement, StickyNoteElement, TextElement } from '@whiteboard/shared'
import type { StickyColor } from '@whiteboard/shared'

// ---------------------------------------------------------------------------
// Connection status indicator
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  ConnectionStatus,
  { color: string; label: string; bg: string }
> = {
  connected: {
    color: STATUS_COLORS.connected.color,
    label: 'Connected',
    bg: STATUS_COLORS.connected.bg,
  },
  connecting: {
    color: STATUS_COLORS.connecting.color,
    label: 'Connecting',
    bg: STATUS_COLORS.connecting.bg,
  },
  disconnected: {
    color: STATUS_COLORS.disconnected.color,
    label: 'Disconnected',
    bg: STATUS_COLORS.disconnected.bg,
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
        border: '1px solid var(--wb-ghost-border)',
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
          fontFamily: FONTS.inter,
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
  onShare: () => void
  shareCopied: boolean
}

function TopBar({ boardId, connectionStatus, remoteUsers, onShare, shareCopied }: TopBarProps) {
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
        background: 'var(--wb-glass-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--wb-ghost-border)',
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
          title="Copy board link"
          onClick={onShare}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            height: 32,
            padding: '0 12px',
            borderRadius: 'var(--wb-radius-md, 0.375rem)',
            background: shareCopied ? 'var(--wb-surface-container-low)' : GRADIENTS.primary,
            border: shareCopied ? '1px solid var(--wb-ghost-border)' : 'none',
            color: shareCopied ? 'var(--wb-on-surface)' : 'var(--wb-on-primary-solid)',
            fontSize: '12px',
            fontFamily: FONTS.inter,
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: shareCopied ? 'none' : 'var(--wb-primary-shadow-sm)',
            transition: 'all 200ms',
          }}
        >
          <Share2 size={13} aria-hidden="true" />
          {shareCopied ? 'Copied!' : 'Share'}
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
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '6px 8px',
        background: 'var(--wb-glass-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: 'var(--wb-radius-xl, 0.75rem)',
        border: '1px solid var(--wb-ghost-border)',
        boxShadow: 'var(--wb-shadow-ambient)',
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

  const { activeTool, activeShapeType, strokeColor, strokeWidth, fillColor, setSelectedElementIds, setActiveTool } = useUIStore()

  const canvasRef = useRef<WhiteboardCanvasHandle>(null)
  const [viewportState, setViewportState] = useState({ translateX: 0, translateY: 0, scale: 1 })
  const [focusedStickyId, setFocusedStickyId] = useState<string | null>(null)
  const [focusedTextId, setFocusedTextId] = useState<string | null>(null)
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; elementId: string } | null>(null)
  const [shareCopied, setShareCopied] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Redirect unauthenticated users (layout handles server-side, this guards
  // client-side hydration races)
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.replace('/signin')
    }
  }, [sessionStatus, router])

  // ---------------------------------------------------------------------------
  // Canvas event handlers — write mutations directly into the Yjs elementsMap
  // ---------------------------------------------------------------------------

  const handleElementCreate = useMemo(
    () =>
      (payload: ElementCreatePayload) => {
        if (!elementsMap || !doc) return
        doc.transact(() => {
          const yEl = new Y.Map<unknown>()
          const el = payload.element
          const id = (payload as ElementCreatePayload & { id: string }).id

          yEl.set('id', id)
          yEl.set('type', el.type)
          yEl.set('position', el.position)
          yEl.set('size', el.size)
          yEl.set('style', el.style)
          yEl.set('data', el.data)
          yEl.set('zIndex', elementsMap.size)
          yEl.set('createdBy', session?.user?.userId ?? 'anonymous')
          yEl.set('locked', false)

          elementsMap.set(id, yEl as Y.Map<unknown>)

          // Auto-focus sticky notes on creation
          if (el.type === 'sticky') {
            // Schedule after React re-render
            setTimeout(() => setFocusedStickyId(id), 50)
          }
          if (el.type === 'comment') {
            // no auto-focus for comments; editing activated via double-click
          }
          if (el.type === 'text') {
            setTimeout(() => setFocusedTextId(id), 50)
          }
          if (el.type === 'sticky' || el.type === 'comment' || el.type === 'text') {
            setActiveTool('select')
          }
        })
      },
    [elementsMap, doc, session?.user?.userId, setActiveTool],
  )

  const handleElementUpdate = useMemo(
    () =>
      (payload: ElementUpdatePayload) => {
        if (!elementsMap || !doc) return
        doc.transact(() => {
          const yEl = elementsMap.get(payload.id)
          if (!yEl) return
          const updates: Record<string, unknown> = {}
          if (payload.position) updates.position = payload.position
          if (payload.size) updates.size = payload.size
          if (payload.data) updates.data = payload.data
          if (payload.changes) Object.assign(updates, payload.changes)
          Object.entries(updates).forEach(([k, v]) => {
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

  // Sync keyboard undo/redo to Yjs undoManager, and Delete/Backspace to remove selected elements
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const ctrl = isMac ? e.metaKey : e.ctrlKey

      if ((e.key === 'Delete' || e.key === 'Backspace') && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement
        if (target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
        const ids = useUIStore.getState().selectedElementIds
        if (ids.length > 0) {
          e.preventDefault()
          handleElementDelete(ids)
          useUIStore.getState().setSelectedElementIds([])
        }
        return
      }

      if (!undoManager) return
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
  }, [undoManager, handleElementDelete])

  const handleViewportChange = useMemo(
    () => () => {
      // Viewport changes are local-only; no Yjs update needed
    },
    [],
  )

  const handleViewportSnapshot = useCallback(
    (v: { translateX: number; translateY: number; scale: number }) => {
      setViewportState(v)
    },
    [],
  )

  const handleStickyTextChange = useCallback(
    (id: string, text: string) => {
      if (!elementsMap || !doc) return
      doc.transact(() => {
        const yEl = elementsMap.get(id)
        if (!yEl) return
        const data = yEl.get('data') as Record<string, unknown>
        yEl.set('data', { ...data, text })
      })
    },
    [elementsMap, doc],
  )

  const commentElements = elements.filter((e) => e.type === 'comment') as CommentElement[]
  const textElements = elements.filter((e) => e.type === 'text') as TextElement[]

  const handleTextTextChange = useCallback(
    (id: string, text: string) => {
      const el = elements.find((e) => e.id === id) as TextElement | undefined
      if (!el) return
      handleElementUpdate({ id, data: { ...el.data, text } })
    },
    [elements, handleElementUpdate],
  )

  const handleCommentTextChange = useCallback(
    (id: string, text: string) => {
      if (!elementsMap || !doc) return
      doc.transact(() => {
        const yEl = elementsMap.get(id)
        if (!yEl) return
        const data = yEl.get('data') as Record<string, unknown>
        yEl.set('data', { ...data, title: text })
      })
    },
    [elementsMap, doc],
  )

  const handleContextMenu = useCallback(
    (id: string, x: number, y: number) => setCtxMenu({ x, y, elementId: id }),
    [],
  )

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch {
      // fallback: nothing to do — clipboard not available
    }
    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 2000)
  }, [])

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
        onShare={handleShare}
        shareCopied={shareCopied}
      />

      {/* Full-viewport canvas — onMouseMove wires cursor position to Socket.io */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          overflow: 'hidden',
        }}
        aria-label="Whiteboard canvas"
        onMouseMove={(e) => {
          const { translateX, translateY, scale } = viewportState
          emitCursorMove(
            (e.clientX - translateX) / scale,
            (e.clientY - translateY) / scale,
          )
        }}
        onTouchMove={(e) => {
          const touch = e.touches[0]
          if (!touch) return
          const { translateX, translateY, scale } = viewportState
          emitCursorMove(
            (touch.clientX - translateX) / scale,
            (touch.clientY - translateY) / scale,
          )
        }}
      >
        <WhiteboardCanvas
          ref={canvasRef}
          elements={elements}
          activeTool={activeTool}
          activeShapeType={activeShapeType}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          fillColor={fillColor}
          remoteCursors={remoteCursors}
          onElementCreate={handleElementCreate}
          onElementUpdate={handleElementUpdate}
          onElementSelect={handleElementSelect}
          onElementDelete={handleElementDelete}
          onViewportChange={handleViewportChange}
          onViewportSnapshot={handleViewportSnapshot}
          className="w-full h-full"
        />

        <StickyNoteOverlay
          stickies={elements.filter((e) => e.type === 'sticky') as StickyNoteElement[]}
          viewport={viewportState}
          focusedId={focusedStickyId}
          onTextChange={handleStickyTextChange}
          onFocusChange={setFocusedStickyId}
          onPositionChange={(id, x, y) => handleElementUpdate({ id, position: { x, y } })}
          onContextMenu={handleContextMenu}
        />

        <CommentOverlay
          comments={commentElements}
          viewport={viewportState}
          onTextChange={handleCommentTextChange}
          onPositionChange={(id, x, y) => handleElementUpdate({ id, position: { x, y } })}
          onContextMenu={handleContextMenu}
        />

        <TextOverlay
          texts={textElements}
          viewport={viewportState}
          focusedId={focusedTextId}
          onTextChange={handleTextTextChange}
          onFocusChange={setFocusedTextId}
          onPositionChange={(id, x, y) => handleElementUpdate({ id, position: { x, y } })}
          onContextMenu={handleContextMenu}
        />

      </div>

      {/* Floating toolbar — left center */}
      <Toolbar />

      {/* Color + stroke pickers — above toolbar on mobile, left-side on desktop */}
      <div
        className="fixed z-50 flex items-center gap-1 bottom-36 left-1/2 -translate-x-1/2 flex-row md:flex-col md:bottom-[72px] md:left-4 md:translate-x-0"
        style={{
          padding: '6px',
          background: 'var(--wb-surface-container-low-glass)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 'var(--wb-radius-xl, 0.75rem)',
          border: '1px solid var(--wb-ghost-border)',
          boxShadow: 'var(--wb-shadow-ambient)',
        }}
        role="toolbar"
        aria-label="Drawing options"
      >
        <ColorPicker showFill side={isMobile ? 'top' : 'right'} />
        <StrokeWidthPicker side={isMobile ? 'top' : 'right'} />
      </div>

      {/* Zoom controls — bottom right (self-positioned via fixed) */}
      <ZoomControls
        onZoomIn={() => canvasRef.current?.zoomIn()}
        onZoomOut={() => canvasRef.current?.zoomOut()}
        onReset={() => canvasRef.current?.resetZoom()}
      />

      {/* Undo / Redo — bottom center */}
      <BottomBar undoManager={undoManager} />

      {/* Context menu — rendered when right-clicking an element */}
      {ctxMenu && (
        <CanvasContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          element={elements.find((e) => e.id === ctxMenu.elementId) ?? null}
          onClose={() => setCtxMenu(null)}
          onDelete={() => {
            handleElementDelete([ctxMenu.elementId])
            setCtxMenu(null)
          }}
          onColorChange={(color) => {
            const el = elements.find((e) => e.id === ctxMenu.elementId)
            if (!el) return
            if (el.type === 'sticky') {
              handleElementUpdate({ id: el.id, data: { ...el.data, color: color as StickyColor } })
            } else {
              handleElementUpdate({ id: el.id, changes: { style: { ...el.style, color } } })
            }
            setCtxMenu(null)
          }}
        />
      )}
    </>
  )
}
