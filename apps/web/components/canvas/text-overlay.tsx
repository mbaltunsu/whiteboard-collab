"use client"

import { useEffect, useRef, useState } from "react"
import type { TextElement } from "@whiteboard/shared"

interface ViewportSnapshot {
  translateX: number
  translateY: number
  scale: number
}

interface TextOverlayProps {
  texts: TextElement[]
  viewport: ViewportSnapshot
  focusedId: string | null
  onTextChange: (id: string, text: string) => void
  onFocusChange: (id: string | null) => void
  onPositionChange: (id: string, x: number, y: number) => void
  onContextMenu?: (id: string, x: number, y: number) => void
}

function TextBox({
  text,
  viewport,
  focused,
  onTextChange,
  onFocusChange,
  onPositionChange,
  onContextMenu,
}: {
  text: TextElement
  viewport: ViewportSnapshot
  focused: boolean
  onTextChange: (id: string, text: string) => void
  onFocusChange: (id: string | null) => void
  onPositionChange: (id: string, x: number, y: number) => void
  onContextMenu?: (id: string, x: number, y: number) => void
}) {
  const divRef = useRef<HTMLDivElement>(null)
  const isFocusedRef = useRef(false)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { translateX, translateY, scale } = viewport

  const screenX = text.position.x * scale + translateX
  const screenY = text.position.y * scale + translateY
  const screenW = text.size.w * scale
  const screenH = text.size.h * scale
  const fontSize = text.data.fontSize * scale

  // Sync content when not focused
  useEffect(() => {
    if (divRef.current && !isFocusedRef.current) {
      divRef.current.innerText = text.data.text
    }
  }, [text.data.text])

  // Auto-focus on creation
  useEffect(() => {
    if (focused && divRef.current) {
      divRef.current.focus()
      const range = document.createRange()
      const sel = window.getSelection()
      range.selectNodeContents(divRef.current)
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
        width: screenW,
        minHeight: screenH,
        zIndex: 99999,
        pointerEvents: "auto",
        cursor: isDragging ? "grabbing" : "default",
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onContextMenu?.(text.id, e.clientX, e.clientY)
      }}
      onPointerDown={(e) => {
        if (e.target === divRef.current) return
        longPressTimer.current = setTimeout(() => {
          setIsDragging(true)
          e.currentTarget.setPointerCapture(e.pointerId)
          dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            origX: text.position.x,
            origY: text.position.y,
          }
        }, 200)
      }}
      onPointerMove={(e) => {
        if (!isDragging || !dragRef.current) return
        const { scale } = viewport
        const nx = dragRef.current.origX + (e.clientX - dragRef.current.startX) / scale
        const ny = dragRef.current.origY + (e.clientY - dragRef.current.startY) / scale
        onPositionChange(text.id, nx, ny)
      }}
      onPointerUp={() => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current)
        setIsDragging(false)
        dragRef.current = null
      }}
      onPointerCancel={() => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current)
        setIsDragging(false)
        dragRef.current = null
      }}
    >
      <div
        ref={divRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onTextChange(text.id, (e.target as HTMLDivElement).innerText)}
        onFocus={() => { isFocusedRef.current = true; onFocusChange(text.id) }}
        onBlur={() => { isFocusedRef.current = false; onFocusChange(null) }}
        style={{
          fontSize,
          color: text.style.color,
          fontFamily: "Inter, sans-serif",
          lineHeight: 1.4,
          outline: "none",
          minHeight: screenH,
          padding: 4,
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
          border: focused ? "1.5px dashed rgba(100,100,100,0.4)" : "1.5px dashed transparent",
          borderRadius: 4,
          background: "transparent",
          cursor: "text",
        }}
        data-text-id={text.id}
      />
    </div>
  )
}

export function TextOverlay({
  texts,
  viewport,
  focusedId,
  onTextChange,
  onFocusChange,
  onPositionChange,
  onContextMenu,
}: TextOverlayProps) {
  if (texts.length === 0) return null

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {texts.map((t) => (
        <TextBox
          key={t.id}
          text={t}
          viewport={viewport}
          focused={focusedId === t.id}
          onTextChange={onTextChange}
          onFocusChange={onFocusChange}
          onPositionChange={onPositionChange}
          onContextMenu={onContextMenu}
        />
      ))}
    </div>
  )
}
