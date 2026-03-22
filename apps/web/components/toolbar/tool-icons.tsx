'use client'

interface IconProps {
  className?: string
}

export function SelectIcon({ className }: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M5 3L19 12L12 13.5L9 20L5 3Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PenIcon({ className }: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M4 20L8.5 19L19.5 8C19.9 7.6 19.9 6.9 19.5 6.5L17.5 4.5C17.1 4.1 16.4 4.1 16 4.5L5 15.5L4 20Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M16 5L19 8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function StickyNoteIcon({ className }: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M5 3H19C19.6 3 20 3.4 20 4V16L14 20H5C4.4 20 4 19.6 4 19V4C4 3.4 4.4 3 5 3Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M14 16V20L20 16H14Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M8 8H16M8 12H13"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ShapesIcon({ className }: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="3"
        y="3"
        width="8"
        height="8"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle
        cx="17"
        cy="7"
        r="4"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M3 21L7 14L11 21H3Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M13 17L17 13L21 17L17 21L13 17Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function TextIcon({ className }: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M4 6H20M12 6V18M9 18H15"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function EraserIcon({ className }: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M20 20H10L4.5 14.5C4.1 14.1 4.1 13.4 4.5 13L13 4.5C13.4 4.1 14.1 4.1 14.5 4.5L20.5 10.5C20.9 10.9 20.9 11.6 20.5 12L12 20"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M9 9L15 15"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function HandIcon({ className }: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M9 11V6C9 5.4 9.4 5 10 5C10.6 5 11 5.4 11 6V11M11 10V5C11 4.4 11.4 4 12 4C12.6 4 13 4.4 13 5V10M13 9V6C13 5.4 13.4 5 14 5C14.6 5 15 5.4 15 6V10M7 11V9C7 8.4 7.4 8 8 8C8.6 8 9 8.4 9 9M7 14V11L5 13C4.5 13.5 4.5 14.3 5 14.8L8.5 18.5C9 19 9.5 19.5 10.5 20H15C16.1 20 17 19.1 17 18V13C17 12.4 16.6 12 16 12C15.4 12 15 12.4 15 13"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CommentIcon({ className }: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M4 4H20C20.6 4 21 4.4 21 5V16C21 16.6 20.6 17 20 17H8L3 21V5C3 4.4 3.4 4 4 4Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M8 10H16M8 13H13"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function HighlighterIcon({ className }: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M9 20H15M12 20V16M6 4L8 16H16L18 4H6Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Shape sub-type icons

export function RectangleIcon({ className }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="3"
        y="5"
        width="14"
        height="10"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.75"
      />
    </svg>
  )
}

export function EllipseIcon({ className }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <ellipse
        cx="10"
        cy="10"
        rx="7"
        ry="5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
    </svg>
  )
}

export function DiamondIcon({ className }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10 2L18 10L10 18L2 10L10 2Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ArrowIcon({ className }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M3 10H17M17 10L12 5M17 10L12 15"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function LineIcon({ className }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M3 17L17 3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

// Zoom/control icons

export function UndoIcon({ className }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M4 7H13C15.2 7 17 8.8 17 11C17 13.2 15.2 15 13 15H4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M7 4L4 7L7 10"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function RedoIcon({ className }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M16 7H7C4.8 7 3 8.8 3 11C3 13.2 4.8 15 7 15H16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M13 4L16 7L13 10"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ZoomInIcon({ className }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M13.5 13.5L17 17"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M7 9H11M9 7V11"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ZoomOutIcon({ className }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M13.5 13.5L17 17"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M7 9H11"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function FitScreenIcon({ className }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M3 7V4H6M14 4H17V7M17 13V16H14M6 16H3V13"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="6.5"
        y="6.5"
        width="7"
        height="7"
        rx="0.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export function MapIcon({ className }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="2"
        y="4"
        width="16"
        height="12"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <rect
        x="13"
        y="12"
        width="4"
        height="3"
        rx="0.5"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  )
}
