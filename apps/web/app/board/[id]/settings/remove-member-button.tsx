'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { UserMinusIcon } from 'lucide-react'
import { FONTS } from '@/lib/theme'
import { toast } from 'sonner'

interface RemoveMemberButtonProps {
  boardId: string
  userId: string
  name: string | null
}

export function RemoveMemberButton({ boardId, userId, name }: RemoveMemberButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleRemove() {
    if (!window.confirm(`Remove ${name ?? 'this member'} from the board?`)) return
    startTransition(async () => {
      const res = await fetch(`/api/boards/${boardId}/members/${userId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        toast.error(data.error ?? 'Failed to remove member. Please try again.')
        return
      }

      toast.success(`${name ?? 'Member'} removed from board.`)
      router.refresh()
    })
  }

  return (
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
        border: '1px solid var(--wb-ghost-border)',
        color: 'var(--wb-error, #b41340)',
        cursor: isPending ? 'not-allowed' : 'pointer',
        opacity: isPending ? 0.5 : 1,
        transition: 'background 120ms',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (!isPending) {
          ;(e.currentTarget as HTMLButtonElement).style.background =
            'var(--wb-error-alpha-08)'
        }
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
      }}
    >
      <UserMinusIcon size={14} aria-hidden="true" />
    </button>
  )
}
