'use client'

import { useEffect } from 'react'
import type { ToolType } from '@whiteboard/shared'
import { useUIStore } from '@/lib/stores/ui-store'

export interface KeyboardShortcutCallbacks {
  onDelete?: () => void
  onSelectAll?: () => void
  onDeselectAll?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onZoomReset?: () => void
}

const TOOL_KEY_MAP: Record<string, ToolType> = {
  v: 'select',
  p: 'pen',
  h: 'hand',
  e: 'eraser',
  r: 'shape',
  s: 'sticky',
  c: 'comment',
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!target) return false
  if (target instanceof HTMLInputElement) return true
  if (target instanceof HTMLTextAreaElement) return true
  if (target instanceof HTMLSelectElement) return true
  if ((target as HTMLElement).isContentEditable) return true
  return false
}

export function useKeyboardShortcuts(callbacks: KeyboardShortcutCallbacks = {}) {
  const { setActiveTool } = useUIStore()

  useEffect(() => {
    const {
      onDelete,
      onSelectAll,
      onDeselectAll,
      onUndo,
      onRedo,
      onZoomIn,
      onZoomOut,
      onZoomReset,
    } = callbacks

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return

      const ctrl = e.ctrlKey || e.metaKey
      const shift = e.shiftKey
      const key = e.key.toLowerCase()

      // Ctrl / Meta combos
      if (ctrl) {
        switch (key) {
          case 'a':
            e.preventDefault()
            onSelectAll?.()
            return
          case 'z':
            e.preventDefault()
            if (shift) {
              onRedo?.()
            } else {
              onUndo?.()
            }
            return
          case 'y':
            e.preventDefault()
            onRedo?.()
            return
          case '=':
          case '+':
            e.preventDefault()
            onZoomIn?.()
            return
          case '-':
            e.preventDefault()
            onZoomOut?.()
            return
          case '0':
            e.preventDefault()
            onZoomReset?.()
            return
        }
        return
      }

      // No modifier keys for the rest
      if (e.altKey) return

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          onDelete?.()
          return
        case 'Escape':
          onDeselectAll?.()
          return
      }

      // Tool shortcuts (single key, no modifier)
      const tool = TOOL_KEY_MAP[key]
      if (tool) {
        setActiveTool(tool)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    setActiveTool,
    callbacks.onDelete,
    callbacks.onSelectAll,
    callbacks.onDeselectAll,
    callbacks.onUndo,
    callbacks.onRedo,
    callbacks.onZoomIn,
    callbacks.onZoomOut,
    callbacks.onZoomReset,
  ])
}
