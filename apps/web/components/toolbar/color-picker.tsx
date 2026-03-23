'use client'

import { useUIStore } from '@/lib/stores/ui-store'
import { PRESENCE_COLORS } from '@whiteboard/shared'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { STROKE_PALETTE_EXTRAS, CANVAS_COLORS } from '@/lib/theme'

// 12-color palette from PRESENCE_COLORS plus whiteboard brand neutrals
const STROKE_COLORS = [
  ...PRESENCE_COLORS,
  ...STROKE_PALETTE_EXTRAS,
]

interface ColorPickerProps {
  showFill?: boolean
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function ColorPicker({ showFill = false, side = 'right' }: ColorPickerProps) {
  const { strokeColor, setStrokeColor, fillColor, setFillColor } = useUIStore()

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={`Stroke color: ${strokeColor}`}
            title="Stroke color"
            className={[
              'flex items-center justify-center w-9 h-9 rounded-[var(--wb-radius-md)] transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wb-primary)] focus-visible:ring-offset-1',
              'text-[var(--wb-on-surface-variant)] hover:text-[var(--wb-on-surface)] hover:bg-[var(--wb-surface-container-low)]',
            ].join(' ')}
          >
            <ColorDot color={strokeColor} size="lg" />
          </button>
        }
      />
      <PopoverContent
        side={side}
        align="center"
        sideOffset={8}
        className="w-auto p-3 rounded-[var(--wb-radius-xl)] wb-glass wb-shadow-ambient border-[var(--wb-ghost-border)]"
      >
        <div className="flex flex-col gap-3">
          <ColorSection
            label="Stroke"
            colors={STROKE_COLORS}
            selected={strokeColor}
            onSelect={setStrokeColor}
          />
          {showFill && (
            <>
              <div className="h-px bg-[var(--wb-ghost-border)]" />
              <ColorSection
                label="Fill"
                colors={['none', ...STROKE_COLORS]}
                selected={fillColor ?? 'none'}
                onSelect={(c) => setFillColor(c === 'none' ? null : c)}
                allowNone
              />
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface ColorSectionProps {
  label: string
  colors: string[]
  selected: string
  onSelect: (color: string) => void
  allowNone?: boolean
}

function ColorSection({ label, colors, selected, onSelect, allowNone }: ColorSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-[var(--wb-on-surface-variant)] uppercase tracking-wide px-0.5">
        {label}
      </span>
      <div className="grid grid-cols-4 gap-1.5">
        {allowNone && (
          <button
            type="button"
            aria-label="No fill"
            aria-pressed={selected === 'none'}
            onClick={() => onSelect('none')}
            className={[
              'relative w-7 h-7 rounded-[var(--wb-radius-md)] border-2 transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wb-primary)]',
              selected === 'none'
                ? 'border-[var(--wb-primary)] scale-110'
                : 'border-[var(--wb-ghost-border)] hover:scale-105',
            ].join(' ')}
          >
            <div className="absolute inset-0 overflow-hidden rounded-[calc(var(--wb-radius-md)-2px)] bg-white">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to bottom right, transparent calc(50% - 0.5px), #ef4444 calc(50% - 0.5px), #ef4444 calc(50% + 0.5px), transparent calc(50% + 0.5px))',
                }}
              />
            </div>
          </button>
        )}
        {colors
          .filter((c) => c !== 'none')
          .map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Color ${color}`}
              aria-pressed={selected === color}
              onClick={() => onSelect(color)}
              className={[
                'relative w-7 h-7 rounded-[var(--wb-radius-md)] border-2 transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wb-primary)]',
                selected === color
                  ? 'border-[var(--wb-primary)] scale-110'
                  : 'border-transparent hover:scale-105 hover:border-[var(--wb-outline-variant)]',
              ].join(' ')}
              style={{ backgroundColor: color }}
            >
              {selected === color && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 6L5 9L10 3"
                      stroke={isLightColor(color) ? CANVAS_COLORS.onSurface : CANVAS_COLORS.onPrimary}
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </button>
          ))}
      </div>
    </div>
  )
}

interface ColorDotProps {
  color: string
  size?: 'sm' | 'md' | 'lg'
}

export function ColorDot({ color, size = 'md' }: ColorDotProps) {
  const sizeClass = size === 'lg' ? 'w-5 h-5' : size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
  return (
    <span
      className={`${sizeClass} rounded-full border border-[var(--wb-ghost-border)] inline-block shrink-0`}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  )
}

function isLightColor(hex: string): boolean {
  if (!hex.startsWith('#') || hex.length < 7) return true
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 128
}
