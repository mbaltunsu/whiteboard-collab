"use client"

import { useEffect, useRef, useState } from "react"
import type { CommentElement } from "@whiteboard/shared"

interface ViewportSnapshot {
  translateX: number
  translateY: number
  scale: number
}

interface CommentOverlayProps {
  comments: CommentElement[]
  viewport: ViewportSnapshot
  onTextChange: (id: string, text: string) => void
  onPositionChange: (id: string, x: number, y: number) => void
  onContextMenu: (id: string, x: number, y: number) => void
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "")
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(255,255,255,${alpha})`
  return `rgba(${r},${g},${b},${alpha})`
}

function CommentCard({
  comment,
  viewport,
  onTextChange,
  onPositionChange,
  onContextMenu,
}: {
  comment: CommentElement
  viewport: ViewportSnapshot
  onTextChange: (id: string, text: string) => void
  onPositionChange: (id: string, x: number, y: number) => void
  onContextMenu: (id: string, x: number, y: number) => void
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { translateX, translateY, scale } = viewport

  const screenX = comment.position.x * scale + translateX
  const screenY = comment.position.y * scale + translateY

  const bgColor = comment.style?.color
    ? hexToRgba(comment.style.color, 0.55)
    : "rgba(255,255,255,0.6)"

  // Sync content when not editing
  useEffect(() => {
    if (contentRef.current && !isEditing) {
      contentRef.current.innerText = comment.data.title || ""
    }
  }, [comment.data.title, isEditing])

  const handleDoubleClick = () => {
    setIsEditing(true)
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.focus()
        const range = document.createRange()
        const sel = window.getSelection()
        range.selectNodeContents(contentRef.current)
        range.collapse(false)
        sel?.removeAllRanges()
        sel?.addRange(range)
      }
    }, 0)
  }

  return (
    <div
      style={{
        position: "absolute",
        left: screenX,
        top: screenY,
        minWidth: 160,
        maxWidth: 240,
        background: bgColor,
        border: "1px solid rgba(255,255,255,0.35)",
        borderRadius: 12,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        pointerEvents: "auto",
        zIndex: 9000,
        cursor: isEditing ? "text" : "default",
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onContextMenu(comment.id, e.clientX, e.clientY)
      }}
    >
      {/* Drag handle strip */}
      <div
        style={{
          height: 8,
          background: "rgba(124, 92, 191, 0.35)",
          cursor: "move",
          flexShrink: 0,
        }}
        onPointerDown={(e) => {
          e.stopPropagation()
          e.currentTarget.setPointerCapture(e.pointerId)
          dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            origX: comment.position.x,
            origY: comment.position.y,
          }
        }}
        onPointerMove={(e) => {
          if (!dragRef.current) return
          const nx = dragRef.current.origX + (e.clientX - dragRef.current.startX) / scale
          const ny = dragRef.current.origY + (e.clientY - dragRef.current.startY) / scale
          onPositionChange(comment.id, nx, ny)
        }}
        onPointerUp={() => { dragRef.current = null }}
        onPointerCancel={() => { dragRef.current = null }}
      />

      {/* Content */}
      <div
        ref={contentRef}
        contentEditable={isEditing ? "true" : "false"}
        suppressContentEditableWarning
        onInput={(e) => onTextChange(comment.id, (e.target as HTMLDivElement).innerText)}
        onBlur={() => setIsEditing(false)}
        data-placeholder="Add a comment..."
        style={{
          padding: "8px 10px",
          fontSize: 13,
          fontWeight: 500,
          color: "#3d2869",
          fontFamily: "Inter, sans-serif",
          outline: "none",
          minHeight: 36,
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
          cursor: isEditing ? "text" : "default",
        }}
      />
    </div>
  )
}

export function CommentOverlay({
  comments,
  viewport,
  onTextChange,
  onPositionChange,
  onContextMenu,
}: CommentOverlayProps) {
  if (comments.length === 0) return null

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {comments.map((c) => (
        <CommentCard
          key={c.id}
          comment={c}
          viewport={viewport}
          onTextChange={onTextChange}
          onPositionChange={onPositionChange}
          onContextMenu={onContextMenu}
        />
      ))}
    </div>
  )
}
