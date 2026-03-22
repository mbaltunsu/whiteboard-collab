'use client'

import { Sun, Moon } from 'lucide-react'
import { useUIStore } from '@/lib/stores/ui-store'

export function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useUIStore()

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDarkMode}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '2rem',
        height: '2rem',
        borderRadius: 'var(--wb-radius-md)',
        border: 'none',
        background: 'transparent',
        color: 'var(--wb-on-surface-variant)',
        cursor: 'pointer',
        transition: 'background-color 150ms ease, color 150ms ease',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.backgroundColor = isDarkMode
          ? 'var(--wb-primary-alpha-12)'
          : 'var(--wb-surface-container)'
        el.style.color = 'var(--wb-on-surface)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.backgroundColor = 'transparent'
        el.style.color = 'var(--wb-on-surface-variant)'
      }}
    >
      <span
        style={{
          display: 'grid',
          placeItems: 'center',
          transition: 'transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease',
          transform: isDarkMode ? 'rotate(0deg) scale(1)' : 'rotate(-30deg) scale(0.8)',
          opacity: isDarkMode ? 1 : 0,
          position: 'absolute',
        }}
        aria-hidden="true"
      >
        <Moon size={16} strokeWidth={2} />
      </span>

      <span
        style={{
          display: 'grid',
          placeItems: 'center',
          transition: 'transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease',
          transform: isDarkMode ? 'rotate(30deg) scale(0.8)' : 'rotate(0deg) scale(1)',
          opacity: isDarkMode ? 0 : 1,
          position: 'absolute',
        }}
        aria-hidden="true"
      >
        <Sun size={16} strokeWidth={2} />
      </span>
    </button>
  )
}
