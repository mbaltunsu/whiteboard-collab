import type { WhiteboardElement, ToolType } from "@whiteboard/shared"
import type { PresenceState } from "@whiteboard/shared"
import { Viewport } from "./viewport"
import { Renderer } from "./renderer"
import { InputHandler, generateId } from "./input-handler"
import type { InputCallbacks, ElementCreatePayload, ElementUpdatePayload } from "./input-handler"

export interface CanvasManagerCallbacks {
  onElementCreate?: (payload: ElementCreatePayload & { id: string }) => void
  onElementUpdate?: (payload: ElementUpdatePayload) => void
  onElementSelect?: (ids: string[]) => void
  onElementDelete?: (ids: string[]) => void
  onViewportChange?: () => void
}

export class CanvasManager {
  private viewport: Viewport
  private renderer: Renderer | null = null
  private inputHandler: InputHandler | null = null
  private canvasEl: HTMLCanvasElement | null = null
  private elements: WhiteboardElement[] = []
  private callbacks: CanvasManagerCallbacks = {}
  private nextZIndex = 1

  constructor() {
    this.viewport = new Viewport()
  }

  init(canvasElement: HTMLCanvasElement): void {
    this.canvasEl = canvasElement

    // Size canvas to parent
    const parent = canvasElement.parentElement
    const width = parent?.clientWidth ?? window.innerWidth
    const height = parent?.clientHeight ?? window.innerHeight

    this.viewport.setScreenSize(width, height)

    this.renderer = new Renderer(canvasElement, this.viewport)
    this.renderer.resize(width, height)
    this.renderer.start()

    const inputCallbacks: InputCallbacks = {
      onElementCreate: (payload) => this.handleCreate(payload),
      onElementUpdate: (payload) => this.handleUpdate(payload),
      onElementSelect: (ids) => this.callbacks.onElementSelect?.(ids),
      onElementDelete: (ids) => this.handleDelete(ids),
      onViewportChange: () => {
        this.renderer?.markDirty()
        this.callbacks.onViewportChange?.()
      },
    }

    this.inputHandler = new InputHandler(canvasElement, this.viewport, inputCallbacks)
    this.inputHandler.setElements(this.elements)
  }

  private handleCreate(payload: ElementCreatePayload): void {
    const id = generateId()
    const element = {
      ...payload.element,
      id,
      zIndex: this.nextZIndex++,
      createdBy: "local",
    } as WhiteboardElement

    this.elements = [...this.elements, element]
    this.syncElementsToSubsystems()
    this.callbacks.onElementCreate?.({ ...payload, id })
  }

  private handleUpdate(payload: ElementUpdatePayload): void {
    this.elements = this.elements.map((el) => {
      if (el.id !== payload.id) return el
      return {
        ...el,
        position: payload.position ?? el.position,
        size: payload.size ?? el.size,
      }
    })
    this.syncElementsToSubsystems()
    this.callbacks.onElementUpdate?.(payload)
  }

  private handleDelete(ids: string[]): void {
    const idSet = new Set(ids)
    this.elements = this.elements.filter((el) => !idSet.has(el.id))
    this.syncElementsToSubsystems()
    this.callbacks.onElementDelete?.(ids)
  }

  private syncElementsToSubsystems(): void {
    this.renderer?.setElements(this.elements)
    this.inputHandler?.setElements(this.elements)
  }

  setElements(elements: WhiteboardElement[]): void {
    this.elements = elements
    if (elements.length > 0) {
      this.nextZIndex = Math.max(...elements.map((e) => e.zIndex)) + 1
    }
    this.syncElementsToSubsystems()
  }

  setActiveTool(tool: ToolType): void {
    this.inputHandler?.setActiveTool(tool)
  }

  setRemoteCursors(cursors: PresenceState[]): void {
    this.renderer?.setRemoteCursors(cursors)
  }

  onElementCreate(cb: CanvasManagerCallbacks["onElementCreate"]): void {
    this.callbacks.onElementCreate = cb
  }

  onElementUpdate(cb: CanvasManagerCallbacks["onElementUpdate"]): void {
    this.callbacks.onElementUpdate = cb
  }

  onElementSelect(cb: CanvasManagerCallbacks["onElementSelect"]): void {
    this.callbacks.onElementSelect = cb
  }

  onElementDelete(cb: CanvasManagerCallbacks["onElementDelete"]): void {
    this.callbacks.onElementDelete = cb
  }

  onViewportChange(cb: CanvasManagerCallbacks["onViewportChange"]): void {
    this.callbacks.onViewportChange = cb
  }

  resize(width: number, height: number): void {
    this.viewport.setScreenSize(width, height)
    this.renderer?.resize(width, height)
  }

  getViewport(): Viewport {
    return this.viewport
  }

  getElements(): WhiteboardElement[] {
    return this.elements
  }

  destroy(): void {
    this.renderer?.stop()
    this.inputHandler?.destroy()
    this.renderer = null
    this.inputHandler = null
    this.canvasEl = null
  }
}
