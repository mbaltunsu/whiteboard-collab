import { create } from 'zustand'
import type { ToolType, ShapeType } from '@whiteboard/shared'
import { CANVAS_COLORS } from '@/lib/theme'

interface UIState {
  activeTool: ToolType
  activeShapeType: ShapeType
  strokeColor: string
  strokeWidth: number
  fillColor: string | null
  roughness: number
  zoom: number
  isDarkMode: boolean
  selectedElementIds: string[]

  setActiveTool: (tool: ToolType) => void
  setActiveShapeType: (shape: ShapeType) => void
  setStrokeColor: (color: string) => void
  setStrokeWidth: (width: number) => void
  setFillColor: (color: string | null) => void
  setRoughness: (roughness: number) => void
  setZoom: (zoom: number) => void
  toggleDarkMode: () => void
  setDarkMode: (value: boolean) => void
  setSelectedElementIds: (ids: string[]) => void
  clearSelection: () => void
}

export const useUIStore = create<UIState>((set) => ({
  activeTool: 'select',
  activeShapeType: 'rectangle',
  strokeColor: CANVAS_COLORS.onSurface,
  strokeWidth: 2,
  fillColor: null,
  roughness: 1,
  zoom: 1,
  isDarkMode: false,
  selectedElementIds: [],

  setActiveTool: (tool) => set({ activeTool: tool }),
  setActiveShapeType: (shape) => set({ activeShapeType: shape }),
  setStrokeColor: (color) => set({ strokeColor: color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  setFillColor: (color) => set({ fillColor: color }),
  setRoughness: (roughness) => set({ roughness }),
  setZoom: (zoom) => set({ zoom }),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  setDarkMode: (value) => set({ isDarkMode: value }),
  setSelectedElementIds: (ids) => set({ selectedElementIds: ids }),
  clearSelection: () => set({ selectedElementIds: [] }),
}))
