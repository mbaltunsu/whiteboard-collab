'use client'

import { useCallback, useEffect } from 'react'
import type { ToolType } from '@whiteboard/shared'
import { useUIStore } from '@/lib/stores/ui-store'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import {
  SelectIcon,
  PenIcon,
  HandIcon,
  StickyNoteIcon,
  CommentIcon,
  EraserIcon,
  HighlighterIcon,
} from './tool-icons'
import { ShapeSelector } from './shape-selector'

interface ToolConfig {
  tool: ToolType
  label: string
  shortcut: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV_TOOLS: ToolConfig[] = [
  { tool: 'select', label: 'Select', shortcut: 'V', icon: SelectIcon },
  { tool: 'pen', label: 'Draw', shortcut: 'P', icon: PenIcon },
  { tool: 'highlighter', label: 'Highlight', shortcut: 'H', icon: HighlighterIcon },
  { tool: 'hand', label: 'Pan', shortcut: 'Space', icon: HandIcon },
]

const CONTENT_TOOLS: ToolConfig[] = [
  { tool: 'sticky', label: 'Sticky Note', shortcut: 'S', icon: StickyNoteIcon },
  { tool: 'comment', label: 'Comment', shortcut: 'C', icon: CommentIcon },
]

const EDIT_TOOLS: ToolConfig[] = [
  { tool: 'eraser', label: 'Eraser', shortcut: 'E', icon: EraserIcon },
]

const KEYBOARD_MAP: Record<string, ToolType> = {
  v: 'select',
  p: 'pen',
  h: 'highlighter',
  r: 'shape',
  s: 'sticky',
  c: 'comment',
  e: 'eraser',
}

export function Toolbar() {
  const { activeTool, setActiveTool } = useUIStore()

  const handleToolSelect = useCallback(
    (tool: ToolType) => setActiveTool(tool),
    [setActiveTool]
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (e.key === ' ') {
        setActiveTool('hand')
        return
      }

      const tool = KEYBOARD_MAP[e.key.toLowerCase()]
      if (tool) setActiveTool(tool)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [setActiveTool])

  return (
    <div
      className="wb-tool-dock fixed left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-1 p-2"
      role="toolbar"
      aria-label="Drawing tools"
      aria-orientation="vertical"
    >
      {NAV_TOOLS.map(({ tool, label, shortcut, icon: Icon }) => (
        <ToolButton
          key={tool}
          tool={tool}
          label={label}
          shortcut={shortcut}
          isActive={activeTool === tool}
          onSelect={handleToolSelect}
        >
          <Icon className="w-5 h-5" />
        </ToolButton>
      ))}

      <Separator className="w-7 my-1 bg-[var(--wb-ghost-border)]" />

      <ShapeSelector />

      <Separator className="w-7 my-1 bg-[var(--wb-ghost-border)]" />

      {CONTENT_TOOLS.map(({ tool, label, shortcut, icon: Icon }) => (
        <ToolButton
          key={tool}
          tool={tool}
          label={label}
          shortcut={shortcut}
          isActive={activeTool === tool}
          onSelect={handleToolSelect}
        >
          <Icon className="w-5 h-5" />
        </ToolButton>
      ))}

      <Separator className="w-7 my-1 bg-[var(--wb-ghost-border)]" />

      {EDIT_TOOLS.map(({ tool, label, shortcut, icon: Icon }) => (
        <ToolButton
          key={tool}
          tool={tool}
          label={label}
          shortcut={shortcut}
          isActive={activeTool === tool}
          onSelect={handleToolSelect}
        >
          <Icon className="w-5 h-5" />
        </ToolButton>
      ))}
    </div>
  )
}

interface ToolButtonProps {
  tool: ToolType
  label: string
  shortcut: string
  isActive: boolean
  onSelect: (tool: ToolType) => void
  children: React.ReactNode
}

function ToolButton({ tool, label, shortcut, isActive, onSelect, children }: ToolButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={() => onSelect(tool)}
            aria-label={`${label} (${shortcut})`}
            aria-pressed={isActive}
            className={[
              'relative flex items-center justify-center w-9 h-9 rounded-[var(--wb-radius-md)] transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wb-primary)] focus-visible:ring-offset-1',
              isActive
                ? 'text-[var(--wb-primary)] bg-[var(--wb-primary-alpha-20)]'
                : 'text-[var(--wb-on-surface-variant)] hover:text-[var(--wb-on-surface)] hover:bg-[var(--wb-surface-container-low)]',
            ].join(' ')}
          >
            {children}
            {isActive && (
              <span
                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-[var(--wb-primary)]"
                aria-hidden="true"
              />
            )}
          </button>
        }
      />
      <TooltipContent side="right">
        <span className="text-xs font-medium">{label}</span>
        <kbd className="px-1.5 py-0.5 text-xs font-mono rounded bg-[var(--wb-surface-container)] text-[var(--wb-on-surface-variant)]">
          {shortcut}
        </kbd>
      </TooltipContent>
    </Tooltip>
  )
}
