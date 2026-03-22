"use client"

import { FONTS } from "@/lib/theme"

interface RemoteCursorProps {
  name: string
  color: string
  x: number
  y: number
}

export function RemoteCursor({ name, color, x, y }: RemoteCursorProps) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        transform: `translate(${x}px, ${y}px)`,
        transition: "transform 60ms linear",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <path
          d="M3 2L17 10L10 12L7 18L3 2Z"
          fill={color}
          stroke="var(--wb-on-primary-solid)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <span
        style={{
          display: "inline-block",
          marginTop: "2px",
          marginLeft: "4px",
          padding: "2px 7px",
          borderRadius: "9999px",
          background: color,
          color: 'var(--wb-on-primary-solid)',
          fontSize: "11px",
          fontFamily: FONTS.inter,
          fontWeight: 500,
          lineHeight: "16px",
          whiteSpace: "nowrap",
          border: '1px solid var(--wb-cursor-label-pill-border)',
          boxShadow: 'var(--wb-cursor-label-pill-shadow)',
          maxWidth: "120px",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {name}
      </span>
    </div>
  )
}
