import type { Metadata } from 'next'
import { SignInButtons } from './sign-in-buttons'
import { FONTS } from '@/lib/theme'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to CollaborativeWhiteBoard',
}

export default function SignInPage() {
  return (
    <main
      className="flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: 'var(--wb-surface)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-lg"
        style={{ backgroundColor: 'var(--wb-surface-container-lowest)' }}
      >
        <div className="mb-8 text-center">
          <h1
            className="mb-2 text-2xl font-bold tracking-tight"
            style={{ fontFamily: FONTS.manrope, color: 'var(--wb-on-surface)' }}
          >
            Welcome back
          </h1>
          <p
            className="text-sm"
            style={{ fontFamily: FONTS.inter, color: 'var(--wb-on-surface-variant)' }}
          >
            Sign in to access your whiteboards
          </p>
        </div>

        <SignInButtons />

        <p
          className="mt-6 text-center text-xs"
          style={{ fontFamily: FONTS.inter, color: 'var(--wb-outline)' }}
        >
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </main>
  )
}
