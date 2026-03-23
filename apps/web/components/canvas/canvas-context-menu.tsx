"use client"

import { useEffect } from "react"
import type { WhiteboardElement } from "@whiteboard/shared"

interface CanvasContextMenuProps {
  x: number
  y: number
  element: WhiteboardElement | null
  onClose: () => void
  onDelete: () => void
  onColorChange: (color: string) => void
}

function getColorConfig(element: WhiteboardElement | null): { label: string; colors: string[] } {
  if (!element) {
    return {
      label: "Color",
      colors: ["#1a1a1a", "#ffffff", "#ef4444", "#3b82f6", "#22c55e", "#f97316"],
    }
  }

  if (element.type === "sticky") {
    return {
      label: "Background",
      colors: ["#FEF08A", "#FDA4AF", "#BAE6FD", "#BBF7D0", "#E9D5FF"],
    }
  }

  if (element.type === "comment") {
    return {
      label: "Background",
      colors: ["#FFFFFF", "#FFFBEB", "#EFF6FF", "#F0FDF4", "#FFF1F2"],
    }
  }

  return {
    label: "Color",
    colors: ["#1a1a1a", "#ffffff", "#ef4444", "#3b82f6", "#22c55e", "#f97316"],
  }
}

export function CanvasContextMenu({
  x,
  y,
  element,
  onClose,
  onDelete,
  onColorChange,
}: CanvasContextMenuProps) {
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest("[data-ctx-menu]")) onClose()
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  const { label, colors } = getColorConfig(element)

  return (
    <div
      data-ctx-menu
      style={{
        position: "fixed",
        left: x,
        top: y,
        background: "var(--wb-surface-container-low-glass)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: "var(--wb-radius-xl)",
        border: "1px solid var(--wb-ghost-border)",
        boxShadow: "var(--wb-shadow-ambient)",
        minWidth: 180,
        padding: 4,
        zIndex: 9999,
      }}
    >
      <button
        type="button"
        onClick={onDelete}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          padding: "8px 12px",
          background: "none",
          border: "none",
          borderRadius: "var(--wb-radius-md)",
          cursor: "pointer",
          color: "var(--wb-error)",
          fontSize: 14,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--wb-error-alpha-08)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "none"
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
        </svg>
        Delete
      </button>

      <div style={{ height: 1, background: "var(--wb-ghost-border)", margin: "4px 8px" }} />

      <div style={{ padding: "4px 12px 8px" }}>
        <div
          style={{
            fontSize: 11,
            color: "var(--wb-on-surface-variant)",
            marginBottom: 6,
          }}
        >
          {label}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => {
                onColorChange(color)
                onClose()
              }}
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: color,
                border: "2px solid var(--wb-outline-variant)",
                cursor: "pointer",
                padding: 0,
              }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
