'use client'

import { useState, useTransition } from 'react'
import { LinkIcon, CopyIcon, CheckIcon, RefreshCwIcon } from 'lucide-react'

interface InviteLinkSectionProps {
  boardId: string
  roomCode: string
}

export function InviteLinkSection({ boardId, roomCode: initialCode }: InviteLinkSectionProps) {
  const [roomCode, setRoomCode] = useState(initialCode)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const inviteUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/invite/${roomCode}`
      : `/invite/${roomCode}`

  function handleCopy() {
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/invite/${roomCode}`
        : `/invite/${roomCode}`

    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {
      setError('Could not copy to clipboard')
    })
  }

  function handleRegenerate() {
    setError(null)
    startTransition(async () => {
      const res = await fetch(`/api/boards/${boardId}/invite`, { method: 'POST' })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setError(data.error ?? 'Failed to get invite link')
        return
      }
      const data = (await res.json()) as { roomCode: string }
      setRoomCode(data.roomCode)
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Link display */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          borderRadius: 'var(--wb-radius-md, 0.375rem)',
          backgroundColor: 'var(--wb-surface-container-highest, #dadddf)',
        }}
      >
        <LinkIcon
          size={14}
          aria-hidden="true"
          style={{ color: 'var(--wb-on-surface-variant, #595c5d)', flexShrink: 0 }}
        />
        <span
          style={{
            flex: 1,
            fontSize: 13,
            fontFamily: 'Inter, sans-serif',
            color: 'var(--wb-on-surface, #2c2f30)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={inviteUrl}
        >
          /invite/{roomCode}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            height: 34,
            padding: '0 14px',
            borderRadius: 'var(--wb-radius-md, 0.375rem)',
            background: 'linear-gradient(135deg, #0c0bff, #9097ff)',
            border: 'none',
            color: '#fff',
            fontSize: 13,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {copied ? <CheckIcon size={13} aria-hidden="true" /> : <CopyIcon size={13} aria-hidden="true" />}
          {copied ? 'Copied!' : 'Copy link'}
        </button>

        <button
          type="button"
          onClick={handleRegenerate}
          disabled={isPending}
          aria-label="Refresh invite link"
          title="Refresh invite link"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 34,
            height: 34,
            borderRadius: 'var(--wb-radius-md, 0.375rem)',
            backgroundColor: 'var(--wb-surface-container, #e6e8ea)',
            border: '1px solid rgba(171, 173, 174, 0.15)',
            color: 'var(--wb-on-surface-variant, #595c5d)',
            cursor: isPending ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.5 : 1,
          }}
        >
          <RefreshCwIcon
            size={14}
            aria-hidden="true"
            style={{ animation: isPending ? 'wb-spin 0.8s linear infinite' : undefined }}
          />
        </button>
      </div>

      {error && (
        <p
          role="alert"
          style={{
            fontSize: 13,
            fontFamily: 'Inter, sans-serif',
            color: 'var(--wb-error, #b41340)',
          }}
        >
          {error}
        </p>
      )}
    </div>
  )
}
