'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Loader2 } from 'lucide-react'
import { FONTS, GRADIENTS, THUMBNAIL_GRADIENTS } from '@/lib/theme'

interface BoardCardProps {
  id: string
  title: string
  thumbnailUrl: string | null
  updatedAt: string
  memberCount: number
  isOwner: boolean
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffDay > 30) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
  if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
  if (diffHr > 0) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`
  if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`
  return 'just now'
}

// Deterministic gradient from board id for placeholder thumbnails
function getThumbnailGradient(id: string): string {
  const index = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % THUMBNAIL_GRADIENTS.length
  return THUMBNAIL_GRADIENTS[index]
}

export function BoardCard({
  id,
  title,
  thumbnailUrl,
  updatedAt,
  memberCount,
  isOwner,
}: BoardCardProps) {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  const buttonLabel = isOwner ? 'Resume' : 'Join Board'

  function handleNavigate() {
    setIsNavigating(true)
    router.push(`/board/${id}`)
  }

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-xl transition-all duration-200"
      style={{
        backgroundColor: 'var(--wb-surface-container-lowest)',
        boxShadow: 'var(--wb-shadow-contact)',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--wb-shadow-ambient)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--wb-shadow-contact)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
      }}
    >
      {/* Thumbnail */}
      <div className="relative h-40 w-full overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={`${title} thumbnail`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{ background: getThumbnailGradient(id) }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1">
          <h3
            className="line-clamp-2 text-sm font-semibold leading-snug"
            style={{ color: 'var(--wb-on-surface)', fontFamily: FONTS.manrope }}
          >
            {title}
          </h3>
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5" style={{ color: 'var(--wb-on-surface-variant)' }}>
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs">{memberCount}</span>
          </div>
          <span className="text-xs" style={{ color: 'var(--wb-outline)' }}>
            Modified {formatRelativeTime(updatedAt)}
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={handleNavigate}
          disabled={isNavigating}
          className="mt-1 inline-flex w-full items-center justify-center gap-2 text-sm font-medium text-white transition-opacity disabled:opacity-70"
          style={{
            background: GRADIENTS.primary,
            borderRadius: '0.375rem',
            border: 'none',
            height: '2.25rem',
          }}
        >
          {isNavigating ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {buttonLabel}
            </>
          ) : (
            buttonLabel
          )}
        </button>
      </div>
    </article>
  )
}
