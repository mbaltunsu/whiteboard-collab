"use client"

import { useEffect, useRef } from "react"
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
}

function TextBox({
  text,
  viewport,
  focused,
  onTextChange,
  onFocusChange,
}: {
  text: TextElement
  viewport: ViewportSnapshot
  focused: boolean
  onTextChange: (id: string, text: string) => void
  onFocusChange: (id: string | null) => void
}) {
  const divRef = useRef<HTMLDivElement>(null)
  const isFocusedRef = useRef(false)
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
      }}
      onMouseDown={(e) => e.stopPropagation()}
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
        />
      ))}
    </div>
  )
}
