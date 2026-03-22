import { requireAuth } from '@/lib/auth'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Board',
  description: 'Collaborative whiteboard canvas',
}

export default async function BoardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        backgroundColor: 'var(--wb-surface, #f5f6f7)',
      }}
    >
      {children}
    </div>
  )
}
