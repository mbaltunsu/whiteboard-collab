/**
 * Font family CSS variable references.
 * Use in JSX `style` props instead of hardcoded font strings.
 * The CSS variables are set by next/font/google in layout.tsx.
 */
export const FONTS = {
  inter: 'var(--font-inter, Inter, sans-serif)',
  manrope: 'var(--font-manrope, Manrope, sans-serif)',
} as const

/**
 * Resolved color values for Canvas 2D API.
 * CSS custom properties cannot be used directly in canvas drawing calls.
 */
export const CANVAS_COLORS = {
  primary: '#0c0bff',
  onPrimary: '#ffffff',
  surface: '#f5f6f7',
  onSurface: '#2c2f30',
  primaryAlpha18: 'rgba(12, 11, 255, 0.18)',
  primaryAlpha60: 'rgba(12, 11, 255, 0.6)',
  primaryPulseStart: 'rgba(12, 11, 255, 0.3)',
  primaryPulseEnd: 'rgba(12, 11, 255, 0)',
  shadowColor: 'rgba(12, 15, 16, 0.12)',
  gridDot: 'rgba(171, 173, 174, 0.3)',
  sticky: {
    yellow: '#f8a010',
    pink: '#f472b6',
    blue: '#60a5fa',
    green: '#4ade80',
    purple: '#a78bfa',
  } as Record<string, string>,
} as const

/**
 * Font family strings for Canvas 2D API font property.
 * CSS variables cannot be used in canvas font strings.
 */
export const CANVAS_FONTS = {
  inter: 'Inter, sans-serif',
} as const

/**
 * Gradient values for JSX inline styles.
 * References the CSS custom property so themes can override it.
 */
export const GRADIENTS = {
  primary: 'var(--wb-gradient-primary)',
} as const
