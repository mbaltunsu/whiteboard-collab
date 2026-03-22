'use client'

import { useEffect } from 'react'
import { useUIStore } from '@/lib/stores/ui-store'

const STORAGE_KEY = 'wb-theme'

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { isDarkMode, setDarkMode } = useUIStore()

  // On mount: read localStorage or fall back to system preference, then sync store
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    const prefersDark =
      stored !== null
        ? stored === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(prefersDark)
  // Run once on mount — intentionally stable: setDarkMode is a Zustand action
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Whenever isDarkMode changes: apply/remove the class and persist
  useEffect(() => {
    const root = document.documentElement

    if (isDarkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    localStorage.setItem(STORAGE_KEY, isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  return <>{children}</>
}
