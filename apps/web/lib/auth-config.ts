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
