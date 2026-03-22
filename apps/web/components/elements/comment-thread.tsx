'use client'

import { useState, useRef, useCallback, KeyboardEvent } from 'react'
import type { CommentElement } from '@whiteboard/shared'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CommentPin } from './comment-pin'

interface CommentThreadProps {
  element: CommentElement
  boardId: string
  onAddMessage: (text: string) => void
  onResolve: () => void
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function CommentThread({
  element,
  boardId: _boardId,
  onAddMessage,
  onResolve,
}: CommentThreadProps) {
  const [inputValue, setInputValue] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { data } = element
  const isResolved = data.resolved

  const handleAddMessage = useCallback(() => {
    const text = inputValue.trim()
    if (!text) return
    onAddMessage(text)
    setInputValue('')
    inputRef.current?.focus()
  }, [inputValue, onAddMessage])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleAddMessage()
      }
    },
    [handleAddMessage],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        nativeButton={false}
        render={
          <span
            style={{
              position: 'absolute',
              display: 'contents',
            }}
          />
        }
      >
        <CommentPin element={element} onClick={() => setOpen(true)} />
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="start"
        sideOffset={8}
        className="p-0 overflow-hidden"
        style={{
          width: '280px',
          background: 'var(--wb-surface-container-lowest)',
          border: '1px solid var(--wb-ghost-border)',
          borderRadius: 'var(--wb-radius-lg)',
          boxShadow: 'var(--wb-shadow-ambient)',
          opacity: isResolved ? 0.85 : 1,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--wb-spacing-2) var(--wb-spacing-4)',
            background: 'var(--wb-surface-container-low)',
            borderBottom: '1px solid var(--wb-ghost-border)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--wb-spacing-2)',
            }}
          >
            <span
              style={{
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                color: 'var(--wb-on-surface)',
                letterSpacing: '-0.01em',
              }}
            >
              Comment Thread
            </span>
            {isResolved && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '1px 6px',
                  borderRadius: 'var(--wb-radius-full)',
                  background: 'var(--wb-secondary-container)',
                  color: 'var(--wb-on-secondary-container)',
                  fontSize: '10px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  lineHeight: '16px',
                }}
              >
                Resolved
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onResolve}
            aria-label={isResolved ? 'Unresolve thread' : 'Resolve thread'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: 'var(--wb-radius-md)',
              background: isResolved
                ? 'rgba(144, 151, 255, 0.15)'
                : 'transparent',
              color: isResolved
                ? 'var(--wb-primary)'
                : 'var(--wb-on-surface-variant)',
              border: '1px solid var(--wb-ghost-border)',
              fontSize: '11px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 120ms ease, color 120ms ease',
              lineHeight: '16px',
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M2 6L5 9L10 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {isResolved ? 'Unresolve' : 'Resolve'}
          </button>
        </div>

        {/* Message list */}
        <div
          role="log"
          aria-label="Comment messages"
          aria-live="polite"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
            maxHeight: '240px',
            overflowY: 'auto',
            padding:
              data.messages.length === 0
                ? 'var(--wb-spacing-6) var(--wb-spacing-4)'
                : 'var(--wb-spacing-2) 0',
          }}
        >
          {data.messages.length === 0 ? (
            <p
              style={{
                margin: 0,
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif',
                color: 'var(--wb-on-surface-variant)',
                textAlign: 'center',
              }}
            >
              No messages yet. Add the first comment below.
            </p>
          ) : (
            data.messages.map((message, index) => (
              <div
                key={`${message.author}-${message.timestamp}-${index}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  padding: 'var(--wb-spacing-2) var(--wb-spacing-4)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 'var(--wb-spacing-2)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      color: 'var(--wb-on-surface)',
                      letterSpacing: '0.01em',
                      maxWidth: '140px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {message.author}
                  </span>
                  <time
                    dateTime={new Date(message.timestamp).toISOString()}
                    style={{
                      fontSize: '10px',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      color: 'var(--wb-on-surface-variant)',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {formatRelativeTime(message.timestamp)}
                  </time>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    color: 'var(--wb-on-surface)',
                    lineHeight: '1.5',
                    wordBreak: 'break-word',
                  }}
                >
                  {message.text}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Input area */}
        {!isResolved && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--wb-spacing-2)',
              padding: 'var(--wb-spacing-2) var(--wb-spacing-4)',
              borderTop: '1px solid var(--wb-ghost-border)',
              background: 'var(--wb-surface-container-highest)',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a comment…"
              aria-label="New comment text"
              maxLength={500}
              style={{
                flex: 1,
                minWidth: 0,
                height: '32px',
                padding: '0 var(--wb-spacing-2)',
                background: 'var(--wb-surface-container-lowest)',
                border: '1px solid var(--wb-ghost-border)',
                borderRadius: 'var(--wb-radius-md)',
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif',
                color: 'var(--wb-on-surface)',
                outline: 'none',
                transition: 'border-color 120ms ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--wb-primary)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--wb-ghost-border)'
              }}
            />
            <button
              type="button"
              onClick={handleAddMessage}
              disabled={!inputValue.trim()}
              aria-label="Send comment"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: 'var(--wb-radius-md)',
                background: inputValue.trim()
                  ? 'var(--wb-primary)'
                  : 'var(--wb-surface-container)',
                border: 'none',
                cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                transition: 'background 120ms ease',
                flexShrink: 0,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M1.5 7L12.5 7M12.5 7L8 2.5M12.5 7L8 11.5"
                  stroke={inputValue.trim() ? '#fff' : 'var(--wb-on-surface-variant)'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}

        {isResolved && (
          <div
            style={{
              padding: 'var(--wb-spacing-2) var(--wb-spacing-4)',
              borderTop: '1px solid var(--wb-ghost-border)',
              background: 'var(--wb-surface-container-highest)',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '11px',
                fontFamily: 'Inter, sans-serif',
                color: 'var(--wb-on-surface-variant)',
                textAlign: 'center',
              }}
            >
              This thread is resolved. Unresolve to add more comments.
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
