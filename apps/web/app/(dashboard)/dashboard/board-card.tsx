'use client'

import Link from 'next/link'
import { Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  ]
  const index = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % gradients.length
  return gradients[index]
}

export function BoardCard({
  id,
  title,
  thumbnailUrl,
  updatedAt,
  memberCount,
  isOwner,
}: BoardCardProps) {
  const buttonLabel = isOwner ? 'Resume' : 'Join Board'

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-xl transition-all duration-200"
      style={{
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 8px -2px rgba(12, 15, 16, 0.06)',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLElement).style.boxShadow =
          '0 12px 32px -4px rgba(12, 15, 16, 0.08)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.boxShadow =
          '0 2px 8px -2px rgba(12, 15, 16, 0.06)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
      }}
    >
      {/* Thumbnail */}
      <div className="relative h-40 w-full overflow-hidden">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
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
            style={{ color: '#2c2f30', fontFamily: 'Manrope, var(--font-manrope, sans-serif)' }}
          >
            {title}
          </h3>
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5" style={{ color: '#595c5d' }}>
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs">{memberCount}</span>
          </div>
          <span className="text-xs" style={{ color: '#757778' }}>
            Modified {formatRelativeTime(updatedAt)}
          </span>
        </div>

        {/* CTA */}
        <Link href={`/board/${id}`} className="mt-1 block">
          <Button
            className="w-full text-sm font-medium text-white"
            style={{
              background: 'linear-gradient(135deg, #0c0bff, #9097ff)',
              borderRadius: '0.375rem',
              border: 'none',
              height: '2.25rem',
            }}
          >
            {buttonLabel}
          </Button>
        </Link>
      </div>
    </article>
  )
}
