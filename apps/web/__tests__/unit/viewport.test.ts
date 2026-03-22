import { describe, it, expect, beforeEach } from 'vitest'
import { Viewport } from '@/components/canvas/viewport'

describe('Viewport', () => {
  let vp: Viewport

  beforeEach(() => {
    vp = new Viewport()
    vp.setScreenSize(1280, 720)
  })

  describe('canvasToScreen and screenToCanvas are inverse operations', () => {
    it('roundtrips a point at default scale and origin', () => {
      const canvas = { x: 100, y: 200 }
      const screen = vp.canvasToScreen(canvas.x, canvas.y)
      const back = vp.screenToCanvas(screen.x, screen.y)
      expect(back.x).toBeCloseTo(canvas.x)
      expect(back.y).toBeCloseTo(canvas.y)
    })

    it('roundtrips after pan', () => {
      vp.pan(50, -30)
      const canvas = { x: 300, y: 150 }
      const screen = vp.canvasToScreen(canvas.x, canvas.y)
      const back = vp.screenToCanvas(screen.x, screen.y)
      expect(back.x).toBeCloseTo(canvas.x)
      expect(back.y).toBeCloseTo(canvas.y)
    })

    it('roundtrips after zoom', () => {
      vp.zoom(2, 640, 360)
      const canvas = { x: 50, y: 75 }
      const screen = vp.canvasToScreen(canvas.x, canvas.y)
      const back = vp.screenToCanvas(screen.x, screen.y)
      expect(back.x).toBeCloseTo(canvas.x)
      expect(back.y).toBeCloseTo(canvas.y)
    })
  })

  describe('zoom clamps to min/max bounds', () => {
    it('does not exceed MAX_ZOOM (5.0)', () => {
      vp.zoom(1000, 640, 360)
      expect(vp.scale).toBeLessThanOrEqual(5.0)
    })

    it('does not go below MIN_ZOOM (0.1)', () => {
      vp.zoom(0.00001, 640, 360)
      expect(vp.scale).toBeGreaterThanOrEqual(0.1)
    })

    it('stays at min zoom when zooming out further', () => {
      vp.zoom(0.00001, 640, 360)
      const scaleAtMin = vp.scale
      vp.zoom(0.5, 640, 360)
      expect(vp.scale).toBe(scaleAtMin)
    })

    it('stays at max zoom when zooming in further', () => {
      vp.zoom(1000, 640, 360)
      const scaleAtMax = vp.scale
      vp.zoom(2, 640, 360)
      expect(vp.scale).toBe(scaleAtMax)
    })
  })

  describe('pan updates translateX/translateY', () => {
    it('increments translateX and translateY', () => {
      vp.pan(100, 50)
      expect(vp.translateX).toBe(100)
      expect(vp.translateY).toBe(50)
    })

    it('accumulates multiple pans', () => {
      vp.pan(100, 50)
      vp.pan(-30, 20)
      expect(vp.translateX).toBe(70)
      expect(vp.translateY).toBe(70)
    })

    it('starts at (0, 0) by default', () => {
      expect(vp.translateX).toBe(0)
      expect(vp.translateY).toBe(0)
    })
  })

  describe('getVisibleBounds returns correct world-space rect', () => {
    it('at default scale covers the full screen in canvas space', () => {
      const bounds = vp.getVisibleBounds()
      expect(bounds.x).toBeCloseTo(0)
      expect(bounds.y).toBeCloseTo(0)
      expect(bounds.w).toBeCloseTo(1280)
      expect(bounds.h).toBeCloseTo(720)
    })

    it('after zoom-in visible area shrinks', () => {
      vp.zoom(2, 0, 0)
      const bounds = vp.getVisibleBounds()
      expect(bounds.w).toBeCloseTo(640)
      expect(bounds.h).toBeCloseTo(360)
    })

    it('after pan the top-left canvas coordinate shifts', () => {
      vp.pan(-200, -100)
      const bounds = vp.getVisibleBounds()
      expect(bounds.x).toBeCloseTo(200)
      expect(bounds.y).toBeCloseTo(100)
    })

    it('width and height are always positive', () => {
      const bounds = vp.getVisibleBounds()
      expect(bounds.w).toBeGreaterThan(0)
      expect(bounds.h).toBeGreaterThan(0)
    })
  })

  describe('getTransformMatrix returns correct 6-element array', () => {
    it('returns a DOMMatrix', () => {
      const m = vp.getTransformMatrix()
      expect(m).toBeInstanceOf(DOMMatrix)
    })

    it('default matrix has scale=1 and no translation', () => {
      const m = vp.getTransformMatrix()
      expect(m.a).toBe(1) // scaleX
      expect(m.d).toBe(1) // scaleY
      expect(m.e).toBe(0) // translateX
      expect(m.f).toBe(0) // translateY
    })

    it('reflects pan in translation components', () => {
      vp.pan(40, 80)
      const m = vp.getTransformMatrix()
      expect(m.e).toBe(40)
      expect(m.f).toBe(80)
    })

    it('reflects scale after zoom', () => {
      vp.zoom(2, 0, 0)
      const m = vp.getTransformMatrix()
      expect(m.a).toBeCloseTo(2)
      expect(m.d).toBeCloseTo(2)
    })
  })
})
