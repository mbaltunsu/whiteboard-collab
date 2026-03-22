export default function BoardLoading() {
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
        gap: 16,
      }}
      aria-label="Loading board"
      aria-busy="true"
    >
      {/* Animated sketch-style spinner */}
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ animation: 'wb-spin 1s linear infinite' }}
      >
        <style>{`
          @keyframes wb-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
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

      {/* Skeleton top bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 48,
          backgroundColor: 'rgba(239,241,242,0.6)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          borderBottom: '1px solid rgba(171,173,174,0.15)',
        }}
        aria-hidden="true"
      >
        <div
          style={{
            width: 96,
            height: 22,
            borderRadius: 9999,
            backgroundColor: 'var(--wb-surface-container, #e6e8ea)',
            animation: 'wb-pulse 1.5s ease-in-out infinite',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 72,
              height: 28,
              borderRadius: 'var(--wb-radius-md, 0.375rem)',
              backgroundColor: 'var(--wb-surface-container, #e6e8ea)',
              animation: 'wb-pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--wb-radius-md, 0.375rem)',
              backgroundColor: 'var(--wb-surface-container, #e6e8ea)',
              animation: 'wb-pulse 1.5s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      {/* Skeleton left toolbar */}
      <div
        style={{
          position: 'fixed',
          left: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          padding: 8,
          borderRadius: 'var(--wb-radius-xl, 0.75rem)',
          backgroundColor: 'rgba(239,241,242,0.6)',
          backdropFilter: 'blur(12px)',
        }}
        aria-hidden="true"
      >
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--wb-radius-md, 0.375rem)',
              backgroundColor: 'var(--wb-surface-container, #e6e8ea)',
              animation: `wb-pulse 1.5s ease-in-out ${i * 0.1}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Skeleton zoom controls */}
      <div
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          width: 160,
          height: 40,
          borderRadius: 'var(--wb-radius-xl, 0.75rem)',
          backgroundColor: 'rgba(239,241,242,0.6)',
          backdropFilter: 'blur(12px)',
        }}
        aria-hidden="true"
      />

      <style>{`
        @keyframes wb-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <span
        style={{
          fontSize: '13px',
          fontFamily: 'Inter, sans-serif',
          color: 'var(--wb-on-surface-variant, #595c5d)',
          marginTop: 8,
        }}
      >
        Loading board...
      </span>
    </div>
  )
}
