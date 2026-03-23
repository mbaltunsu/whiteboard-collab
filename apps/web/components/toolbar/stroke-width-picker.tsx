'use client'

import { useUIStore } from '@/lib/stores/ui-store'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'

const PRESET_WIDTHS = [1, 2, 4, 8] as const

interface StrokeWidthPickerProps {
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function StrokeWidthPicker({ side = 'right' }: StrokeWidthPickerProps) {
  const { strokeWidth, setStrokeWidth, strokeColor } = useUIStore()

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={`Stroke width: ${strokeWidth}px`}
            title="Stroke width"
            className={[
              'flex items-center justify-center w-9 h-9 rounded-[var(--wb-radius-md)] transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wb-primary)] focus-visible:ring-offset-1',
              'text-[var(--wb-on-surface-variant)] hover:text-[var(--wb-on-surface)] hover:bg-[var(--wb-surface-container-low)]',
            ].join(' ')}
          >
            <StrokeWidthIcon width={strokeWidth} />
          </button>
        }
      />
      <PopoverContent
        side={side}
        align="center"
        sideOffset={8}
        className="w-56 p-4 rounded-[var(--wb-radius-xl)] wb-glass wb-shadow-ambient border-[var(--wb-ghost-border)]"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--wb-on-surface-variant)] uppercase tracking-wide">
              Stroke width
            </span>
            <span className="text-sm font-medium text-[var(--wb-on-surface)] tabular-nums">
              {strokeWidth}px
            </span>
          </div>

          {/* Live stroke preview */}
          <div className="flex items-center justify-center h-10 rounded-[var(--wb-radius-lg)] bg-[var(--wb-surface-container)]">
            <svg width="120" height="24" viewBox="0 0 120 24" fill="none" aria-hidden="true">
              <path
                d="M8 12 Q30 6 60 12 Q90 18 112 12"
                stroke={strokeColor}
                strokeWidth={Math.max(strokeWidth, 1)}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>

          {/* Slider */}
          <Slider
            min={1}
            max={12}
            step={1}
            value={[strokeWidth]}
            onValueChange={(v) => {
              const newWidth = Array.isArray(v) ? v[0] : (v as number)
              if (typeof newWidth === 'number') setStrokeWidth(newWidth)
            }}
            aria-label="Stroke width"
          />

          {/* Preset buttons */}
          <div className="flex items-center gap-2">
            {PRESET_WIDTHS.map((w) => (
              <button
                key={w}
                type="button"
                aria-label={`${w}px stroke`}
                aria-pressed={strokeWidth === w}
                onClick={() => setStrokeWidth(w)}
                title={`${w}px`}
                className={[
                  'flex-1 h-8 rounded-[var(--wb-radius-md)] transition-all duration-150 flex items-center justify-center',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wb-primary)]',
                  strokeWidth === w
                    ? 'bg-[var(--wb-primary-alpha-20)]'
                    : 'hover:bg-[var(--wb-surface-container-low)]',
                ].join(' ')}
              >
                <div
                  className="rounded-full bg-[var(--wb-on-surface)]"
                  style={{
                    width: `${Math.min(w * 3, 24)}px`,
                    height: `${w}px`,
                  }}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function StrokeWidthIcon({ width }: { width: number }) {
  const clampedWidth = Math.min(Math.max(width, 1), 6)
  return (
    <div className="flex items-center justify-center w-5 h-5">
      <div
        className="rounded-full bg-current"
        style={{
          width: `${Math.min(clampedWidth * 3, 18)}px`,
          height: `${clampedWidth}px`,
        }}
        aria-hidden="true"
      />
    </div>
  )
}
