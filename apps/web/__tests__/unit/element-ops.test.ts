import { describe, it, expect, beforeEach } from 'vitest'
import * as Y from 'yjs'
import { createElement, deleteElement, updateElement, getElement } from '@/lib/yjs/element-operations'
import { CANVAS_COLORS } from '@/lib/theme'
import { ELEMENTS_MAP_KEY } from '@whiteboard/shared'

describe('element-operations', () => {
  let doc: Y.Doc

  beforeEach(() => {
    doc = new Y.Doc()
  })

  describe('createElement', () => {
    it('adds element to the Y.Map', () => {
      const id = createElement(doc, {
        type: 'shape',
        position: { x: 10, y: 20 },
        data: { shapeType: 'rectangle', fill: null, roughness: 1, connectedTo: [] },
        createdBy: 'user-1',
      })

      const elementsMap = doc.getMap(ELEMENTS_MAP_KEY)
      expect(elementsMap.has(id)).toBe(true)
    })

    it('assigns correct type', () => {
      const id = createElement(doc, {
        type: 'sticky',
        position: { x: 0, y: 0 },
        data: { text: 'hello', color: 'yellow', fontSize: 16 },
        createdBy: 'user-1',
      })

      const el = getElement(doc, id)
      expect(el?.type).toBe('sticky')
    })

    it('assigns correct position', () => {
      const position = { x: 42, y: 99 }
      const id = createElement(doc, {
        type: 'shape',
        position,
        data: { shapeType: 'ellipse', fill: null, roughness: 1, connectedTo: [] },
        createdBy: 'user-1',
      })

      const el = getElement(doc, id)
      expect(el?.position).toEqual(position)
    })

    it('assigns provided size', () => {
      const size = { w: 200, h: 150 }
      const id = createElement(doc, {
        type: 'shape',
        position: { x: 0, y: 0 },
        size,
        data: { shapeType: 'rectangle', fill: null, roughness: 1, connectedTo: [] },
        createdBy: 'user-1',
      })

      const el = getElement(doc, id)
      expect(el?.size).toEqual(size)
    })

    it('uses default size { w: 100, h: 100 } when size is omitted', () => {
      const id = createElement(doc, {
        type: 'shape',
        position: { x: 0, y: 0 },
        data: { shapeType: 'rectangle', fill: null, roughness: 1, connectedTo: [] },
        createdBy: 'user-1',
      })

      const el = getElement(doc, id)
      expect(el?.size).toEqual({ w: 100, h: 100 })
    })

    it('uses CANVAS_COLORS.onSurface as default style color', () => {
      const id = createElement(doc, {
        type: 'freehand',
        position: { x: 0, y: 0 },
        data: { points: [], tool: 'pen', roughness: 1 },
        createdBy: 'user-1',
      })

      const el = getElement(doc, id)
      expect(el?.style.color).toBe(CANVAS_COLORS.onSurface)
    })

    it('returns a unique id each call', () => {
      const id1 = createElement(doc, {
        type: 'shape',
        position: { x: 0, y: 0 },
        data: { shapeType: 'rectangle', fill: null, roughness: 1, connectedTo: [] },
        createdBy: 'user-1',
      })
      const id2 = createElement(doc, {
        type: 'shape',
        position: { x: 0, y: 0 },
        data: { shapeType: 'rectangle', fill: null, roughness: 1, connectedTo: [] },
        createdBy: 'user-1',
      })
      expect(id1).not.toBe(id2)
    })
  })

  describe('deleteElement', () => {
    it('removes element from the Y.Map', () => {
      const id = createElement(doc, {
        type: 'shape',
        position: { x: 0, y: 0 },
        data: { shapeType: 'rectangle', fill: null, roughness: 1, connectedTo: [] },
        createdBy: 'user-1',
      })

      deleteElement(doc, id)

      const elementsMap = doc.getMap(ELEMENTS_MAP_KEY)
      expect(elementsMap.has(id)).toBe(false)
    })

    it('does nothing when the id does not exist', () => {
      expect(() => deleteElement(doc, 'nonexistent-id')).not.toThrow()
    })

    it('only removes the targeted element', () => {
      const id1 = createElement(doc, {
        type: 'shape',
        position: { x: 0, y: 0 },
        data: { shapeType: 'rectangle', fill: null, roughness: 1, connectedTo: [] },
        createdBy: 'user-1',
      })
      const id2 = createElement(doc, {
        type: 'shape',
        position: { x: 10, y: 10 },
        data: { shapeType: 'ellipse', fill: null, roughness: 1, connectedTo: [] },
        createdBy: 'user-1',
      })

      deleteElement(doc, id1)

      const elementsMap = doc.getMap(ELEMENTS_MAP_KEY)
      expect(elementsMap.has(id1)).toBe(false)
      expect(elementsMap.has(id2)).toBe(true)
    })
  })

  describe('updateElement', () => {
    it('updates the position field', () => {
      const id = createElement(doc, {
        type: 'shape',
        position: { x: 0, y: 0 },
        data: { shapeType: 'rectangle', fill: null, roughness: 1, connectedTo: [] },
        createdBy: 'user-1',
      })

      const newPosition = { x: 50, y: 75 }
      updateElement(doc, id, { position: newPosition })

      const el = getElement(doc, id)
      expect(el?.position).toEqual(newPosition)
    })

    it('updates the size field', () => {
      const id = createElement(doc, {
        type: 'shape',
        position: { x: 0, y: 0 },
        data: { shapeType: 'rectangle', fill: null, roughness: 1, connectedTo: [] },
        createdBy: 'user-1',
      })

      updateElement(doc, id, { size: { w: 300, h: 200 } })

      const el = getElement(doc, id)
      expect(el?.size).toEqual({ w: 300, h: 200 })
    })

    it('does nothing when the id does not exist', () => {
      expect(() => updateElement(doc, 'nonexistent-id', { position: { x: 1, y: 2 } })).not.toThrow()
    })

    it('does not alter other fields when updating position', () => {
      const id = createElement(doc, {
        type: 'shape',
        position: { x: 0, y: 0 },
        size: { w: 50, h: 50 },
        data: { shapeType: 'rectangle', fill: null, roughness: 1, connectedTo: [] },
        createdBy: 'user-1',
      })

      updateElement(doc, id, { position: { x: 10, y: 20 } })

      const el = getElement(doc, id)
      expect(el?.size).toEqual({ w: 50, h: 50 })
      expect(el?.type).toBe('shape')
    })
  })
})
