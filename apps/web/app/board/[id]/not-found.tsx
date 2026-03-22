import Link from 'next/link'
import { FONTS, GRADIENTS } from '@/lib/theme'

export default function BoardNotFound() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--wb-surface, #f5f6f7)',
        gap: 24,
        padding: 24,
        textAlign: 'center',
      }}
    >
      {/* Sketch-style broken board icon */}
      <svg
        width="72"
        height="72"
        viewBox="0 0 72 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect
          x="8"
          y="12"
          width="56"
          height="42"
          rx="6"
          stroke="var(--wb-surface-container, #e6e8ea)"
          strokeWidth="3"
          fill="var(--wb-surface-container-low, #eff1f2)"
        />
        <path
          d="M28 33 L44 33 M28 39 L38 39"
          stroke="var(--wb-surface-container-high, #e0e3e4)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M8 58 L18 58 M26 58 L72 58"
          stroke="var(--wb-surface-container, #e6e8ea)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* X mark */}
        <circle cx="52" cy="20" r="12" fill="var(--wb-surface-container-low, #eff1f2)" />
        <path
          d="M47 15 L57 25 M57 15 L47 25"
          stroke="var(--wb-error, #b41340)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}>
        <h1
          style={{
            margin: 0,
            fontSize: '22px',
            fontFamily: FONTS.manrope,
            fontWeight: 700,
            color: 'var(--wb-on-surface, #2c2f30)',
            lineHeight: 1.3,
          }}
        >
          Board not found
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: '14px',
            fontFamily: FONTS.inter,
            color: 'var(--wb-on-surface-variant, #595c5d)',
            lineHeight: 1.6,
          }}
        >
          This board doesn&apos;t exist or you don&apos;t have permission to access it.
          It may have been deleted or the link might be incorrect.
        </p>
      </div>

      <Link
        href="/dashboard"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          height: 40,
          padding: '0 20px',
          borderRadius: 'var(--wb-radius-md, 0.375rem)',
          background: GRADIENTS.primary,
          color: 'var(--wb-on-primary-solid)',
          fontSize: '14px',
          fontFamily: FONTS.inter,
          fontWeight: 500,
          textDecoration: 'none',
          boxShadow: 'var(--wb-primary-shadow-sm)',
          transition: 'opacity 150ms',
        }}
      >
        Back to dashboard
      </Link>
    </div>
  )
}
