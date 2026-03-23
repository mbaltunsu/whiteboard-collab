"use client"

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"
import type { WhiteboardElement, ToolType, ShapeType } from "@whiteboard/shared"
import { DEFAULTS } from "@whiteboard/shared"
import type { PresenceState } from "@whiteboard/shared"
import { CanvasManager } from "./canvas-manager"
import type { ElementCreatePayload, ElementUpdatePayload } from "./input-handler"

export interface WhiteboardCanvasHandle {
  zoomIn(): number
  zoomOut(): number
  resetZoom(): number
  setZoomLevel(level: number): void
}

export interface WhiteboardCanvasProps {
  elements: WhiteboardElement[]
  activeTool: ToolType
  activeShapeType?: ShapeType
  strokeColor?: string
  strokeWidth?: number
  fillColor?: string | null
  remoteCursors: PresenceState[]
  onElementCreate?: (payload: ElementCreatePayload & { id: string }) => void
  onElementUpdate?: (payload: ElementUpdatePayload) => void
  onElementSelect?: (ids: string[]) => void
  onElementDelete?: (ids: string[]) => void
  onViewportChange?: () => void
  onViewportSnapshot?: (v: { translateX: number; translateY: number; scale: number }) => void
  className?: string
}

export const WhiteboardCanvas = forwardRef<WhiteboardCanvasHandle, WhiteboardCanvasProps>(
  function WhiteboardCanvas(
    {
      elements,
      activeTool,
      activeShapeType,
      strokeColor,
      strokeWidth,
      fillColor,
      remoteCursors,
      onElementCreate,
      onElementUpdate,
      onElementSelect,
      onElementDelete,
      onViewportChange,
      onViewportSnapshot,
      className,
    },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const managerRef = useRef<CanvasManager | null>(null)

    useImperativeHandle(ref, () => ({
      zoomIn: () => managerRef.current?.zoomIn() ?? 1,
      zoomOut: () => managerRef.current?.zoomOut() ?? 1,
      resetZoom: () => managerRef.current?.resetZoom() ?? 1,
      setZoomLevel: (l) => managerRef.current?.setZoomLevel(l),
    }))

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
      if (onViewportChange) manager.onViewportChange(() => {
        onViewportChange()
        if (onViewportSnapshot) {
          const vp = manager.getViewport()
          onViewportSnapshot({ translateX: vp.translateX, translateY: vp.translateY, scale: vp.scale })
        }
      })

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

    // Sync active shape type
    useEffect(() => {
      if (activeShapeType) managerRef.current?.setActiveShapeType(activeShapeType)
    }, [activeShapeType])

    // Sync stroke color
    useEffect(() => {
      if (strokeColor) managerRef.current?.setStrokeColor(strokeColor)
    }, [strokeColor])

    // Sync stroke width
    useEffect(() => {
      managerRef.current?.setStrokeWidth(strokeWidth ?? DEFAULTS.STROKE_WIDTH)
    }, [strokeWidth])

    // Sync fill color
    useEffect(() => {
      managerRef.current?.setFillColor(fillColor ?? null)
    }, [fillColor])

    // Handle container resize via ResizeObserver for precise container-based detection
    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const container = canvas.parentElement
      if (!container) return

      const observer = new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect
        managerRef.current?.resize(width, height)
      })
      observer.observe(container)
      return () => observer.disconnect()
    }, [])

    return (
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          background: "var(--wb-surface)",
          touchAction: "none",
        }}
      />
    )
  }
)
