'use client'

import { useCallback } from 'react'
import { useUIStore } from '@/lib/stores/ui-store'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ZoomInIcon, ZoomOutIcon, FitScreenIcon } from './tool-icons'

const MIN_ZOOM = 0.1
const MAX_ZOOM = 5
const ZOOM_STEP = 0.25

interface ZoomControlsProps {
  onFitToScreen?: () => void
  onZoomIn?: () => number | void
  onZoomOut?: () => number | void
  onReset?: () => number | void
}

export function ZoomControls({ onFitToScreen, onZoomIn, onZoomOut, onReset }: ZoomControlsProps) {
  const { zoom, setZoom } = useUIStore()

  const zoomIn = useCallback(() => {
    const result = onZoomIn?.()
    setZoom(typeof result === 'number' ? result : Math.min(zoom + ZOOM_STEP, MAX_ZOOM))
  }, [zoom, setZoom, onZoomIn])

  const zoomOut = useCallback(() => {
    const result = onZoomOut?.()
    setZoom(typeof result === 'number' ? result : Math.max(zoom - ZOOM_STEP, MIN_ZOOM))
  }, [zoom, setZoom, onZoomOut])

  const resetZoom = useCallback(() => {
    const result = onReset?.()
    setZoom(typeof result === 'number' ? result : 1)
  }, [setZoom, onReset])

  const fitToScreen = useCallback(() => {
    if (onFitToScreen) {
      onFitToScreen()
    } else {
      setZoom(1)
    }
  }, [onFitToScreen, setZoom])

  const displayPercent = Math.round(zoom * 100)

  return (
    <div
      className="wb-tool-dock fixed bottom-4 right-3 z-50 flex items-center gap-0.5 p-1.5 md:bottom-6"
      role="toolbar"
      aria-label="Zoom controls"
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onClick={zoomOut}
              disabled={zoom <= MIN_ZOOM}
              aria-label="Zoom out"
              className={[
                'flex items-center justify-center w-9 h-9 md:w-8 md:h-8 rounded-[var(--wb-radius-md)] transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wb-primary)] focus-visible:ring-offset-1',
                'text-[var(--wb-on-surface-variant)] hover:text-[var(--wb-on-surface)] hover:bg-[var(--wb-surface-container-low)]',
                'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent',
              ].join(' ')}
            >
              <ZoomOutIcon className="w-4 h-4" />
            </button>
          }
        />
        <TooltipContent side="top">
          <span className="text-xs">Zoom out</span>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onClick={resetZoom}
              aria-label={`Current zoom: ${displayPercent}%. Click to reset to 100%`}
              className={[
                'flex items-center justify-center h-9 md:h-8 px-2 min-w-[3.5rem] rounded-[var(--wb-radius-md)] transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wb-primary)] focus-visible:ring-offset-1',
                'text-[var(--wb-on-surface-variant)] hover:text-[var(--wb-on-surface)] hover:bg-[var(--wb-surface-container-low)]',
                'text-xs font-medium tabular-nums',
              ].join(' ')}
            >
              {displayPercent}%
            </button>
          }
        />
        <TooltipContent side="top">
          <span className="text-xs">Reset to 100%</span>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onClick={zoomIn}
              disabled={zoom >= MAX_ZOOM}
              aria-label="Zoom in"
              className={[
                'flex items-center justify-center w-9 h-9 md:w-8 md:h-8 rounded-[var(--wb-radius-md)] transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wb-primary)] focus-visible:ring-offset-1',
                'text-[var(--wb-on-surface-variant)] hover:text-[var(--wb-on-surface)] hover:bg-[var(--wb-surface-container-low)]',
                'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent',
              ].join(' ')}
            >
              <ZoomInIcon className="w-4 h-4" />
            </button>
          }
        />
        <TooltipContent side="top">
          <span className="text-xs">Zoom in</span>
        </TooltipContent>
      </Tooltip>

      <div className="w-px h-4 bg-[var(--wb-ghost-border)] mx-0.5" aria-hidden="true" />

      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onClick={fitToScreen}
              aria-label="Fit to screen"
              className={[
                'flex items-center justify-center w-9 h-9 md:w-8 md:h-8 rounded-[var(--wb-radius-md)] transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wb-primary)] focus-visible:ring-offset-1',
                'text-[var(--wb-on-surface-variant)] hover:text-[var(--wb-on-surface)] hover:bg-[var(--wb-surface-container-low)]',
              ].join(' ')}
            >
              <FitScreenIcon className="w-4 h-4" />
            </button>
          }
        />
        <TooltipContent side="top">
          <span className="text-xs">Fit to screen</span>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
