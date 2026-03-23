import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeftIcon, CrownIcon, PencilIcon, EyeIcon } from 'lucide-react'
import { requireAuth } from '@/lib/auth'
import { FONTS } from '@/lib/theme'
import { connectDB } from '@/lib/mongodb'
import { BoardModel } from '@/lib/models/board'
import { RoomModel } from '@/lib/models/room'
import { UserModel } from '@/lib/models'
import mongoose from 'mongoose'
import type { RoomPermission } from '@whiteboard/shared'

import { RenameBoardForm } from './rename-form'
import { InviteLinkSection } from './invite-link-section'
import { RemoveMemberButton } from './remove-member-button'
import { DeleteBoardDialog } from './delete-board-dialog'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  await connectDB()
  const board = await BoardModel.findById(id).lean()
  const title = board?.title ?? 'Board'
  return { title: `Settings — ${title}` }
}

interface MemberWithProfile {
  userId: string
  permission: RoomPermission
  name: string | null
  email: string | null
  image: string | null
}

async function getBoardData(id: string) {
  await connectDB()

  if (!mongoose.Types.ObjectId.isValid(id)) return null

  const board = await BoardModel.findById(id).lean()
  if (!board) return null

  const room = await RoomModel.findOne({ boardId: id }).lean()
  if (!room) return null

  const userIds = room.members.map((m) => m.userId)
  const users = await UserModel.find({
    _id: { $in: userIds.map((uid) => new mongoose.Types.ObjectId(uid)) },
  }).lean()

  const userMap = new Map(users.map((u) => [(u._id as mongoose.Types.ObjectId).toString(), u]))

  const members: MemberWithProfile[] = room.members.map((m) => {
    const user = userMap.get(m.userId)
    return {
      userId: m.userId,
      permission: m.permission as RoomPermission,
      name: user?.name ?? null,
      email: user?.email ?? null,
      image: user?.image ?? null,
    }
  })

  return {
    board: {
      id: (board._id as mongoose.Types.ObjectId).toString(),
      title: board.title,
      ownerId: board.ownerId,
      roomCode: board.roomCode,
    },
    members,
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PERMISSION_CONFIG: Record<
  RoomPermission,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  owner: {
    label: 'Owner',
    icon: <CrownIcon size={11} aria-hidden="true" />,
    color: 'var(--wb-on-tertiary-container)',
    bg: 'var(--wb-tertiary-container)',
  },
  editor: {
    label: 'Editor',
    icon: <PencilIcon size={11} aria-hidden="true" />,
    color: 'var(--wb-on-primary-container)',
    bg: 'var(--wb-primary-container)',
  },
  viewer: {
    label: 'Viewer',
    icon: <EyeIcon size={11} aria-hidden="true" />,
    color: 'var(--wb-on-surface-variant, #595c5d)',
    bg: 'var(--wb-surface-container, #e6e8ea)',
  },
}

function PermissionBadge({ permission }: { permission: RoomPermission }) {
  const cfg = PERMISSION_CONFIG[permission]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 'var(--wb-radius-full, 9999px)',
        backgroundColor: cfg.bg,
        color: cfg.color,
        fontSize: 11,
        fontFamily: FONTS.inter,
        fontWeight: 500,
      }}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  )
}

