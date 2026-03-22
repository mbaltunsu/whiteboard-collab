import type { StickyColor, ToolType, ShapeType } from "../types/elements"

export const PRESENCE_COLORS: string[] = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#f43f5e",
  "#0ea5e9",
  "#84cc16",
]

export const LIMITS = {
  MAX_ELEMENTS: 5000,
  MAX_USERS_PER_ROOM: 20,
  MAX_ROOMS_PER_USER: 50,
} as const

export const DEFAULTS = {
  STROKE_WIDTH: 2,
  ROUGHNESS: 1,
  OPACITY: 1,
  FONT_SIZE: 16,
} as const

export const THROTTLE = {
  CURSOR_MS: 50,
  VIEWPORT_MS: 200,
  PERSISTENCE_MS: 2000,
} as const

export const STICKY_COLORS: Record<StickyColor, string> = {
  yellow: "#fef08a",
  pink: "#fecdd3",
  blue: "#bfdbfe",
  green: "#bbf7d0",
  purple: "#e9d5ff",
}

export const TOOL_TYPES: ToolType[] = [
  "select",
  "pen",
  "highlighter",
  "eraser",
  "shape",
  "sticky",
  "comment",
  "text",
  "hand",
]

export const SHAPE_TYPES: ShapeType[] = [
  "rectangle",
  "ellipse",
  "diamond",
  "arrow",
  "line",
]
