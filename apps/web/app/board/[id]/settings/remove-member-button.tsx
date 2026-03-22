'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { UserMinusIcon } from 'lucide-react'

interface RemoveMemberButtonProps {
  boardId: string
  userId: string
  name: string | null
}

export function RemoveMemberButton({ boardId, userId, name }: RemoveMemberButtonProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleRemove() {
    if (!window.confirm(`Remove ${name ?? 'this member'} from the board?`)) return
    setError(null)
    startTransition(async () => {
      const res = await fetch(`/api/boards/${boardId}/members/${userId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setError(data.error ?? 'Failed to remove member')
        return
      }

      router.refresh()
    })
  }

  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button
        type="button"
        onClick={handleRemove}
        disabled={isPending}
        aria-label={`Remove ${name ?? 'member'} from board`}
        title={`Remove ${name ?? 'member'}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: 'var(--wb-radius-md, 0.375rem)',
          background: 'transparent',
          border: '1px solid rgba(171, 173, 174, 0.15)',
          color: 'var(--wb-error, #b41340)',
          cursor: isPending ? 'not-allowed' : 'pointer',
          opacity: isPending ? 0.5 : 1,
          transition: 'background 120ms',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          if (!isPending) {
            ;(e.currentTarget as HTMLButtonElement).style.background =
              'rgba(180, 19, 64, 0.08)'
          }
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
        }}
      >
        <UserMinusIcon size={14} aria-hidden="true" />
      </button>
      {error && (
        <span
          role="alert"
          style={{
            fontSize: 11,
            fontFamily: 'Inter, sans-serif',
            color: 'var(--wb-error, #b41340)',
          }}
        >
          {error}
        </span>
      )}
    </span>
  )
}
