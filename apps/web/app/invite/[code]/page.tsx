import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { XCircleIcon, UsersIcon } from 'lucide-react'
import { requireAuth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { RoomModel } from '@/lib/models/room'
import { FONTS, GRADIENTS } from '@/lib/theme'

export const metadata: Metadata = {
  title: 'Join Board',
}

type JoinResult =
  | { ok: true; boardId: string }
  | { ok: false; reason: 'invalid_code' | 'room_full' | 'error'; message: string }

async function joinRoom(code: string, userId: string): Promise<JoinResult> {
  await connectDB()

  if (!code || typeof code !== 'string' || !code.trim()) {
    return { ok: false, reason: 'invalid_code', message: 'This invite link is invalid.' }
  }

  const room = await RoomModel.findOne({ code: code.trim() })
  if (!room) {
    return {
      ok: false,
      reason: 'invalid_code',
      message: 'This invite link is invalid or has expired.',
    }
  }

  const alreadyMember = room.members.some((m) => m.userId === userId)

  if (!alreadyMember) {
    if (room.members.length >= room.maxUsers) {
      return {
        ok: false,
        reason: 'room_full',
        message: 'This board has reached its maximum number of members.',
      }
    }

    room.members.push({ userId, permission: 'editor' })
    await room.save()
  }

  return { ok: true, boardId: room.boardId }
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const session = await requireAuth()

  const result = await joinRoom(code, session.user.userId)

  // Happy path — redirect straight to the board
  if (result.ok) {
    redirect(`/board/${result.boardId}`)
  }

  // Error states
  const isInvalidCode = result.reason === 'invalid_code'
  const isRoomFull = result.reason === 'room_full'

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--wb-surface, #f5f6f7)',
        padding: '24px',
        fontFamily: FONTS.inter,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          padding: '40px 32px',
          borderRadius: 'var(--wb-radius-lg, 0.5rem)',
          backgroundColor: 'var(--wb-surface-container-lowest, #ffffff)',
          boxShadow: 'var(--wb-shadow-ambient)',
          textAlign: 'center',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--wb-radius-full, 9999px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isRoomFull
              ? 'var(--wb-tertiary-alpha-12)'
              : 'var(--wb-error-alpha-08)',
          }}
        >
          {isRoomFull ? (
            <UsersIcon
              size={26}
              aria-hidden="true"
              style={{ color: 'var(--wb-tertiary)' }}
            />
          ) : (
            <XCircleIcon
              size={26}
              aria-hidden="true"
              style={{ color: 'var(--wb-error, #b41340)' }}
            />
          )}
        </div>

        {/* Heading */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 20,
              fontFamily: FONTS.manrope,
              fontWeight: 700,
              color: 'var(--wb-on-surface, #2c2f30)',
            }}
          >
            {isRoomFull ? 'Board is full' : 'Invalid invite link'}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              lineHeight: 1.6,
              color: 'var(--wb-on-surface-variant, #595c5d)',
            }}
          >
            {result.message}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          <Link
            href="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 38,
              borderRadius: 'var(--wb-radius-md, 0.375rem)',
              background: GRADIENTS.primary,
              color: 'var(--wb-on-primary-solid)',
              fontSize: 13,
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