function MemberAvatar({ name, image }: { name: string | null; image: string | null }) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?'

  if (image) {
    return (
      <img
        src={image}
        alt={name ?? 'Member'}
        width={32}
        height={32}
        style={{
          width: 32,
          height: 32,
          borderRadius: 'var(--wb-radius-full, 9999px)',
          objectFit: 'cover',
          flexShrink: 0,
          backgroundColor: 'var(--wb-surface-container-high, #e0e3e4)',
        }}
      />
    )
  }

  return (
    <span
      aria-label={name ?? 'Member'}
      style={{
        width: 32,
        height: 32,
        borderRadius: 'var(--wb-radius-full, 9999px)',
        backgroundColor: 'var(--wb-surface-container-high, #e0e3e4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontFamily: FONTS.inter,
        fontWeight: 600,
        color: 'var(--wb-on-surface-variant, #595c5d)',
        flexShrink: 0,
      }}
    >
      {initials}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: '20px 24px',
        borderRadius: 'var(--wb-radius-lg, 0.5rem)',
        backgroundColor: 'var(--wb-surface-container-lowest, #ffffff)',
        boxShadow: 'var(--wb-shadow-contact)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <h2
          style={{
            margin: 0,
            fontSize: 15,
            fontFamily: FONTS.manrope,
            fontWeight: 700,
            color: 'var(--wb-on-surface, #2c2f30)',
          }}
        >
          {title}
        </h2>
        {description && (
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontFamily: FONTS.inter,
              color: 'var(--wb-on-surface-variant, #595c5d)',
            }}
          >
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function BoardSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await requireAuth()

  const data = await getBoardData(id)

  if (!data) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--wb-surface, #f5f6f7)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            padding: '40px 32px',
            borderRadius: 'var(--wb-radius-lg, 0.5rem)',
            backgroundColor: 'var(--wb-surface-container-lowest, #ffffff)',
            boxShadow: 'var(--wb-shadow-contact)',
          }}
        >
          <p
            style={{
              fontSize: 15,
              fontFamily: FONTS.inter,
              color: 'var(--wb-on-surface-variant, #595c5d)',
            }}
          >
            Board not found.
          </p>
          <Link
            href="/dashboard"
            style={{
              fontSize: 13,
              fontFamily: FONTS.inter,
              color: 'var(--wb-primary, #0c0bff)',
              textDecoration: 'underline',
            }}
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  const { board, members } = data
  const isOwner = board.ownerId === session.user.userId

  if (!isOwner) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--wb-surface, #f5f6f7)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            padding: '40px 32px',
            borderRadius: 'var(--wb-radius-lg, 0.5rem)',
            backgroundColor: 'var(--wb-surface-container-lowest, #ffffff)',
            boxShadow: 'var(--wb-shadow-contact)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: 15,
              fontFamily: FONTS.manrope,
              fontWeight: 700,
              color: 'var(--wb-on-surface, #2c2f30)',
            }}
          >
            Access denied
          </p>
          <p
            style={{
              fontSize: 13,
              fontFamily: FONTS.inter,
              color: 'var(--wb-on-surface-variant, #595c5d)',
            }}
          >
            Only the board owner can access settings.
          </p>
          <Link
            href={`/board/${id}`}
            style={{
              fontSize: 13,
              fontFamily: FONTS.inter,
              color: 'var(--wb-primary, #0c0bff)',
              textDecoration: 'underline',
            }}
          >
            Back to board
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: 'var(--wb-surface, #f5f6f7)',
        fontFamily: FONTS.inter,
      }}
    >
      {/* Top nav */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 24px',
          height: 52,
          backgroundColor: 'var(--wb-glass-bg)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--wb-ghost-border)',
        }}
      >
        <Link
          href={`/board/${id}`}
          aria-label="Back to board"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            color: 'var(--wb-on-surface-variant, #595c5d)',
            textDecoration: 'none',
          }}
        >
          <ArrowLeftIcon size={14} aria-hidden="true" />
          Back to board
        </Link>

        <span
          style={{
            color: 'var(--wb-outline-variant, #abadae)',
            fontSize: 13,
          }}
          aria-hidden="true"
        >
          /
        </span>

        <span
          style={{
            fontSize: 13,
            fontFamily: FONTS.manrope,
            fontWeight: 700,
            color: 'var(--wb-on-surface, #2c2f30)',
          }}
        >
          Settings
        </span>
      </div>

      {/* Page content */}
      <main
        style={{
          maxWidth: 640,
          margin: '0 auto',
          padding: '32px 24px 64px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Page title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 24,
              fontFamily: FONTS.manrope,
              fontWeight: 700,
              color: 'var(--wb-on-surface, #2c2f30)',
            }}
          >
            Board settings
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: 'var(--wb-on-surface-variant, #595c5d)',
            }}
          >
            Manage settings, members, and permissions for{' '}
            <strong style={{ color: 'var(--wb-on-surface, #2c2f30)' }}>{board.title}</strong>.
          </p>
        </div>

        {/* Board Info */}
        <Section
          title="Board info"
          description="Update the name of this board."
        >
          <RenameBoardForm boardId={board.id} currentTitle={board.title} />
        </Section>

        {/* Members */}
        <Section
          title="Members"
          description={`${members.length} member${members.length !== 1 ? 's' : ''} have access to this board.`}
        >
          <ul
            role="list"
            style={{
              margin: 0,
              padding: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {members.map((member) => (
              <li
                key={member.userId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 12px',
                  borderRadius: 'var(--wb-radius-md, 0.375rem)',
                  backgroundColor: 'var(--wb-surface-container-low, #eff1f2)',
                }}
              >
                <MemberAvatar name={member.name} image={member.image} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      fontWeight: 500,
                      color: 'var(--wb-on-surface, #2c2f30)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {member.name ?? member.email ?? 'Unknown user'}
                    {member.userId === session.user.userId && (
                      <span
                        style={{
                          marginLeft: 6,
                          fontSize: 11,
                          color: 'var(--wb-on-surface-variant, #595c5d)',
                        }}
                      >
                        (you)
                      </span>
                    )}
                  </p>
                  {member.email && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: 11,
                        color: 'var(--wb-on-surface-variant, #595c5d)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {member.email}
                    </p>
                  )}
                </div>

                <PermissionBadge permission={member.permission} />

                {member.permission !== 'owner' && (
                  <RemoveMemberButton
                    boardId={board.id}
                    userId={member.userId}
                    name={member.name}
                  />
                )}
              </li>
            ))}
          </ul>
        </Section>

        {/* Invite Link */}
        <Section
          title="Invite link"
          description="Share this link with others to give them editor access to this board."
        >
          <InviteLinkSection boardId={board.id} roomCode={board.roomCode} />
        </Section>

        {/* Danger Zone */}
        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            padding: '20px 24px',
            borderRadius: 'var(--wb-radius-lg, 0.5rem)',
            backgroundColor: 'var(--wb-surface-container-lowest, #ffffff)',
            border: '1px solid var(--wb-error-alpha-20)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 15,
                fontFamily: FONTS.manrope,
                fontWeight: 700,
                color: 'var(--wb-error, #b41340)',
              }}
            >
              Danger zone
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontFamily: FONTS.inter,
                color: 'var(--wb-on-surface-variant, #595c5d)',
              }}
            >
              Deleting the board is permanent and cannot be undone.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontFamily: FONTS.inter,
                color: 'var(--wb-on-surface, #2c2f30)',
              }}
            >
              Delete <strong>&ldquo;{board.title}&rdquo;</strong> and all its data.
            </p>
            <DeleteBoardDialog boardId={board.id} boardTitle={board.title} />
          </div>
        </section>
      </main>
    </div>
  )
}
