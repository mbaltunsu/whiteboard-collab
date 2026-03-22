'use client'

import { useCallback, useState } from 'react'
import type { WhiteboardElement } from '@whiteboard/shared'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ImageIcon, CodeIcon, DownloadIcon } from 'lucide-react'

type ExportFormat = 'png' | 'svg'
type ScaleFactor = 1 | 2

interface ExportDialogProps {
  elements: WhiteboardElement[]
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  isOpen: boolean
  onClose: () => void
}

const STICKY_COLOR_MAP: Record<string, string> = {
  yellow: '#f8a010',
  pink: '#f472b6',
  blue: '#60a5fa',
  green: '#4ade80',
  purple: '#a78bfa',
}

const GRID_DOT_COLOR = 'rgba(171, 173, 174, 0.3)'
const GRID_SPACING = 24

function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = GRID_DOT_COLOR
  for (let x = 0; x < width; x += GRID_SPACING) {
    for (let y = 0; y < height; y += GRID_SPACING) {
      ctx.beginPath()
      ctx.arc(x, y, 1, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function getElementsBoundingBox(elements: WhiteboardElement[]) {
  if (elements.length === 0) return { x: 0, y: 0, w: 800, h: 600 }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const el of elements) {
    const x1 = el.position.x
    const y1 = el.position.y
    const x2 = x1 + el.size.w
    const y2 = y1 + el.size.h
    if (x1 < minX) minX = x1
    if (y1 < minY) minY = y1
    if (x2 > maxX) maxX = x2
    if (y2 > maxY) maxY = y2
  }

  const pad = 40
  return { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 }
}

function renderElementsToOffscreenCanvas(
  elements: WhiteboardElement[],
  scaleFactor: ScaleFactor,
  includeGrid: boolean
): HTMLCanvasElement {
  const bounds = getElementsBoundingBox(elements)
  const canvas = document.createElement('canvas')
  canvas.width = bounds.w * scaleFactor
  canvas.height = bounds.h * scaleFactor

  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  ctx.scale(scaleFactor, scaleFactor)

  // Background
  ctx.fillStyle = '#f5f6f7'
  ctx.fillRect(0, 0, bounds.w, bounds.h)

  if (includeGrid) {
    drawGrid(ctx, bounds.w, bounds.h)
  }

  // Translate so element positions are relative to bounding box
  ctx.save()
  ctx.translate(-bounds.x, -bounds.y)

  for (const el of elements) {
    const { x, y } = el.position
    const { w, h } = el.size

    ctx.save()
    ctx.globalAlpha = el.style.opacity ?? 1

    switch (el.type) {
      case 'sticky': {
        const bg = STICKY_COLOR_MAP[el.data.color] ?? '#f8a010'
        ctx.fillStyle = bg
        ctx.shadowColor = 'rgba(12, 15, 16, 0.12)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetY = 2
        ctx.beginPath()
        ctx.roundRect(x, y, w, h, 6)
        ctx.fill()
        ctx.shadowColor = 'transparent'
        ctx.fillStyle = '#2c2f30'
        ctx.font = `${el.data.fontSize ?? 14}px Inter, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const maxWidth = w - 16
        ctx.fillText(el.data.text, x + w / 2, y + h / 2, maxWidth)
        break
      }
      case 'shape': {
        ctx.strokeStyle = el.style.color
        ctx.lineWidth = el.style.strokeWidth
        if (el.data.fill) {
          ctx.fillStyle = el.data.fill
        }
        switch (el.data.shapeType) {
          case 'rectangle':
            if (el.data.fill) ctx.fillRect(x, y, w, h)
            ctx.strokeRect(x, y, w, h)
            break
          case 'ellipse':
            ctx.beginPath()
            ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2)
            if (el.data.fill) ctx.fill()
            ctx.stroke()
            break
          case 'diamond': {
            ctx.beginPath()
            ctx.moveTo(x + w / 2, y)
            ctx.lineTo(x + w, y + h / 2)
            ctx.lineTo(x + w / 2, y + h)
            ctx.lineTo(x, y + h / 2)
            ctx.closePath()
            if (el.data.fill) ctx.fill()
            ctx.stroke()
            break
          }
          case 'line':
          case 'arrow':
            ctx.beginPath()
            ctx.moveTo(x, y + h / 2)
            ctx.lineTo(x + w, y + h / 2)
            ctx.stroke()
            if (el.data.shapeType === 'arrow') {
              const aw = 10
              ctx.beginPath()
              ctx.moveTo(x + w, y + h / 2)
              ctx.lineTo(x + w - aw, y + h / 2 - aw / 2)
              ctx.lineTo(x + w - aw, y + h / 2 + aw / 2)
              ctx.closePath()
              ctx.fillStyle = el.style.color
              ctx.fill()
            }
            break
        }
        break
      }
      case 'freehand': {
        if (el.data.points.length < 2) break
        ctx.strokeStyle = el.style.color
        ctx.lineWidth = el.style.strokeWidth
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        const [first] = el.data.points
        ctx.moveTo(first[0], first[1])
        for (let i = 1; i < el.data.points.length; i++) {
          ctx.lineTo(el.data.points[i][0], el.data.points[i][1])
        }
        ctx.stroke()
        break
      }
      case 'comment': {
        ctx.fillStyle = '#0c0bff'
        ctx.beginPath()
        ctx.arc(x + w / 2, y + h / 2, 10, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 11px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('!', x + w / 2, y + h / 2)
        break
      }
    }

    ctx.restore()
  }

  ctx.restore()
  return canvas
}

function buildSVG(elements: WhiteboardElement[], includeGrid: boolean): string {
  const bounds = getElementsBoundingBox(elements)
  const parts: string[] = []

  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bounds.x} ${bounds.y} ${bounds.w} ${bounds.h}" width="${bounds.w}" height="${bounds.h}">`
  )

  // Background rect
  parts.push(`<rect x="${bounds.x}" y="${bounds.y}" width="${bounds.w}" height="${bounds.h}" fill="#f5f6f7"/>`)

  if (includeGrid) {
    parts.push(`<defs><pattern id="grid" width="${GRID_SPACING}" height="${GRID_SPACING}" patternUnits="userSpaceOnUse" patternTransform="translate(${bounds.x},${bounds.y})"><circle cx="0" cy="0" r="1" fill="${GRID_DOT_COLOR}"/></pattern></defs>`)
    parts.push(`<rect x="${bounds.x}" y="${bounds.y}" width="${bounds.w}" height="${bounds.h}" fill="url(#grid)"/>`)
  }

  for (const el of elements) {
    const { x, y } = el.position
    const { w, h } = el.size
    const opacity = el.style.opacity ?? 1

    switch (el.type) {
      case 'sticky': {
        const bg = STICKY_COLOR_MAP[el.data.color] ?? '#f8a010'
        parts.push(
          `<g opacity="${opacity}">` +
          `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${bg}" filter="drop-shadow(0 2px 2px rgba(0,0,0,.12))"/>` +
          `<text x="${x + w / 2}" y="${y + h / 2}" text-anchor="middle" dominant-baseline="middle" font-family="Inter, sans-serif" font-size="${el.data.fontSize ?? 14}" fill="#2c2f30">${escapeXml(el.data.text)}</text>` +
          `</g>`
        )
        break
      }
      case 'shape': {
        const fill = el.data.fill ?? 'none'
        const stroke = el.style.color
        const sw = el.style.strokeWidth
        const g = `<g opacity="${opacity}">`
        switch (el.data.shapeType) {
          case 'rectangle':
            parts.push(`${g}<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/></g>`)
            break
          case 'ellipse':
            parts.push(`${g}<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2}" ry="${h / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/></g>`)
            break
          case 'diamond':
            parts.push(`${g}<polygon points="${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/></g>`)
            break
          case 'line':
            parts.push(`${g}<line x1="${x}" y1="${y + h / 2}" x2="${x + w}" y2="${y + h / 2}" stroke="${stroke}" stroke-width="${sw}"/></g>`)
            break
          case 'arrow':
            parts.push(
              `${g}<line x1="${x}" y1="${y + h / 2}" x2="${x + w - 10}" y2="${y + h / 2}" stroke="${stroke}" stroke-width="${sw}"/>` +
              `<polygon points="${x + w},${y + h / 2} ${x + w - 10},${y + h / 2 - 5} ${x + w - 10},${y + h / 2 + 5}" fill="${stroke}"/></g>`
            )
            break
        }
        break
      }
      case 'freehand': {
        if (el.data.points.length < 2) break
        const d = el.data.points
          .map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt[0]},${pt[1]}`)
          .join(' ')
        parts.push(
          `<path d="${d}" fill="none" stroke="${el.style.color}" stroke-width="${el.style.strokeWidth}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}"/>`
        )
        break
      }
      case 'comment': {
        parts.push(
          `<g opacity="${opacity}">` +
          `<circle cx="${x + w / 2}" cy="${y + h / 2}" r="10" fill="#0c0bff"/>` +
          `<text x="${x + w / 2}" y="${y + h / 2}" text-anchor="middle" dominant-baseline="middle" font-family="Inter, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">!</text>` +
          `</g>`
        )
        break
      }
    }
  }

  parts.push('</svg>')
  return parts.join('\n')
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}

export function ExportDialog({ elements, canvasRef, isOpen, onClose }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('png')
  const [scale, setScale] = useState<ScaleFactor>(1)
  const [includeGrid, setIncludeGrid] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = useCallback(async () => {
    setIsExporting(true)

    try {
      if (format === 'png') {
        // Prefer a live canvas snapshot; fall back to offscreen render
        if (canvasRef.current && elements.length === 0) {
          const dataUrl = canvasRef.current.toDataURL('image/png')
          triggerDownload(dataUrl, 'whiteboard.png')
        } else {
          const offscreen = renderElementsToOffscreenCanvas(elements, scale, includeGrid)
          const dataUrl = offscreen.toDataURL('image/png')
          triggerDownload(dataUrl, 'whiteboard.png')
        }
      } else {
        const svg = buildSVG(elements, includeGrid)
        const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        triggerDownload(url, 'whiteboard.svg')
        URL.revokeObjectURL(url)
      }
    } finally {
      setIsExporting(false)
      onClose()
    }
  }, [format, scale, includeGrid, elements, canvasRef, onClose])

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => { if (!open) onClose() }}>
      <DialogContent
        className="sm:max-w-sm"
        style={{
          background: 'var(--wb-surface-container-lowest, #ffffff)',
          borderRadius: 'var(--wb-radius-xl, 0.75rem)',
          boxShadow: '0 12px 32px -4px rgba(12, 15, 16, 0.08)',
          border: '1px solid rgba(171, 173, 174, 0.15)',
        }}
      >
        <DialogHeader>
          <DialogTitle
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 700,
              color: 'var(--wb-on-surface, #2c2f30)',
            }}
          >
            Export Board
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Format selection */}
          <div className="flex flex-col gap-2">
            <span
              className="text-xs font-medium"
              style={{ color: 'var(--wb-on-surface-variant, #595c5d)' }}
            >
              Format
            </span>
            <div className="flex gap-2">
              <FormatButton
                active={format === 'png'}
                onClick={() => setFormat('png')}
                icon={<ImageIcon className="w-4 h-4" />}
                label="PNG"
              />
              <FormatButton
                active={format === 'svg'}
                onClick={() => setFormat('svg')}
                icon={<CodeIcon className="w-4 h-4" />}
                label="SVG"
              />
            </div>
          </div>

          {/* Scale factor — only for PNG */}
          {format === 'png' && (
            <div className="flex flex-col gap-2">
              <span
                className="text-xs font-medium"
                style={{ color: 'var(--wb-on-surface-variant, #595c5d)' }}
              >
                Scale
              </span>
              <div className="flex gap-2">
                <ScaleButton active={scale === 1} onClick={() => setScale(1)} label="1x" />
                <ScaleButton active={scale === 2} onClick={() => setScale(2)} label="2x" />
              </div>
            </div>
          )}

          {/* Grid toggle */}
          <label
            className="flex items-center gap-2 cursor-pointer select-none"
            style={{ color: 'var(--wb-on-surface, #2c2f30)', fontSize: '0.875rem' }}
          >
            <input
              type="checkbox"
              checked={includeGrid}
              onChange={(e) => setIncludeGrid(e.target.checked)}
              className="w-4 h-4 rounded accent-[var(--wb-primary,#0c0bff)]"
              style={{ accentColor: 'var(--wb-primary, #0c0bff)' }}
            />
            Include background grid
          </label>
        </div>

        <DialogFooter>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            style={{
              background: 'linear-gradient(135deg, #0c0bff, #9097ff)',
              color: '#ffffff',
              borderRadius: 'var(--wb-radius-md, 0.375rem)',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
            }}
          >
            <DownloadIcon className="w-4 h-4 mr-1.5" />
            {isExporting ? 'Exporting…' : `Download ${format.toUpperCase()}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface FormatButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}

function FormatButton({ active, onClick, icon, label }: FormatButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-2 rounded-[var(--wb-radius-md,0.375rem)] text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wb-primary,#0c0bff)]"
      style={{
        background: active
          ? 'rgba(144, 151, 255, 0.2)'
          : 'var(--wb-surface-container-low, #eff1f2)',
        color: active
          ? 'var(--wb-primary, #0c0bff)'
          : 'var(--wb-on-surface-variant, #595c5d)',
        border: active
          ? '1px solid rgba(12, 11, 255, 0.25)'
          : '1px solid rgba(171, 173, 174, 0.15)',
      }}
      aria-pressed={active}
    >
      {icon}
      {label}
    </button>
  )
}

interface ScaleButtonProps {
  active: boolean
  onClick: () => void
  label: string
}

function ScaleButton({ active, onClick, label }: ScaleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-2 rounded-[var(--wb-radius-md,0.375rem)] text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wb-primary,#0c0bff)]"
      style={{
        background: active
          ? 'rgba(144, 151, 255, 0.2)'
          : 'var(--wb-surface-container-low, #eff1f2)',
        color: active
          ? 'var(--wb-primary, #0c0bff)'
          : 'var(--wb-on-surface-variant, #595c5d)',
        border: active
          ? '1px solid rgba(12, 11, 255, 0.25)'
          : '1px solid rgba(171, 173, 174, 0.15)',
      }}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}
