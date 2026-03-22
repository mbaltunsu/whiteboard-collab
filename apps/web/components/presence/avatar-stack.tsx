"use client"

import Image from "next/image"
import type { PresenceState } from "@whiteboard/shared"
import { FONTS } from "@/lib/theme"

const MAX_VISIBLE = 4

interface AvatarStackProps {
  users: PresenceState[]
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

interface AvatarProps {
  user: PresenceState
  size?: number
}

function Avatar({ user, size = 32 }: AvatarProps) {
  const borderStyle = {
    width: size,
    height: size,
    borderRadius: "50%",
    border: `2px solid ${user.color}`,
    overflow: "hidden" as const,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0 as const,
    background: user.color,
    color: 'var(--wb-on-primary-solid)',
    fontSize: size * 0.375,
    fontFamily: FONTS.inter,
    fontWeight: 600,
    userSelect: "none" as const,
  }

  if (user.avatar) {
    return (
      <div
        style={borderStyle}
        title={user.name}
        aria-label={user.name}
      >
        <Image
          src={user.avatar}
          alt={user.name}
          width={size}
          height={size}
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
          unoptimized
        />
      </div>
    )
  }

  return (
    <div style={borderStyle} title={user.name} aria-label={user.name}>
      {getInitials(user.name)}
    </div>
  )
}

export function AvatarStack({ users }: AvatarStackProps) {
  if (users.length === 0) return null

  const visible = users.slice(0, MAX_VISIBLE)
  const overflow = users.length - MAX_VISIBLE

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "row-reverse",
      }}
      aria-label={`${users.length} user${users.length !== 1 ? "s" : ""} connected`}
    >
      {overflow > 0 && (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: '2px solid var(--wb-surface-container-high)',
            background: 'var(--wb-surface-container-low)',
            color: 'var(--wb-on-surface-variant)',
            fontSize: 11,
            fontFamily: FONTS.inter,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: -8,
            flexShrink: 0,
            userSelect: "none",
          }}
          aria-label={`${overflow} more users`}
        >
          +{overflow}
        </div>
      )}
      {visible.map((user, index) => (
        <div
          key={user.userId}
          style={{
            marginLeft: index < visible.length - 1 ? -8 : 0,
            zIndex: visible.length - index,
          }}
        >
          <Avatar user={user} />
        </div>
      ))}
    </div>
  )
}
