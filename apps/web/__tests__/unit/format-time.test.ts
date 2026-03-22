import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Extracted copy of formatRelativeTime from apps/web/app/(dashboard)/dashboard/board-card.tsx
// (the function is not exported from the source file, so we mirror it here for testing)
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

describe('formatRelativeTime', () => {
  const NOW = new Date('2024-06-15T12:00:00Z').getTime()

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "just now" for a timestamp less than 1 minute ago', () => {
    const recent = new Date(NOW - 30 * 1000).toISOString()
    expect(formatRelativeTime(recent)).toBe('just now')
  })

  it('returns "just now" for an exact-now timestamp', () => {
    const exact = new Date(NOW).toISOString()
    expect(formatRelativeTime(exact)).toBe('just now')
  })

  it('returns "5 minutes ago" for a timestamp 5 minutes ago', () => {
    const fiveMinsAgo = new Date(NOW - 5 * 60 * 1000).toISOString()
    expect(formatRelativeTime(fiveMinsAgo)).toBe('5 minutes ago')
  })

  it('returns "1 minute ago" (singular) for exactly 1 minute ago', () => {
    const oneMinAgo = new Date(NOW - 60 * 1000).toISOString()
    expect(formatRelativeTime(oneMinAgo)).toBe('1 minute ago')
  })

  it('returns "2 hours ago" for a timestamp 2 hours ago', () => {
    const twoHrsAgo = new Date(NOW - 2 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeTime(twoHrsAgo)).toBe('2 hours ago')
  })

  it('returns "1 hour ago" (singular) for exactly 1 hour ago', () => {
    const oneHrAgo = new Date(NOW - 60 * 60 * 1000).toISOString()
    expect(formatRelativeTime(oneHrAgo)).toBe('1 hour ago')
  })

  it('returns "3 days ago" for a timestamp 3 days ago', () => {
    const threeDaysAgo = new Date(NOW - 3 * 24 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeTime(threeDaysAgo)).toBe('3 days ago')
  })

  it('returns "1 day ago" (singular) for exactly 1 day ago', () => {
    const oneDayAgo = new Date(NOW - 24 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeTime(oneDayAgo)).toBe('1 day ago')
  })

  it('returns a formatted date string for timestamps older than 30 days', () => {
    const oldDate = new Date('2024-01-05T00:00:00Z').toISOString()
    const result = formatRelativeTime(oldDate)
    expect(result).toMatch(/Jan 5, 2024/)
  })

  it('returns a formatted date string for 31 days ago', () => {
    const thirtyOneDaysAgo = new Date(NOW - 31 * 24 * 60 * 60 * 1000).toISOString()
    const result = formatRelativeTime(thirtyOneDaysAgo)
    // Should be a date string, not a relative phrase
    expect(result).not.toContain('ago')
    expect(result).not.toBe('just now')
  })
})
