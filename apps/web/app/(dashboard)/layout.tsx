import { requireAuth } from '@/lib/auth'
import { Manrope } from 'next/font/google'
import { FONTS } from '@/lib/theme'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth()
  const user = session.user

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email.slice(0, 2).toUpperCase()

  return (
    <div
      className={`${manrope.variable} min-h-screen`}
      style={{ backgroundColor: 'var(--wb-surface)' }}
    >
      {/* Top navigation bar */}
      <header
        className="sticky top-0 z-40 flex h-14 items-center justify-between px-6"
        style={{ backgroundColor: 'var(--wb-surface-container-low)' }}
      >
        {/* App name */}
        <Link
          href="/dashboard"
          className="font-manrope text-base font-bold tracking-tight"
          style={{ color: 'var(--wb-on-surface)', fontFamily: FONTS.manrope }}
        >
          The Infinite Curator
        </Link>

        {/* Right side: settings + avatar */}
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            style={{ color: 'var(--wb-on-surface-variant)' }}
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </Link>

          <Avatar size="default">
            {user.image && <AvatarImage src={user.image} alt={user.name ?? 'User avatar'} />}
            <AvatarFallback
              style={{ backgroundColor: 'var(--wb-surface-container-high)', color: 'var(--wb-on-surface-variant)', fontSize: '0.75rem', fontWeight: 500 }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  )
}
