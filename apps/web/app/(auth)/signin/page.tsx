import type { Metadata } from 'next'
import { SignInButtons } from './sign-in-buttons'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to CollaborativeWhiteBoard',
}

export default function SignInPage() {
  return (
    <main
      className="flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: '#f5f6f7' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-lg"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="mb-8 text-center">
          <h1
            className="mb-2 text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'Manrope, sans-serif', color: '#0f0f10' }}
          >
            Welcome back
          </h1>
          <p
            className="text-sm"
            style={{ fontFamily: 'Inter, sans-serif', color: '#6b7280' }}
          >
            Sign in to access your whiteboards
          </p>
        </div>

        <SignInButtons />

        <p
          className="mt-6 text-center text-xs"
          style={{ fontFamily: 'Inter, sans-serif', color: '#9ca3af' }}
        >
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </main>
  )
}
