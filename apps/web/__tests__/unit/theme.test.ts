import { describe, it, expect } from 'vitest'
import {
  CANVAS_COLORS,
  FONTS,
  THUMBNAIL_GRADIENTS,
  STATUS_COLORS,
  STROKE_PALETTE_EXTRAS,
} from '@/lib/theme'

describe('CANVAS_COLORS', () => {
  it('primary is #0c0bff', () => {
    expect(CANVAS_COLORS.primary).toBe('#0c0bff')
  })

  it('onSurface is #2c2f30', () => {
    expect(CANVAS_COLORS.onSurface).toBe('#2c2f30')
  })
})

describe('FONTS', () => {
  it('inter starts with var(--font-inter', () => {
    expect(FONTS.inter).toMatch(/^var\(--font-inter/)
  })
})

describe('THUMBNAIL_GRADIENTS', () => {
  it('has 8 entries', () => {
    expect(THUMBNAIL_GRADIENTS).toHaveLength(8)
  })

  it('all entries start with linear-gradient', () => {
    for (const gradient of THUMBNAIL_GRADIENTS) {
      expect(gradient).toMatch(/^linear-gradient/)
    }
  })
})

describe('STATUS_COLORS', () => {
  it('has connected key', () => {
    expect(STATUS_COLORS).toHaveProperty('connected')
  })

  it('has connecting key', () => {
    expect(STATUS_COLORS).toHaveProperty('connecting')
  })

  it('has disconnected key', () => {
    expect(STATUS_COLORS).toHaveProperty('disconnected')
  })

  it('connected color is a valid CSS color string', () => {
    expect(typeof STATUS_COLORS.connected.color).toBe('string')
    expect(STATUS_COLORS.connected.color.length).toBeGreaterThan(0)
  })
})

describe('STROKE_PALETTE_EXTRAS', () => {
  it('has 4 entries', () => {
    expect(STROKE_PALETTE_EXTRAS).toHaveLength(4)
  })
})
