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
  secondary: '#555c69',
  surface: '#f5f6f7',
  onSurface: '#2c2f30',
  onSurfaceVariant: '#595c5d',
  outlineVariant: '#abadae',
  surfaceContainerLowest: '#ffffff',
  primaryAlpha18: 'rgba(12, 11, 255, 0.18)',
  primaryAlpha60: 'rgba(12, 11, 255, 0.6)',
  primaryPulseStart: 'rgba(12, 11, 255, 0.3)',
  primaryPulseEnd: 'rgba(12, 11, 255, 0)',
  shadowColor: 'rgba(12, 15, 16, 0.12)',
  gridDot: 'rgba(171, 173, 174, 0.3)',
  gridDotFaint: 'rgba(171, 173, 174, 0.10)',
  cursorLabelBg: 'rgba(255, 255, 255, 0.85)',
  cursorLabelBorder: 'rgba(171, 173, 174, 0.15)',
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

/**
 * Semantic status colors for connection state indicators.
 * Used as resolved values in JSX inline styles (cannot use CSS vars for these).
 */
export const STATUS_COLORS = {
  connected: {
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.12)',
  },
  connecting: {
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
  },
  disconnected: {
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.12)',
  },
} as const

/**
 * Extra stroke palette colors for the color picker (beyond PRESENCE_COLORS).
 * Defined as resolved hex values for use in canvas drawing and color swatch buttons.
 */
export const STROKE_PALETTE_EXTRAS: readonly string[] = [
  '#2c2f30', // on-surface (default dark)
  '#ffffff', // white
  '#555c69', // secondary cool gray
  '#0c0bff', // primary electric indigo
]

/**
 * Deterministic thumbnail placeholder gradients for board cards.
 * Intentionally decorative — not part of the theme color system.
 */
export const THUMBNAIL_GRADIENTS: readonly string[] = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
]
