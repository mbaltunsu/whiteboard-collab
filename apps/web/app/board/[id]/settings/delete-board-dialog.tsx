'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TrashIcon } from 'lucide-react'

interface DeleteBoardDialogProps {
  boardId: string
  boardTitle: string
}

export function DeleteBoardDialog({ boardId, boardTitle }: DeleteBoardDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      const res = await fetch(`/api/boards/${boardId}`, { method: 'DELETE' })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setError(data.error ?? 'Failed to delete board')
        return
      }

      setOpen(false)
      router.replace('/dashboard')
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: 36,
              padding: '0 16px',
              borderRadius: 'var(--wb-radius-md, 0.375rem)',
              backgroundColor: 'rgba(180, 19, 64, 0.08)',
              border: '1px solid rgba(180, 19, 64, 0.2)',
              color: 'var(--wb-error, #b41340)',
              fontSize: 13,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          />
        }
      >
        <TrashIcon size={14} aria-hidden="true" />
        Delete board
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete board</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{' '}
            <strong>&ldquo;{boardTitle}&rdquo;</strong>? This will permanently remove the
            board, all its elements, and the room. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p
            role="alert"
            style={{
              fontSize: 13,
              fontFamily: 'Inter, sans-serif',
              color: 'var(--wb-error, #b41340)',
              padding: '8px 12px',
              borderRadius: 'var(--wb-radius-md, 0.375rem)',
              backgroundColor: 'rgba(180, 19, 64, 0.06)',
            }}
          >
            {error}
          </p>
        )}

        <DialogFooter showCloseButton={!isPending}>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              height: 34,
              padding: '0 16px',
              borderRadius: 'var(--wb-radius-md, 0.375rem)',
              backgroundColor: 'var(--wb-error, #b41340)',
              border: 'none',
              color: '#fff',
              fontSize: 13,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              cursor: isPending ? 'not-allowed' : 'pointer',
              opacity: isPending ? 0.6 : 1,
            }}
          >
            <TrashIcon size={13} aria-hidden="true" />
            {isPending ? 'Deleting...' : 'Yes, delete'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
