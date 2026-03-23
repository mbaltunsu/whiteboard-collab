"use client"

import { useEffect, useRef } from "react"
import type { StickyNoteElement } from "@whiteboard/shared"

interface ViewportSnapshot {
  translateX: number
  translateY: number
  scale: number
}

interface StickyNoteOverlayProps {
  stickies: StickyNoteElement[]
  viewport: ViewportSnapshot
  focusedId: string | null
  onTextChange: (id: string, text: string) => void
  onFocusChange: (id: string | null) => void
  onPositionChange: (id: string, x: number, y: number) => void
  onContextMenu?: (id: string, x: number, y: number) => void
}

const STICKY_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  yellow: { bg: "#fef9c3", border: "#fde047", text: "#713f12" },
  pink:   { bg: "#fce7f3", border: "#f9a8d4", text: "#831843" },
  blue:   { bg: "#dbeafe", border: "#93c5fd", text: "#1e3a5f" },
  green:  { bg: "#dcfce7", border: "#86efac", text: "#14532d" },
  purple: { bg: "#f3e8ff", border: "#d8b4fe", text: "#581c87" },
}

function StickyNote({
  sticky,
  viewport,
  focused,
  onTextChange,
  onFocusChange,
  onPositionChange,
  onContextMenu,
}: {
  sticky: StickyNoteElement
  viewport: ViewportSnapshot
  focused: boolean
  onTextChange: (id: string, text: string) => void
  onFocusChange: (id: string | null) => void
  onPositionChange: (id: string, x: number, y: number) => void
  onContextMenu?: (id: string, x: number, y: number) => void
}) {
  const divRef = useRef<HTMLDivElement>(null)
  const isFocusedRef = useRef(false)
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const { translateX, translateY, scale } = viewport
  const { x, y } = sticky.position
  const { w, h } = sticky.size
  const color = sticky.data.color in STICKY_STYLES ? sticky.data.color : "yellow"
  const styles = STICKY_STYLES[color]

  // Sync content to DOM only when not focused — prevents cursor jump
  useEffect(() => {
    if (divRef.current && !isFocusedRef.current) {
      divRef.current.innerText = sticky.data.text
    }
  }, [sticky.data.text])

  // Auto-focus when this note is the focused one
  useEffect(() => {
    if (focused && divRef.current) {
      divRef.current.focus()
      // Place cursor at end
      const range = document.createRange()
      const sel = window.getSelection()
      range.selectNodeContents(divRef.current)
      range.collapse(false)
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }, [focused])

  const screenX = x * scale + translateX
  const screenY = y * scale + translateY
  const screenW = w * scale
  const screenH = h * scale
  const fontSize = sticky.data.fontSize * scale

  return (
    <div
      style={{
        position: "absolute",
        left: screenX,
        top: screenY,
        width: screenW,
        height: screenH,
        backgroundColor: styles.bg,
        border: `1.5px solid ${styles.border}`,
        borderRadius: 6,
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        cursor: "default",
        pointerEvents: "auto",
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onContextMenu?.(sticky.id, e.clientX, e.clientY)
      }}
    >
      {/* Header strip */}
      <div
        style={{
          height: Math.max(8, 8 * scale),
          backgroundColor: styles.border,
          flexShrink: 0,
          cursor: "move",
        }}
        onPointerDown={(e) => {
          e.stopPropagation()
          e.currentTarget.setPointerCapture(e.pointerId)
          dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            origX: sticky.position.x,
            origY: sticky.position.y,
          }
        }}
        onPointerMove={(e) => {
          if (!dragRef.current) return
          const { scale } = viewport
          const nx = dragRef.current.origX + (e.clientX - dragRef.current.startX) / scale
          const ny = dragRef.current.origY + (e.clientY - dragRef.current.startY) / scale
          onPositionChange(sticky.id, nx, ny)
        }}
        onPointerUp={() => { dragRef.current = null }}
        onPointerCancel={() => { dragRef.current = null }}
      />
      {/* Text area */}
      <div
        ref={divRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => {
          onTextChange(sticky.id, (e.target as HTMLDivElement).innerText)
        }}
        onFocus={() => { isFocusedRef.current = true; onFocusChange(sticky.id) }}
        onBlur={() => { isFocusedRef.current = false; onFocusChange(null) }}
        style={{
          flex: 1,
          padding: Math.max(4, 6 * scale),
          fontSize,
          color: styles.text,
          fontFamily: "Inter, sans-serif",
          lineHeight: 1.4,
          outline: "none",
          overflowY: "auto",
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
        }}
        data-sticky-id={sticky.id}
      />
    </div>
  )
}

export function StickyNoteOverlay({
  stickies,
  viewport,
  focusedId,
  onTextChange,
  onFocusChange,
  onPositionChange,
  onContextMenu,
}: StickyNoteOverlayProps) {
  if (stickies.length === 0) return null

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {stickies.map((sticky) => (
        <StickyNote
          key={sticky.id}
          sticky={sticky}
          viewport={viewport}
          focused={focusedId === sticky.id}
          onTextChange={onTextChange}
          onFocusChange={onFocusChange}
          onPositionChange={onPositionChange}
          onContextMenu={onContextMenu}
        />
      ))}
    </div>
  )
}
