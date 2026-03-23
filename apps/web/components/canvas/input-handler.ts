import type { WhiteboardElement, ToolType, ShapeType, FreehandElement, ShapeElement, TextElement } from "@whiteboard/shared"
import { DEFAULTS } from "@whiteboard/shared"
import type { Viewport } from "./viewport"
import { CANVAS_COLORS } from "@/lib/theme"

export interface ElementCreatePayload {
  element: Omit<WhiteboardElement, "id" | "zIndex" | "createdBy">
}

export interface ElementUpdatePayload {
  id: string
  position?: { x: number; y: number }
  size?: { w: number; h: number }
  data?: WhiteboardElement["data"]
  changes?: Partial<Omit<WhiteboardElement, "id">>
}

export interface PreviewState {
  penPoints: [number, number, number][]
  shapeStart: { x: number; y: number } | null
  shapeEnd: { x: number; y: number } | null
  activeShapeType: ShapeType | null
  tool: ToolType | null
  strokeColor: string
  strokeWidth: number
  eraserPos: { x: number; y: number } | null
}

export interface InputCallbacks {
  onElementCreate: (payload: ElementCreatePayload) => void
  onElementUpdate: (payload: ElementUpdatePayload) => void
  onElementSelect: (ids: string[]) => void
  onElementDelete: (ids: string[]) => void
  onViewportChange: () => void
}

interface DragState {
  startCanvasX: number
  startCanvasY: number
  lastScreenX: number
  lastScreenY: number
  active: boolean
}

