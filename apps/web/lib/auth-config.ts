import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { connectDB } from '@/lib/mongodb'
import { UserModel } from '@/lib/models/user'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  logger: {
    error(code, metadata) {
      console.error('[NextAuth][error]', code, metadata)
    },
    warn(code) {
      console.warn('[NextAuth][warn]', code)
    },
    debug(code, metadata) {
      console.log('[NextAuth][debug]', code, metadata)
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        console.log('[NextAuth] jwt callback — provider:', account.provider, 'email:', user.email)
        try {
          await connectDB()

          const provider = account.provider as 'google' | 'github'
          const email = user.email ?? token.email

          if (!email) return token

          let dbUser = await UserModel.findOne({ email })

          if (!dbUser) {
            dbUser = await UserModel.create({
              name: user.name ?? '',
              email,
              image: user.image ?? undefined,
              provider,
            })
          }

          token.userId = (dbUser._id as unknown as { toString(): string }).toString()
          token.name = dbUser.name
          token.picture = dbUser.image
          console.log('[NextAuth] jwt callback — DB user resolved:', token.userId)
        } catch (err) {
          console.error('[NextAuth] JWT callback DB error — sign-in will proceed without DB userId:', err)
          token.userId = token.userId ?? user.id ?? 'unknown'
        }
      }

      return token
    },

    async session({ session, token }) {
      session.user.userId = token.userId as string
      session.user.name = token.name as string
      session.user.image = token.picture as string | null | undefined
      return session
    },
  },
}
