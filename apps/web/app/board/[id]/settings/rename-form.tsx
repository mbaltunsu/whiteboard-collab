'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckIcon } from 'lucide-react'
import { FONTS, GRADIENTS } from '@/lib/theme'
import { toast } from 'sonner'

interface RenameBoardFormProps {
  boardId: string
  currentTitle: string
}

export function RenameBoardForm({ boardId, currentTitle }: RenameBoardFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(currentTitle)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  const isDirty = title.trim() !== currentTitle

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !isDirty) return
    setSaved(false)

    startTransition(async () => {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        toast.error(data.error ?? 'Failed to rename board. Please try again.')
        return
      }

      toast.success('Board renamed!')
      setSaved(true)
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <Input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            setSaved(false)
          }}
          placeholder="Board name"
          maxLength={100}
          aria-label="Board name"
          style={{
            flex: 1,
            height: 36,
            backgroundColor: 'var(--wb-surface-container-highest, #dadddf)',
            border: 'none',
            borderRadius: 'var(--wb-radius-md, 0.375rem)',
            padding: '0 12px',
            fontSize: 14,
            fontFamily: FONTS.inter,
            color: 'var(--wb-on-surface, #2c2f30)',
          }}
        />
        <Button
          type="submit"
          disabled={isPending || !isDirty || !title.trim()}
          style={{
            height: 36,
            padding: '0 16px',
            borderRadius: 'var(--wb-radius-md, 0.375rem)',
            background: isDirty && title.trim()
              ? GRADIENTS.primary
              : 'var(--wb-surface-container, #e6e8ea)',
            border: 'none',
            color: isDirty && title.trim() ? 'var(--wb-on-primary-solid)' : 'var(--wb-on-surface-variant, #595c5d)',
            fontSize: 13,
            fontFamily: FONTS.inter,
            fontWeight: 500,
            cursor: isPending || !isDirty || !title.trim() ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {saved ? <CheckIcon size={14} aria-hidden="true" /> : null}
          {isPending ? 'Saving...' : saved ? 'Saved' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
