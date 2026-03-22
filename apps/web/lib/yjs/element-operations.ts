import * as Y from "yjs"
import { ELEMENTS_MAP_KEY } from "@whiteboard/shared"
import type {
  WhiteboardElement,
  ElementType,
  FreehandData,
  StickyNoteDataSerialized,
  ShapeData,
  CommentData,
} from "@whiteboard/shared"

type ElementData = FreehandData | StickyNoteDataSerialized | ShapeData | CommentData

interface CreateElementOptions {
  type: ElementType
  position: { x: number; y: number }
  size?: { w: number; h: number }
  style?: { color: string; strokeWidth: number; opacity: number }
  data: ElementData
  createdBy: string
  zIndex?: number
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

function getElementsMap(doc: Y.Doc): Y.Map<Y.Map<unknown>> {
  return doc.getMap<Y.Map<unknown>>(ELEMENTS_MAP_KEY)
}

export function createElement(
  doc: Y.Doc,
  options: CreateElementOptions,
): string {
  const id = generateId()
  const elementsMap = getElementsMap(doc)

  doc.transact(() => {
    const yElement = new Y.Map<unknown>()
    const currentMax = elementsMap.size

    yElement.set("id", id)
    yElement.set("type", options.type)
    yElement.set("position", options.position)
    yElement.set("size", options.size ?? { w: 100, h: 100 })
    yElement.set("style", options.style ?? { color: "#2c2f30", strokeWidth: 2, opacity: 1 })
    yElement.set("zIndex", options.zIndex ?? currentMax)
    yElement.set("createdBy", options.createdBy)
    yElement.set("locked", false)
    yElement.set("data", options.data)

    elementsMap.set(id, yElement)
  })

  return id
}

export function updateElement(
  doc: Y.Doc,
  id: string,
  partial: Partial<Omit<WhiteboardElement, "id" | "type">>,
): void {
  const elementsMap = getElementsMap(doc)
  const yElement = elementsMap.get(id)
  if (!yElement) return

  doc.transact(() => {
    for (const [key, value] of Object.entries(partial)) {
      if (value !== undefined) {
        yElement.set(key, value)
      }
    }
  })
}

export function deleteElement(doc: Y.Doc, id: string): void {
  const elementsMap = getElementsMap(doc)
  doc.transact(() => {
    elementsMap.delete(id)
  })
}

export function deleteElements(doc: Y.Doc, ids: string[]): void {
  const elementsMap = getElementsMap(doc)
  doc.transact(() => {
    for (const id of ids) {
      elementsMap.delete(id)
    }
  })
}

export function moveElement(
  doc: Y.Doc,
  id: string,
  newPosition: { x: number; y: number },
): void {
  updateElement(doc, id, { position: newPosition })
}

export function resizeElement(
  doc: Y.Doc,
  id: string,
  newSize: { w: number; h: number },
): void {
  updateElement(doc, id, { size: newSize })
}