// Returns true if point (px, py) is inside element bounding box
function hitTest(el: WhiteboardElement, px: number, py: number): boolean {
  const { x, y } = el.position
  const { w, h } = el.size
  const padding = 4
  return px >= x - padding && px <= x + w + padding && py >= y - padding && py <= y + h + padding
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export class InputHandler {
  private canvas: HTMLCanvasElement
  private viewport: Viewport
  private callbacks: InputCallbacks
  private activeTool: ToolType = "select"
  private activeShapeType: ShapeType = "rectangle"
  private strokeColor: string = CANVAS_COLORS.onSurface
  private strokeWidth: number = DEFAULTS.STROKE_WIDTH
  private fillColor: string | null = null
  private elements: WhiteboardElement[] = []

  onPreview?: (state: PreviewState) => void

  // Interaction state
  private drag: DragState = {
    startCanvasX: 0,
    startCanvasY: 0,
    lastScreenX: 0,
    lastScreenY: 0,
    active: false,
  }
  private isPointerDown = false
  private penPoints: [number, number, number][] = []
  private shapeStartCanvas: { x: number; y: number } | null = null
  private movingElementId: string | null = null
  private moveStartElementPos: { x: number; y: number } | null = null
  private boxSelectStart: { x: number; y: number } | null = null
  private selectedIds: string[] = []
  private pinchStartDist: number | null = null
  private pinchLastMidX: number = 0
  private pinchLastMidY: number = 0

  constructor(canvas: HTMLCanvasElement, viewport: Viewport, callbacks: InputCallbacks) {
    this.canvas = canvas
    this.viewport = viewport
    this.callbacks = callbacks
    this.bindEvents()
  }

  setActiveTool(tool: ToolType): void {
    if (tool !== 'eraser' && this.activeTool === 'eraser') {
      this.onPreview?.({
        penPoints: [], shapeStart: null, shapeEnd: null,
        activeShapeType: null, tool: null, strokeColor: '',
        strokeWidth: this.strokeWidth, eraserPos: null,
      })
    }
    this.activeTool = tool
    this.canvas.style.cursor = this.getCursorForTool(tool)
  }

  setActiveShapeType(shape: ShapeType): void {
    this.activeShapeType = shape
  }

  setStrokeColor(color: string): void {
    this.strokeColor = color
  }

  setStrokeWidth(width: number): void {
    this.strokeWidth = width
  }

  setFillColor(color: string | null): void {
    this.fillColor = color
  }

  setElements(elements: WhiteboardElement[]): void {
    this.elements = elements
  }

  private getCursorForTool(tool: ToolType): string {
    switch (tool) {
      case "hand":
        return "grab"
      case "pen":
      case "highlighter":
        return "crosshair"
      case "eraser":
        return "cell"
      case "shape":
      case "sticky":
      case "comment":
      case "text":
        return "crosshair"
      case "select":
      default:
        return "default"
    }
  }

  private getPointerPressure(e: MouseEvent | PointerEvent): number {
    if ("pressure" in e && e.pressure > 0) return e.pressure
    return 0.5
  }

  private onMouseDown = (e: MouseEvent): void => {
    if (e.button !== 0) return
    this.isPointerDown = true

    const canvas = this.viewport.screenToCanvas(e.offsetX, e.offsetY)
    this.drag = {
      startCanvasX: canvas.x,
      startCanvasY: canvas.y,
      lastScreenX: e.offsetX,
      lastScreenY: e.offsetY,
      active: true,
    }

    switch (this.activeTool) {
      case "pen":
      case "highlighter": {
        const pressure = this.getPointerPressure(e)
        this.penPoints = [[canvas.x, canvas.y, pressure]]
        break
      }
      case "shape":
        this.shapeStartCanvas = { x: canvas.x, y: canvas.y }
        break

      case "select": {
        // Check hit test on elements (reverse zIndex order for topmost first)
        const sorted = [...this.elements].sort((a, b) => b.zIndex - a.zIndex)
        const hit = sorted.find((el) => hitTest(el, canvas.x, canvas.y))
        if (hit) {
          this.movingElementId = hit.id
          this.moveStartElementPos = { x: hit.position.x, y: hit.position.y }
          this.selectedIds = [hit.id]
          this.callbacks.onElementSelect([hit.id])
        } else {
          this.movingElementId = null
          this.boxSelectStart = { x: canvas.x, y: canvas.y }
          this.selectedIds = []
          this.callbacks.onElementSelect([])
        }
        break
      }

      case "hand":
        this.canvas.style.cursor = "grabbing"
        break

      case "eraser": {
        const sorted = [...this.elements].sort((a, b) => b.zIndex - a.zIndex)
        const hit = sorted.find((el) => hitTest(el, canvas.x, canvas.y))
        if (hit) {
          this.callbacks.onElementDelete([hit.id])
        }
        break
      }

      default:
        break
    }
  }

  private onMouseMove = (e: MouseEvent): void => {
    if (!this.isPointerDown) return

    const canvas = this.viewport.screenToCanvas(e.offsetX, e.offsetY)
    const dxScreen = e.offsetX - this.drag.lastScreenX
    const dyScreen = e.offsetY - this.drag.lastScreenY

    switch (this.activeTool) {
      case "pen":
      case "highlighter": {
        const pressure = this.getPointerPressure(e)
        this.penPoints.push([canvas.x, canvas.y, pressure])
        this.onPreview?.({
          penPoints: this.penPoints,
          shapeStart: null,
          shapeEnd: null,
          activeShapeType: null,
          tool: this.activeTool,
          strokeColor: this.strokeColor,
          strokeWidth: this.strokeWidth,
          eraserPos: null,
        })
        break
      }

      case "shape":
        if (this.shapeStartCanvas) {
          this.onPreview?.({
            penPoints: [],
            shapeStart: this.shapeStartCanvas,
            shapeEnd: { x: canvas.x, y: canvas.y },
            activeShapeType: this.activeShapeType,
            tool: this.activeTool,
            strokeColor: this.strokeColor,
            strokeWidth: this.strokeWidth,
            eraserPos: null,
          })
        }
        break

      case "hand":
        this.viewport.pan(dxScreen, dyScreen)
        this.callbacks.onViewportChange()
        break

      case "select":
        if (this.movingElementId !== null && this.moveStartElementPos !== null) {
          const dxCanvas = canvas.x - this.drag.startCanvasX
          const dyCanvas = canvas.y - this.drag.startCanvasY
          this.callbacks.onElementUpdate({
            id: this.movingElementId,
            position: {
              x: this.moveStartElementPos.x + dxCanvas,
              y: this.moveStartElementPos.y + dyCanvas,
            },
          })
        }
        break

      case "eraser": {
        const sorted = [...this.elements].sort((a, b) => b.zIndex - a.zIndex)
        const hit = sorted.find((el) => hitTest(el, canvas.x, canvas.y))
        if (hit) {
          this.callbacks.onElementDelete([hit.id])
        }
        break
      }

      default:
        break
    }

    this.drag.lastScreenX = e.offsetX
    this.drag.lastScreenY = e.offsetY
  }

  private onMouseUp = (e: MouseEvent): void => {
    if (!this.isPointerDown) return
    this.isPointerDown = false

    const canvas = this.viewport.screenToCanvas(e.offsetX, e.offsetY)

    switch (this.activeTool) {
      case "pen":
      case "highlighter": {
        if (this.penPoints.length >= 2) {
          const xs = this.penPoints.map((p) => p[0])
          const ys = this.penPoints.map((p) => p[1])
          const minX = Math.min(...xs)
          const minY = Math.min(...ys)
          const maxX = Math.max(...xs)
          const maxY = Math.max(...ys)

          const element: Omit<FreehandElement, "id" | "zIndex" | "createdBy"> = {
            type: "freehand",
            position: { x: minX, y: minY },
            size: { w: Math.max(maxX - minX, 1), h: Math.max(maxY - minY, 1) },
            style: {
              color: this.strokeColor,
              strokeWidth: this.strokeWidth,
              opacity: DEFAULTS.OPACITY,
            },
            locked: false,
            data: {
              points: this.penPoints,
              tool: this.activeTool === "highlighter" ? "highlighter" : "pen",
              roughness: DEFAULTS.ROUGHNESS,
            },
          }
          this.callbacks.onElementCreate({ element })
        }
        this.penPoints = []
        this.onPreview?.({ penPoints: [], shapeStart: null, shapeEnd: null, activeShapeType: null, tool: null, strokeColor: '', strokeWidth: this.strokeWidth, eraserPos: null })
        break
      }

      case "shape": {
        if (this.shapeStartCanvas) {
          const sx = this.shapeStartCanvas.x
          const sy = this.shapeStartCanvas.y
          const ex = canvas.x
          const ey = canvas.y
          const x = Math.min(sx, ex)
          const y = Math.min(sy, ey)
          const w = Math.max(Math.abs(ex - sx), 10)
          const h = Math.max(Math.abs(ey - sy), 10)

          if (w > 5 || h > 5) {
            const element: Omit<ShapeElement, "id" | "zIndex" | "createdBy"> = {
              type: "shape",
              position: { x, y },
              size: { w, h },
              style: {
                color: this.strokeColor,
                strokeWidth: this.strokeWidth,
                opacity: DEFAULTS.OPACITY,
              },
              locked: false,
              data: {
                shapeType: this.activeShapeType,
                fill: this.fillColor,
                roughness: DEFAULTS.ROUGHNESS,
                connectedTo: [],
              },
            }
            this.callbacks.onElementCreate({ element })
          }
        }
        this.shapeStartCanvas = null
        this.onPreview?.({ penPoints: [], shapeStart: null, shapeEnd: null, activeShapeType: null, tool: null, strokeColor: '', strokeWidth: this.strokeWidth, eraserPos: null })
        break
      }

      case "select": {
        if (this.boxSelectStart) {
          const bx = Math.min(this.boxSelectStart.x, canvas.x)
          const by = Math.min(this.boxSelectStart.y, canvas.y)
          const bw = Math.abs(canvas.x - this.boxSelectStart.x)
          const bh = Math.abs(canvas.y - this.boxSelectStart.y)

          if (bw > 4 || bh > 4) {
            const boxSelected = this.elements
              .filter(
                (el) =>
                  el.position.x >= bx &&
                  el.position.y >= by &&
                  el.position.x + el.size.w <= bx + bw &&
                  el.position.y + el.size.h <= by + bh,
              )
              .map((el) => el.id)
            this.selectedIds = boxSelected
            this.callbacks.onElementSelect(boxSelected)
          }
          this.boxSelectStart = null
        }
        this.movingElementId = null
        this.moveStartElementPos = null
        break
      }

      case "hand":
        this.canvas.style.cursor = "grab"
        break

      case "sticky": {
        const element: Omit<WhiteboardElement, "id" | "zIndex" | "createdBy"> = {
          type: "sticky",
          position: { x: canvas.x - 75, y: canvas.y - 75 },
          size: { w: 150, h: 150 },
          style: {
            color: CANVAS_COLORS.onSurface,
            strokeWidth: 1,
            opacity: DEFAULTS.OPACITY,
          },
          locked: false,
          data: {
            text: "",
            color: "yellow",
            fontSize: DEFAULTS.FONT_SIZE,
          },
        }
        this.callbacks.onElementCreate({ element })
        break
      }

      case "comment": {
        const element: Omit<WhiteboardElement, "id" | "zIndex" | "createdBy"> = {
          type: "comment",
          position: { x: canvas.x, y: canvas.y },
          size: { w: 240, h: 160 },
          style: {
            color: CANVAS_COLORS.primary,
            strokeWidth: 1,
            opacity: DEFAULTS.OPACITY,
          },
          locked: false,
          data: {
            title: '',
            resolved: false,
            messages: [],
          },
        }
        this.callbacks.onElementCreate({ element })
        break
      }

      case "text": {
        const element: Omit<TextElement, "id" | "zIndex" | "createdBy"> = {
          type: "text",
          position: { x: canvas.x, y: canvas.y },
          size: { w: 200, h: 60 },
          style: {
            color: this.strokeColor,
            strokeWidth: 1,
            opacity: 1,
          },
          locked: false,
          data: { text: '', fontSize: 16 },
        }
        this.callbacks.onElementCreate({ element })
        break
      }

      default:
        break
    }

    this.drag.active = false
  }

  private onWheel = (e: WheelEvent): void => {
    e.preventDefault()

    if (e.ctrlKey || e.metaKey) {
      // Pinch zoom
      const factor = e.deltaY < 0 ? 1.1 : 0.9
      this.viewport.zoom(factor, e.offsetX, e.offsetY)
    } else {
      // Pan
      this.viewport.pan(-e.deltaX, -e.deltaY)
    }
    this.callbacks.onViewportChange()
  }

  private onDoubleClick = (e: MouseEvent): void => {
    const canvas = this.viewport.screenToCanvas(e.offsetX, e.offsetY)
    if (this.activeTool === "select") {
      const sorted = [...this.elements].sort((a, b) => b.zIndex - a.zIndex)
      const hit = sorted.find((el) => hitTest(el, canvas.x, canvas.y))
      if (hit?.type === "sticky") {
        // Signal sticky note edit — consumers can handle via onElementSelect with double-click info
        this.callbacks.onElementSelect([hit.id])
      }
    }
  }

  // Fires on every mousemove regardless of button state — used only for eraser cursor
  private onMouseMoveGlobal = (e: MouseEvent): void => {
    if (this.activeTool !== "eraser") return
    const canvas = this.viewport.screenToCanvas(e.offsetX, e.offsetY)
    this.onPreview?.({
      penPoints: [],
      shapeStart: null,
      shapeEnd: null,
      activeShapeType: null,
      tool: "eraser",
      strokeColor: '',
      strokeWidth: this.strokeWidth,
      eraserPos: { x: canvas.x, y: canvas.y },
    })
  }

  private onTouchStart = (e: TouchEvent): void => {
    e.preventDefault()
    if (e.touches.length === 2) {
      // Two-finger gesture — initialise pinch state
      const t0 = e.touches[0]
      const t1 = e.touches[1]
      this.pinchStartDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY)
      const rect = this.canvas.getBoundingClientRect()
      this.pinchLastMidX = (t0.clientX + t1.clientX) / 2 - rect.left
      this.pinchLastMidY = (t0.clientY + t1.clientY) / 2 - rect.top
      // Cancel any in-progress single-touch drawing action
      this.isPointerDown = false
      this.penPoints = []
      this.shapeStartCanvas = null
      return
    }
    if (e.touches.length !== 1) return
    const touch = e.touches[0]
    const rect = this.canvas.getBoundingClientRect()
    const syntheticEvent = {
      offsetX: touch.clientX - rect.left,
      offsetY: touch.clientY - rect.top,
      button: 0,
      preventDefault: () => {},
    } as unknown as MouseEvent
    this.onMouseDown(syntheticEvent)
  }

  private onTouchMove = (e: TouchEvent): void => {
    e.preventDefault()
    if (e.touches.length === 2 && this.pinchStartDist !== null) {
      const t0 = e.touches[0]
      const t1 = e.touches[1]
      const rect = this.canvas.getBoundingClientRect()
      const newDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY)
      const midX = (t0.clientX + t1.clientX) / 2 - rect.left
      const midY = (t0.clientY + t1.clientY) / 2 - rect.top

      // Zoom relative to pinch centre
      const factor = newDist / this.pinchStartDist
      this.viewport.zoom(factor, midX, midY)

      // Pan by midpoint delta (two-finger drag)
      const dx = midX - this.pinchLastMidX
      const dy = midY - this.pinchLastMidY
      this.viewport.pan(dx, dy)

      this.pinchStartDist = newDist
      this.pinchLastMidX = midX
      this.pinchLastMidY = midY

      this.callbacks.onViewportChange()
      return
    }
    if (e.touches.length !== 1) return
    this.pinchStartDist = null
    const touch = e.touches[0]
    const rect = this.canvas.getBoundingClientRect()
    const syntheticEvent = {
      offsetX: touch.clientX - rect.left,
      offsetY: touch.clientY - rect.top,
      button: 0,
      preventDefault: () => {},
    } as unknown as MouseEvent
    this.onMouseMove(syntheticEvent)
  }

  private onTouchEnd = (e: TouchEvent): void => {
    e.preventDefault()
    // If releasing to fewer than 2 fingers, clear pinch state
    if (e.touches.length < 2) {
      this.pinchStartDist = null
    }
    // Only finalise single-touch action when all fingers are lifted
    if (e.touches.length > 0) return
    const touch = e.changedTouches[0]
    if (!touch) return
    const rect = this.canvas.getBoundingClientRect()
    const syntheticEvent = {
      offsetX: touch.clientX - rect.left,
      offsetY: touch.clientY - rect.top,
      button: 0,
      preventDefault: () => {},
    } as unknown as MouseEvent
    this.onMouseUp(syntheticEvent)
  }

  private bindEvents(): void {
    this.canvas.addEventListener("mousedown", this.onMouseDown)
    this.canvas.addEventListener("mousemove", this.onMouseMove)
    this.canvas.addEventListener("mousemove", this.onMouseMoveGlobal)
    this.canvas.addEventListener("mouseup", this.onMouseUp)
    this.canvas.addEventListener("wheel", this.onWheel, { passive: false })
    this.canvas.addEventListener("dblclick", this.onDoubleClick)
    this.canvas.addEventListener("touchstart", this.onTouchStart, { passive: false })
    this.canvas.addEventListener("touchmove", this.onTouchMove, { passive: false })
    this.canvas.addEventListener("touchend", this.onTouchEnd, { passive: false })
  }

  destroy(): void {
    this.canvas.removeEventListener("mousedown", this.onMouseDown)
    this.canvas.removeEventListener("mousemove", this.onMouseMove)
    this.canvas.removeEventListener("mousemove", this.onMouseMoveGlobal)
    this.canvas.removeEventListener("mouseup", this.onMouseUp)
    this.canvas.removeEventListener("wheel", this.onWheel)
    this.canvas.removeEventListener("dblclick", this.onDoubleClick)
    this.canvas.removeEventListener("touchstart", this.onTouchStart)
    this.canvas.removeEventListener("touchmove", this.onTouchMove)
    this.canvas.removeEventListener("touchend", this.onTouchEnd)
  }
}

export { generateId }
