import '@testing-library/jest-dom'

// DOMMatrix is part of the browser Canvas/CSS spec but is not included in jsdom.
// Provide a minimal implementation so Viewport.getTransformMatrix() can be tested.
if (typeof DOMMatrix === 'undefined') {
  class DOMMatrixPolyfill {
    a: number; b: number; c: number; d: number; e: number; f: number
    constructor(init?: number[]) {
      const v = init ?? [1, 0, 0, 1, 0, 0]
      this.a = v[0] ?? 1
      this.b = v[1] ?? 0
      this.c = v[2] ?? 0
      this.d = v[3] ?? 1
      this.e = v[4] ?? 0
      this.f = v[5] ?? 0
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).DOMMatrix = DOMMatrixPolyfill
}
