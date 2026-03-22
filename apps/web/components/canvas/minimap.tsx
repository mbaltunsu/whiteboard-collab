'use client'

import { useRef, useEffect, useCallback, useMemo, useState } from 'react'
import type { WhiteboardElement } from '@whiteboard/shared'
import type { VisibleBounds } from './viewport'
import { CANVAS_COLORS } from '@/lib/theme'

const MINIMAP_W = 200
const MINIMAP_H = 150
const PADDING = 12
const VIEWPORT_RECT_ALPHA = 0.18

interface MinimapProps {
  elements: WhiteboardElement[]
  viewport: {
    translateX: number
    translateY: number
    scale: number
    screenWidth: number
    screenHeight: number
  }
  onNavigate: (canvasX: number, canvasY: number) => void
  visible?: boolean
}

function getBoundingBox(elements: WhiteboardElement[]): VisibleBounds {
  if (elements.length === 0) {
    return { x: -500, y: -500, w: 1000, h: 1000 }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const el of elements) {
    const x1 = el.position.x
    const y1 = el.position.y
    const x2 = x1 + el.size.w
    const y2 = y1 + el.size.h
    if (x1 < minX) minX = x1
    if (y1 < minY) minY = y1
    if (x2 > maxX) maxX = x2
    if (y2 > maxY) maxY = y2
  }

  const pad = 80
  return { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 }
}

export function Minimap({ elements, viewport, onNavigate, visible = true }: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDraggingRef = useRef(false)
  const [isHovered, setIsHovered] = useState(false)

  const worldBounds = useMemo(() => getBoundingBox(elements), [elements])

  // Map canvas-world coordinates to minimap pixel coordinates
  const worldToMini = useCallback(
    (wx: number, wy: number) => {
      const scaleX = MINIMAP_W / worldBounds.w
      const scaleY = MINIMAP_H / worldBounds.h
      const scale = Math.min(scaleX, scaleY)
      const offsetX = (MINIMAP_W - worldBounds.w * scale) / 2
      const offsetY = (MINIMAP_H - worldBounds.h * scale) / 2
      return {
        x: (wx - worldBounds.x) * scale + offsetX,
        y: (wy - worldBounds.y) * scale + offsetY,
        scale,
        offsetX,
        offsetY,
      }
    },
    [worldBounds]
  )

  // Convert minimap click position back to canvas world position
  const miniToWorld = useCallback(
    (mx: number, my: number) => {
      const scaleX = MINIMAP_W / worldBounds.w
      const scaleY = MINIMAP_H / worldBounds.h
      const scale = Math.min(scaleX, scaleY)
      const offsetX = (MINIMAP_W - worldBounds.w * scale) / 2
      const offsetY = (MINIMAP_H - worldBounds.h * scale) / 2
      return {
        x: (mx - offsetX) / scale + worldBounds.x,
        y: (my - offsetY) / scale + worldBounds.y,
      }
    },
    [worldBounds]
  )

  // Draw minimap
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = MINIMAP_W * dpr
    canvas.height = MINIMAP_H * dpr
    ctx.scale(dpr, dpr)

    // Clear
    ctx.clearRect(0, 0, MINIMAP_W, MINIMAP_H)

    const { scale: miniScale } = worldToMini(0, 0)

    // Draw elements as simplified rectangles / dots
    for (const el of elements) {
      const { x, y } = worldToMini(el.position.x, el.position.y)
      const w = el.size.w * miniScale
      const h = el.size.h * miniScale

      ctx.globalAlpha = 0.75

      switch (el.type) {
        case 'sticky': {
          ctx.fillStyle = CANVAS_COLORS.sticky[el.data.color] ?? CANVAS_COLORS.sticky.yellow
          ctx.beginPath()
          ctx.roundRect(x, y, Math.max(w, 4), Math.max(h, 4), 2)
          ctx.fill()
          break
        }
        case 'shape': {
          ctx.fillStyle = el.style.color
          ctx.beginPath()
          ctx.roundRect(x, y, Math.max(w, 3), Math.max(h, 3), 1)
          ctx.fill()
          break
        }
        case 'freehand': {
          ctx.fillStyle = el.style.color
          ctx.beginPath()
          ctx.arc(x + w / 2, y + h / 2, Math.max(Math.min(w, h) / 2, 2), 0, Math.PI * 2)
          ctx.fill()
          break
        }
        case 'comment': {
          ctx.fillStyle = CANVAS_COLORS.primary
          ctx.beginPath()
          ctx.arc(x + w / 2, y + h / 2, 3, 0, Math.PI * 2)
          ctx.fill()
          break
        }
      }
    }

    ctx.globalAlpha = 1

    // Draw viewport rectangle
    const vpTopLeftWorld = {
      x: -viewport.translateX / viewport.scale,
      y: -viewport.translateY / viewport.scale,
    }
    const vpW = viewport.screenWidth / viewport.scale
    const vpH = viewport.screenHeight / viewport.scale

    const vpMini = worldToMini(vpTopLeftWorld.x, vpTopLeftWorld.y)
    const vpMiniW = vpW * miniScale
    const vpMiniH = vpH * miniScale

    // Viewport fill
    ctx.fillStyle = CANVAS_COLORS.primaryAlpha18
    ctx.beginPath()
    ctx.roundRect(vpMini.x, vpMini.y, vpMiniW, vpMiniH, 3)
    ctx.fill()

    // Viewport border
    ctx.strokeStyle = CANVAS_COLORS.primaryAlpha60
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.roundRect(vpMini.x, vpMini.y, vpMiniW, vpMiniH, 3)
    ctx.stroke()
  }, [elements, viewport, worldToMini])

  const getMinimapCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return {
      mx: e.clientX - rect.left,
      my: e.clientY - rect.top,
    }
  }, [])

  const handlePointerDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      isDraggingRef.current = true
      const { mx, my } = getMinimapCoords(e)
      const world = miniToWorld(mx, my)
      onNavigate(world.x, world.y)
    },
    [getMinimapCoords, miniToWorld, onNavigate]
  )

  const handlePointerMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDraggingRef.current) return
      const { mx, my } = getMinimapCoords(e)
      const world = miniToWorld(mx, my)
      onNavigate(world.x, world.y)
    },
    [getMinimapCoords, miniToWorld, onNavigate]
  )

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false
  }, [])

  if (!visible) return null

  return (
    <div
      className="wb-minimap"
      style={{
        position: 'fixed',
        bottom: `${PADDING + 56}px`,
        left: `${PADDING}px`,
        width: `${MINIMAP_W}px`,
        height: `${MINIMAP_H}px`,
        borderRadius: 'var(--wb-radius-xl, 0.75rem)',
        background: 'var(--wb-glass-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: isHovered
          ? '0 16px 40px -6px rgba(12, 15, 16, 0.14)'
          : '0 12px 32px -4px rgba(12, 15, 16, 0.08)',
        border: '1px solid rgba(171, 173, 174, 0.15)',
        overflow: 'hidden',
        zIndex: 40,
        transition: 'box-shadow 150ms ease, opacity 150ms ease',
        opacity: isHovered ? 1 : 0.85,
        cursor: 'crosshair',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        isDraggingRef.current = false
      }}
      role="img"
      aria-label="Canvas minimap — click to navigate"
    >
      <canvas
        ref={canvasRef}
        width={MINIMAP_W}
        height={MINIMAP_H}
        style={{ display: 'block', width: '100%', height: '100%' }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
      />
    </div>
  )
}
