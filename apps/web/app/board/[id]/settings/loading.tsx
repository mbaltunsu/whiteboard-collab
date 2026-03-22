import { FONTS } from '@/lib/theme'

export default function SettingsLoading() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: 'var(--wb-surface, #f5f6f7)',
        fontFamily: FONTS.inter,
      }}
    >
      <style>{`
        @keyframes wb-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {/* Skeleton nav */}
      <div
        style={{
          height: 52,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 24px',
          backgroundColor: 'var(--wb-glass-bg)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--wb-ghost-border)',
        }}
        aria-hidden="true"
      >
        <div
          style={{
            width: 100,
            height: 16,
            borderRadius: 9999,
            backgroundColor: 'var(--wb-surface-container, #e6e8ea)',
            animation: 'wb-pulse 1.5s ease-in-out infinite',
          }}
        />
      </div>

      <main
        style={{
          maxWidth: 640,
          margin: '0 auto',
          padding: '32px 24px 64px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
        aria-label="Loading settings"
        aria-busy="true"
      >
        {/* Title skeleton */}
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}
          aria-hidden="true"
        >
          <div
            style={{
              width: 180,
              height: 28,
              borderRadius: 'var(--wb-radius-md, 0.375rem)',
              backgroundColor: 'var(--wb-surface-container, #e6e8ea)',
              animation: 'wb-pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              width: 280,
              height: 16,
              borderRadius: 9999,
              backgroundColor: 'var(--wb-surface-container, #e6e8ea)',
              animation: 'wb-pulse 1.5s ease-in-out 0.1s infinite',
            }}
          />
        </div>

        {/* Section skeletons */}
        {[200, 260, 160, 120].map((height, i) => (
          <div
            key={i}
            style={{
              height,
              borderRadius: 'var(--wb-radius-lg, 0.5rem)',
              backgroundColor: 'var(--wb-surface-container-lowest, #ffffff)',
              boxShadow: 'var(--wb-shadow-contact)',
              animation: `wb-pulse 1.5s ease-in-out ${i * 0.1}s infinite`,
            }}
            aria-hidden="true"
          />
        ))}
      </main>
    </div>
  )
}
