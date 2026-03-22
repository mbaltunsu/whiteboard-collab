import rough from "roughjs/bin/rough"
import type { RoughCanvas } from "roughjs/bin/canvas"
import type {
  WhiteboardElement,
  FreehandElement,
  ShapeElement,
  CommentElement,
} from "@whiteboard/shared"
import type { PresenceState } from "@whiteboard/shared"
import type { Viewport } from "./viewport"

// Design tokens
const COLORS = {
  surface: "#f5f6f7",
  outlineVariant: "#abadae",
  primary: "#0c0bff",
  surfaceContainerLowest: "#ffffff",
  onSurfaceVariant: "#595c5d",
  onSurface: "#2c2f30",
} as const

// Grid spacing-10 = 2.5rem = 40px
const GRID_SPACING = 40

export class Renderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private roughCanvas: RoughCanvas
  private viewport: Viewport
  private animFrameId: number | null = null
  private isDirty = true
  private elements: WhiteboardElement[] = []
  private remoteCursors: PresenceState[] = []
  private dpr: number

  constructor(canvas: HTMLCanvasElement, viewport: Viewport) {
    this.canvas = canvas
    this.viewport = viewport
    this.dpr = window.devicePixelRatio || 1

    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Unable to get 2D canvas context")
    this.ctx = ctx

    this.roughCanvas = rough.canvas(canvas)
  }

  setElements(elements: WhiteboardElement[]): void {
    this.elements = elements
    this.markDirty()
  }

  setRemoteCursors(cursors: PresenceState[]): void {
    this.remoteCursors = cursors
    this.markDirty()
  }

  markDirty(): void {
    this.isDirty = true
  }

  start(): void {
    const loop = () => {
      if (this.isDirty) {
        this.draw()
        this.isDirty = false
      }
      this.animFrameId = requestAnimationFrame(loop)
    }
    this.animFrameId = requestAnimationFrame(loop)
  }

  stop(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId)
      this.animFrameId = null
    }
  }

  resize(width: number, height: number): void {
    this.canvas.width = width * this.dpr
    this.canvas.height = height * this.dpr
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`
    this.ctx.scale(this.dpr, this.dpr)
    this.markDirty()
  }

  private draw(): void {
    const { ctx } = this
    const cssWidth = this.canvas.width / this.dpr
    const cssHeight = this.canvas.height / this.dpr

    ctx.clearRect(0, 0, cssWidth, cssHeight)

    // Layer 1: Grid
    this.drawGrid(cssWidth, cssHeight)

    // Layer 2: Elements (sorted by zIndex)
    ctx.save()
    ctx.translate(this.viewport.translateX, this.viewport.translateY)
    ctx.scale(this.viewport.scale, this.viewport.scale)

    const sorted = [...this.elements].sort((a, b) => a.zIndex - b.zIndex)
    for (const el of sorted) {
      ctx.save()
      ctx.globalAlpha = el.style.opacity
      this.drawElement(el)
      ctx.restore()
    }

    ctx.restore()

    // Layer 4: Presence (remote cursors)
    this.drawPresence()
  }

  private drawGrid(cssWidth: number, cssHeight: number): void {
    const { ctx, viewport } = this
    const bounds = viewport.getVisibleBounds()
    const scale = viewport.scale

    // Dot radius scales with zoom but stays readable
    const dotRadius = Math.max(1, Math.min(2, scale * 1.5))
    const spacing = GRID_SPACING

    // Start and end in canvas coordinates
    const startX = Math.floor(bounds.x / spacing) * spacing
    const startY = Math.floor(bounds.y / spacing) * spacing
    const endX = bounds.x + bounds.w + spacing
    const endY = bounds.y + bounds.h + spacing

    ctx.save()
    ctx.fillStyle = `rgba(171, 173, 174, 0.10)` // outline-variant at 10% opacity

    for (let x = startX; x < endX; x += spacing) {
      for (let y = startY; y < endY; y += spacing) {
        const screen = viewport.canvasToScreen(x, y)
        ctx.beginPath()
        ctx.arc(screen.x, screen.y, dotRadius, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    ctx.restore()
  }

  private drawElement(el: WhiteboardElement): void {
    switch (el.type) {
      case "freehand":
        this.renderFreehand(el as FreehandElement)
        break
      case "shape":
        this.renderShape(el as ShapeElement)
        break
      case "comment":
        this.renderCommentPin(el as CommentElement)
        break
      // sticky notes are rendered as HTML overlay — skip here
      case "sticky":
        break
    }
  }

  private renderFreehand(el: FreehandElement): void {
    const { ctx } = this
    const { points, tool, roughness } = el.data
    if (points.length < 2) return

    const isHighlighter = tool === "highlighter"

    // Build path points [[x, y], ...]
    const pathPoints: [number, number][] = points.map(([x, y]) => [
      x - el.position.x,
      y - el.position.y,
    ])

    ctx.save()
    ctx.translate(el.position.x, el.position.y)

    if (isHighlighter) {
      // Highlighter: semi-transparent flat stroke
      ctx.globalAlpha = 0.4
      ctx.strokeStyle = el.style.color
      ctx.lineWidth = el.style.strokeWidth * 6
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.beginPath()
      ctx.moveTo(pathPoints[0][0], pathPoints[0][1])
      for (let i = 1; i < pathPoints.length; i++) {
        ctx.lineTo(pathPoints[i][0], pathPoints[i][1])
      }
      ctx.stroke()
    } else {
      // Pen: rough linearPath with pressure-sensitive width
      // Pressure is stored in points[i][2]
      this.roughCanvas.linearPath(pathPoints, {
        stroke: el.style.color,
        strokeWidth: el.style.strokeWidth,
        roughness: roughness,
        bowing: 1,
      })
    }

    ctx.restore()
  }

  private renderShape(el: ShapeElement): void {
    const { shapeType, fill, roughness } = el.data
    const { x, y } = el.position
    const { w, h } = el.size
    const { color, strokeWidth } = el.style

    const options = {
      stroke: color,
      strokeWidth,
      fill: fill ?? undefined,
      fillStyle: fill ? ("solid" as const) : ("hachure" as const),
      roughness,
      bowing: 1,
    }

    switch (shapeType) {
      case "rectangle":
        this.roughCanvas.rectangle(x, y, w, h, options)
        break

      case "ellipse":
        this.roughCanvas.ellipse(x + w / 2, y + h / 2, w, h, options)
        break

      case "diamond": {
        const cx = x + w / 2
        const cy = y + h / 2
        this.roughCanvas.polygon(
          [
            [cx, y],
            [x + w, cy],
            [cx, y + h],
            [x, cy],
          ],
          options,
        )
        break
      }

      case "line":
        this.roughCanvas.line(x, y, x + w, y + h, options)
        break

      case "arrow": {
        const { ctx } = this
        // Draw shaft via rough.js
        this.roughCanvas.line(x, y, x + w, y + h, options)
        // Draw arrowhead manually
        const angle = Math.atan2(h, w)
        const headLen = Math.max(10, strokeWidth * 5)
        const ex = x + w
        const ey = y + h
        ctx.save()
        ctx.strokeStyle = color
        ctx.lineWidth = strokeWidth
        ctx.beginPath()
        ctx.moveTo(ex - headLen * Math.cos(angle - Math.PI / 6), ey - headLen * Math.sin(angle - Math.PI / 6))
        ctx.lineTo(ex, ey)
        ctx.lineTo(ex - headLen * Math.cos(angle + Math.PI / 6), ey - headLen * Math.sin(angle + Math.PI / 6))
        ctx.stroke()
        ctx.restore()
        break
      }
    }
  }

  private renderCommentPin(el: CommentElement): void {
    const { ctx } = this
    const { x, y } = el.position
    const { resolved } = el.data

    const pinColor = resolved ? COLORS.outlineVariant : COLORS.primary
    const pinW = 20
    const pinH = 28

    ctx.save()

    // Pin body (rounded rect + pointed bottom)
    ctx.fillStyle = pinColor
    ctx.beginPath()
    ctx.moveTo(x + pinW / 2, y + pinH) // tip
    ctx.lineTo(x + 3, y + pinH - 10)
    ctx.quadraticCurveTo(x, y + pinH - 10, x, y + 6)
    ctx.quadraticCurveTo(x, y, x + 6, y)
    ctx.lineTo(x + pinW - 6, y)
    ctx.quadraticCurveTo(x + pinW, y, x + pinW, y + 6)
    ctx.quadraticCurveTo(x + pinW, y + pinH - 10, x + pinW - 3, y + pinH - 10)
    ctx.closePath()
    ctx.fill()

    // Comment count indicator (white dot)
    const msgCount = el.data.messages.length
    if (msgCount > 0) {
      ctx.fillStyle = COLORS.surfaceContainerLowest
      ctx.font = "bold 9px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(String(Math.min(msgCount, 9)), x + pinW / 2, y + 10)
    }

    ctx.restore()
  }

  private drawPresence(): void {
    const { ctx, viewport } = this

    for (const presence of this.remoteCursors) {
      if (!presence.cursor) continue

      const screen = viewport.canvasToScreen(presence.cursor.x, presence.cursor.y)
      const { x, y } = screen
      const color = presence.color

      ctx.save()

      // Cursor arrow
      ctx.strokeStyle = color
      ctx.fillStyle = color
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + 12, y + 16)
      ctx.lineTo(x + 5, y + 14)
      ctx.lineTo(x + 4, y + 20)
      ctx.lineTo(x + 1, y + 14)
      ctx.lineTo(x - 3, y + 16)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Name label — glassmorphism style
      const label = presence.name || "User"
      ctx.font = "500 11px Inter, sans-serif" // label-sm
      const labelWidth = ctx.measureText(label).width
      const labelPadX = 6
      const labelPadY = 3
      const labelX = x + 14
      const labelY = y + 18

      // Background
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)" // surface-container-lowest ~80%
      ctx.beginPath()
      ctx.roundRect(labelX - labelPadX, labelY - labelPadY, labelWidth + labelPadX * 2, 18, 4)
      ctx.fill()

      // Ghost border
      ctx.strokeStyle = `rgba(171, 173, 174, 0.15)` // outline-variant at 15%
      ctx.lineWidth = 1
      ctx.stroke()

      // Label text — on-surface-variant
      ctx.fillStyle = COLORS.onSurfaceVariant
      ctx.fillText(label, labelX, labelY + 9)

      ctx.restore()
    }
  }
}
