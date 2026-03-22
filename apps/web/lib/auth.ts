import { getServerSession as nextAuthGetServerSession } from 'next-auth'
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

export async function requireAuth(): Promise<Session> {
  const session = await getServerSession()

  if (!session) {
    throw new Response('Unauthorized', { status: 401 })
  }

  return session
}
