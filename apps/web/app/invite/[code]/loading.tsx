export default function InviteLoading() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--wb-surface, #f5f6f7)',
        padding: '24px',
        fontFamily: 'Inter, sans-serif',
      }}
      aria-label="Joining board"
      aria-busy="true"
    >
      <style>{`
        @keyframes wb-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes wb-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

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
          boxShadow: '0 12px 32px -4px rgba(12, 15, 16, 0.08)',
          textAlign: 'center',
        }}
      >
        {/* Animated spinner */}
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={{ animation: 'wb-spin 1s linear infinite' }}
        >
          <circle
            cx="24"
            cy="24"
            r="18"
            stroke="var(--wb-surface-container, #e6e8ea)"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M24 6 A18 18 0 0 1 42 24"
            stroke="var(--wb-primary, #0c0bff)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Text skeleton */}
        <div
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}
          aria-hidden="true"
        >
          <div
            style={{
              width: 160,
              height: 22,
              borderRadius: 'var(--wb-radius-md, 0.375rem)',
              backgroundColor: 'var(--wb-surface-container, #e6e8ea)',
              animation: 'wb-pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              width: 240,
              height: 16,
              borderRadius: 9999,
              backgroundColor: 'var(--wb-surface-container, #e6e8ea)',
              animation: 'wb-pulse 1.5s ease-in-out 0.1s infinite',
            }}
          />
        </div>

        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: 'var(--wb-on-surface-variant, #595c5d)',
          }}
        >
          Joining board...
        </p>
      </div>
    </div>
  )
}
