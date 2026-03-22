"use client"

import { useEffect, useRef, useState } from "react"
import type { CommentElement, CommentMessage } from "@whiteboard/shared"

interface ViewportSnapshot {
  translateX: number
  translateY: number
  scale: number
}

interface CommentOverlayProps {
  comments: CommentElement[]
  viewport: ViewportSnapshot
  focusedId: string | null
  onTitleChange: (id: string, title: string) => void
  onAddMessage: (id: string, text: string) => void
  onFocusChange: (id: string | null) => void
}

function CommentCard({
  comment,
  viewport,
  focused,
  onTitleChange,
  onAddMessage,
  onFocusChange,
}: {
  comment: CommentElement
  viewport: ViewportSnapshot
  focused: boolean
  onTitleChange: (id: string, title: string) => void
  onAddMessage: (id: string, text: string) => void
  onFocusChange: (id: string | null) => void
}) {
  const titleRef = useRef<HTMLDivElement>(null)
  const isFocusedRef = useRef(false)
  const [replyText, setReplyText] = useState("")
  const { translateX, translateY, scale } = viewport

  const screenX = comment.position.x * scale + translateX
  const screenY = comment.position.y * scale + translateY
  const screenW = comment.size.w * scale
  const screenH = comment.size.h * scale
  const fontSize = Math.max(11, 13 * scale)
  const padding = Math.max(6, 8 * scale)

  // Sync title content when not focused
  useEffect(() => {
    if (titleRef.current && !isFocusedRef.current) {
      titleRef.current.innerText = comment.data.title || ""
    }
  }, [comment.data.title])

  // Auto-focus on creation
  useEffect(() => {
    if (focused && titleRef.current) {
      titleRef.current.focus()
      const range = document.createRange()
      const sel = window.getSelection()
      range.selectNodeContents(titleRef.current)
      range.collapse(false)
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }, [focused])

  return (
    <div
      style={{
        position: "absolute",
        left: screenX,
        top: screenY,
        width: Math.max(180, screenW),
        minHeight: Math.max(80, screenH),
        border: "1.5px solid rgba(124, 92, 191, 0.45)",
        borderRadius: 8,
        boxShadow: focused
          ? "0 4px 20px rgba(124, 92, 191, 0.18)"
          : "0 2px 12px rgba(0,0,0,0.08)",
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(2px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        pointerEvents: "auto",
        zIndex: focused ? 10000 : 9000,
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={() => onFocusChange(comment.id)}
    >
      {/* Title */}
      <div
        ref={titleRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onTitleChange(comment.id, (e.target as HTMLDivElement).innerText)}
        onFocus={() => { isFocusedRef.current = true; onFocusChange(comment.id) }}
        onBlur={() => { isFocusedRef.current = false }}
        data-placeholder="Add a comment..."
        style={{
          padding,
          fontSize,
          fontWeight: 500,
          color: "#3d2869",
          fontFamily: "Inter, sans-serif",
          outline: "none",
          minHeight: padding * 3,
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
        }}
      />

      {/* Thread section — shown when focused */}
      {focused && (
        <div
          style={{
            background: "rgba(255,255,255,0.85)",
            borderTop: "1px solid rgba(124,92,191,0.15)",
            padding: padding * 0.75,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {comment.data.messages.map((msg: CommentMessage, i: number) => (
            <div key={i} style={{ fontSize: Math.max(10, 11 * scale), color: "#555" }}>
              <span style={{ fontWeight: 600, color: "#3d2869" }}>{msg.author}: </span>
              {msg.text}
            </div>
          ))}
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && replyText.trim()) {
                onAddMessage(comment.id, replyText.trim())
                setReplyText("")
              }
            }}
            placeholder="Reply..."
            style={{
              marginTop: 4,
              padding: "4px 6px",
              fontSize: Math.max(10, 11 * scale),
              border: "1px solid rgba(124,92,191,0.3)",
              borderRadius: 4,
              outline: "none",
              background: "white",
              color: "#3d2869",
              fontFamily: "Inter, sans-serif",
            }}
          />
        </div>
      )}
    </div>
  )
}

export function CommentOverlay({
  comments,
  viewport,
  focusedId,
  onTitleChange,
  onAddMessage,
  onFocusChange,
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
          focused={focusedId === c.id}
          onTitleChange={onTitleChange}
          onAddMessage={onAddMessage}
          onFocusChange={onFocusChange}
        />
      ))}
    </div>
  )
}
