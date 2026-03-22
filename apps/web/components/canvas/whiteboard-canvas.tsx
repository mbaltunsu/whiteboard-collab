"use client"

import { useEffect, useRef } from "react"
import type { WhiteboardElement, ToolType } from "@whiteboard/shared"
import type { PresenceState } from "@whiteboard/shared"
import { CanvasManager } from "./canvas-manager"
import type { ElementCreatePayload, ElementUpdatePayload } from "./input-handler"

export interface WhiteboardCanvasProps {
  elements: WhiteboardElement[]
  activeTool: ToolType
  remoteCursors: PresenceState[]
  onElementCreate?: (payload: ElementCreatePayload & { id: string }) => void
  onElementUpdate?: (payload: ElementUpdatePayload) => void
  onElementSelect?: (ids: string[]) => void
  onElementDelete?: (ids: string[]) => void
  onViewportChange?: () => void
  className?: string
}

export function WhiteboardCanvas({
  elements,
  activeTool,
  remoteCursors,
  onElementCreate,
  onElementUpdate,
  onElementSelect,
  onElementDelete,
  onViewportChange,
  className,
}: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const managerRef = useRef<CanvasManager | null>(null)

  // Initialize manager on mount
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const manager = new CanvasManager()
    managerRef.current = manager

    if (onElementCreate) manager.onElementCreate(onElementCreate)
    if (onElementUpdate) manager.onElementUpdate(onElementUpdate)
    if (onElementSelect) manager.onElementSelect(onElementSelect)
    if (onElementDelete) manager.onElementDelete(onElementDelete)
    if (onViewportChange) manager.onViewportChange(onViewportChange)

    manager.init(canvas)

    return () => {
      manager.destroy()
      managerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync elements
  useEffect(() => {
    managerRef.current?.setElements(elements)
  }, [elements])

  // Sync active tool
  useEffect(() => {
    managerRef.current?.setActiveTool(activeTool)
  }, [activeTool])

  // Sync remote cursors
  useEffect(() => {
    managerRef.current?.setRemoteCursors(remoteCursors)
  }, [remoteCursors])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas || !managerRef.current) return
      const parent = canvas.parentElement
      const width = parent?.clientWidth ?? window.innerWidth
      const height = parent?.clientHeight ?? window.innerHeight
      managerRef.current.resize(width, height)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        background: "#f5f6f7", // surface token
        touchAction: "none",
      }}
    />
  )
}
