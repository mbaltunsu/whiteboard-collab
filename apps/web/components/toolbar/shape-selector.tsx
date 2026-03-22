'use client'

import { useUIStore } from '@/lib/stores/ui-store'
import type { ShapeType } from '@whiteboard/shared'
import { SHAPE_TYPES } from '@whiteboard/shared'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  RectangleIcon,
  EllipseIcon,
  DiamondIcon,
  ArrowIcon,
  LineIcon,
  ShapesIcon,
} from './tool-icons'

const SHAPE_ICONS: Record<ShapeType, React.ComponentType<{ className?: string }>> = {
  rectangle: RectangleIcon,
  ellipse: EllipseIcon,
  diamond: DiamondIcon,
  arrow: ArrowIcon,
  line: LineIcon,
}

const SHAPE_LABELS: Record<ShapeType, string> = {
  rectangle: 'Rectangle',
  ellipse: 'Ellipse',
  diamond: 'Diamond',
  arrow: 'Arrow',
  line: 'Line',
}

export function ShapeSelector() {
  const { activeShapeType, setActiveShapeType, activeTool, setActiveTool } = useUIStore()
  const isActive = activeTool === 'shape'

  const handleShapeSelect = (shape: ShapeType) => {
    setActiveShapeType(shape)
    setActiveTool('shape')
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label="Shapes (R)"
            aria-pressed={isActive}
            className={[
              'relative flex items-center justify-center w-9 h-9 rounded-[var(--wb-radius-md)] transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wb-primary)] focus-visible:ring-offset-1',
              isActive
                ? 'text-[var(--wb-primary)] bg-[rgba(144,151,255,0.2)]'
                : 'text-[var(--wb-on-surface-variant)] hover:text-[var(--wb-on-surface)] hover:bg-[var(--wb-surface-container-low)]',
            ].join(' ')}
          >
            <ShapesIcon className="w-5 h-5" />
            {isActive && (
              <span
                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-[var(--wb-primary)]"
                aria-hidden="true"
              />
            )}
            <span
              className="absolute bottom-1 right-1 w-1 h-1 rounded-sm bg-current opacity-50"
              aria-hidden="true"
            />
          </button>
        }
      />
      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-auto p-2 rounded-[var(--wb-radius-xl)] wb-glass wb-shadow-ambient border-[var(--wb-ghost-border)]"
      >
        <div className="flex flex-col gap-0.5" role="listbox" aria-label="Shape types">
          {SHAPE_TYPES.map((shape) => {
            const Icon = SHAPE_ICONS[shape]
            const isSelected = activeShapeType === shape && activeTool === 'shape'
            return (
              <button
                key={shape}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleShapeSelect(shape)}
                className={[
                  'flex items-center gap-2.5 w-full px-2.5 py-2 rounded-[var(--wb-radius-md)] text-sm transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wb-primary)]',
                  isSelected
                    ? 'text-[var(--wb-primary)] bg-[rgba(144,151,255,0.2)]'
                    : 'text-[var(--wb-on-surface-variant)] hover:text-[var(--wb-on-surface)] hover:bg-[var(--wb-surface-container-low)]',
                ].join(' ')}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="font-medium whitespace-nowrap">{SHAPE_LABELS[shape]}</span>
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
