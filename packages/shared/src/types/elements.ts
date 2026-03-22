export type ElementType = "freehand" | "sticky" | "shape" | "comment"

export type ShapeType = "rectangle" | "ellipse" | "diamond" | "arrow" | "line"

export type ToolType =
  | "select"
  | "pen"
  | "highlighter"
  | "eraser"
  | "shape"
  | "sticky"
  | "comment"
  | "hand"

export type StickyColor = "yellow" | "pink" | "blue" | "green" | "purple"

export interface BaseElement {
  id: string
  type: ElementType
  position: { x: number; y: number }
  size: { w: number; h: number }
  style: { color: string; strokeWidth: number; opacity: number }
  zIndex: number
  createdBy: string
  locked: boolean
}

export interface FreehandData {
  points: [number, number, number][]
  tool: "pen" | "highlighter" | "eraser"
  roughness: number
}

export interface FreehandElement extends BaseElement {
  type: "freehand"
  data: FreehandData
}

export interface StickyNoteDataSerialized {
  text: string
  color: StickyColor
  fontSize: number
}

export interface StickyNoteElement extends BaseElement {
  type: "sticky"
  data: StickyNoteDataSerialized
}

export interface ShapeData {
  shapeType: ShapeType
  fill: string | null
  roughness: number
  connectedTo: string[]
}

export interface ShapeElement extends BaseElement {
  type: "shape"
  data: ShapeData
}

export interface CommentMessage {
  author: string
  text: string
  timestamp: number
}

export interface CommentData {
  resolved: boolean
  messages: CommentMessage[]
}

export interface CommentElement extends BaseElement {
  type: "comment"
  data: CommentData
}

export type WhiteboardElement =
  | FreehandElement
  | StickyNoteElement
  | ShapeElement
  | CommentElement
