'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface CreateBoardResponse {
  id: string
  title: string
}

export function CreateBoardDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleOpenChange(next: boolean) {
    if (!next) {
      setTitle('')
      setDescription('')
      setError(null)
    }
    setOpen(next)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const trimmed = title.trim()
    if (!trimmed) {
      setError('Board title is required.')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/boards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: trimmed }),
        })

        if (!res.ok) {
          const data = (await res.json()) as { error?: string }
          setError(data.error ?? 'Failed to create board.')
          return
        }

        const board = (await res.json()) as CreateBoardResponse
        setOpen(false)
        router.push(`/board/${board.id}`)
      } catch {
        setError('Something went wrong. Please try again.')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c0bff]/50"
          style={{ background: 'linear-gradient(135deg, #0c0bff, #9097ff)' }}
        >
          <Plus className="h-4 w-4" />
          Create New Room
        </button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-md"
        style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem' }}
      >
        <DialogHeader>
          <DialogTitle
            className="text-base font-bold"
            style={{ color: '#2c2f30', fontFamily: 'Manrope, sans-serif' }}
          >
            Create a new room
          </DialogTitle>
          <DialogDescription style={{ color: '#595c5d' }}>
            Give your board a name to get started.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          {/* Title input */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="board-title"
              className="text-xs font-medium"
              style={{ color: '#595c5d' }}
            >
              Board title
            </label>
            <Input
              id="board-title"
              placeholder="e.g. Project Alpha Brainstorm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              required
              disabled={isPending}
              style={{
                backgroundColor: '#dadddf',
                border: 'none',
                borderRadius: '0.375rem 0.375rem 0.125rem 0.125rem',
                color: '#2c2f30',
              }}
            />
          </div>

          {/* Description input (optional) */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="board-description"
              className="text-xs font-medium"
              style={{ color: '#595c5d' }}
            >
              Description{' '}
              <span className="font-normal" style={{ color: '#757778' }}>
                (optional)
              </span>
            </label>
            <Input
              id="board-description"
              placeholder="What's this board for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              disabled={isPending}
              style={{
                backgroundColor: '#dadddf',
                border: 'none',
                borderRadius: '0.375rem 0.375rem 0.125rem 0.125rem',
                color: '#2c2f30',
              }}
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-xs" style={{ color: '#b41340' }}>
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
              className="inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#eff1f2', color: '#595c5d' }}
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={isPending || !title.trim()}
              className="h-9 px-5 text-sm font-semibold text-white disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #0c0bff, #9097ff)',
                border: 'none',
                borderRadius: '0.375rem',
              }}
            >
              {isPending ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
