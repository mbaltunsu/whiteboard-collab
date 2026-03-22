import { getServerSession as nextAuthGetServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

declare module 'next-auth' {
  interface Session {
    user: {
      userId: string
      name: string
      email: string
      image?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string
  }
}

export async function getServerSession(): Promise<Session | null> {
  return nextAuthGetServerSession(authOptions)
}

/**
 * For Server Components / page-level protection.
 * Redirects unauthenticated users to sign-in.
 */
export async function requireAuth(): Promise<Session> {
  const session = await getServerSession()

  if (!session) {
    redirect('/signin')
  }

  return session
}

/**
 * For API Route Handlers.
 * Returns null if unauthenticated (caller should return NextResponse).
 */
export async function requireApiAuth(): Promise<Session | null> {
  const session = await getServerSession()
  return session
}

/**
 * Helper to create a 401 response for API routes.
 */
export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
