'use client'

import type { CommentElement } from '@whiteboard/shared'

interface CommentPinProps {
  element: CommentElement
  onClick: () => void
}

export function CommentPin({ element, onClick }: CommentPinProps) {
  const { data, position } = element
  const messageCount = data.messages.length
  const isResolved = data.resolved
  const hasMessages = messageCount > 0

  return (
    <button
      type="button"
      aria-label={`Comment thread with ${messageCount} message${messageCount !== 1 ? 's' : ''}${isResolved ? ', resolved' : ''}`}
      onClick={onClick}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        padding: 0,
        zIndex: element.zIndex,
        opacity: isResolved ? 0.5 : 1,
        transition: 'opacity 150ms ease',
      }}
    >
      {/* Pin body */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: 'var(--wb-radius-full)',
          background: isResolved
            ? 'var(--wb-secondary)'
            : 'var(--wb-primary)',
          boxShadow: 'var(--wb-shadow-ambient)',
          border: '2px solid var(--wb-surface-container-lowest)',
          animation: hasMessages && !isResolved ? 'wb-pin-pulse 2s ease-in-out infinite' : 'none',
        }}
      >
        {/* Comment icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M2 3C2 2.44772 2.44772 2 3 2H13C13.5523 2 14 2.44772 14 3V10C14 10.5523 13.5523 11 13 11H9L6 14V11H3C2.44772 11 2 10.5523 2 10V3Z"
            fill="var(--wb-on-primary)"
            stroke="var(--wb-on-primary)"
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
        </svg>

        {/* Message count badge */}
        {hasMessages && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              minWidth: '16px',
              height: '16px',
              padding: '0 4px',
              borderRadius: 'var(--wb-radius-full)',
              background: 'var(--wb-tertiary-container)',
              color: 'var(--wb-on-tertiary-container)',
              fontSize: '10px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              lineHeight: '16px',
              textAlign: 'center',
              border: '1.5px solid var(--wb-surface-container-lowest)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {messageCount > 99 ? '99+' : messageCount}
          </span>
        )}
      </div>

      {/* Pin tail */}
      <div
        aria-hidden="true"
        style={{
          width: '2px',
          height: '6px',
          background: isResolved ? 'var(--wb-secondary)' : 'var(--wb-primary)',
          borderRadius: '0 0 var(--wb-radius-sm) var(--wb-radius-sm)',
        }}
      />

      <style>{`
        @keyframes wb-pin-pulse {
          0%, 100% { box-shadow: var(--wb-shadow-ambient), 0 0 0 0 rgba(12, 11, 255, 0.3); }
          50% { box-shadow: var(--wb-shadow-ambient), 0 0 0 6px rgba(12, 11, 255, 0); }
        }
      `}</style>
    </button>
  )
}
