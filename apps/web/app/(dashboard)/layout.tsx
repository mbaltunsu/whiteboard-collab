import { requireAuth } from '@/lib/auth'
import { Manrope } from 'next/font/google'
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
      style={{ backgroundColor: '#f5f6f7' }}
    >
      {/* Top navigation bar */}
      <header
        className="sticky top-0 z-40 flex h-14 items-center justify-between px-6"
        style={{ backgroundColor: '#eff1f2' }}
      >
        {/* App name */}
        <Link
          href="/dashboard"
          className="font-manrope text-base font-bold tracking-tight"
          style={{ color: '#2c2f30', fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
        >
          The Infinite Curator
        </Link>

        {/* Right side: settings + avatar */}
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[#e6e8ea]"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" style={{ color: '#595c5d' }} />
          </Link>

          <Avatar size="default">
            {user.image && <AvatarImage src={user.image} alt={user.name ?? 'User avatar'} />}
            <AvatarFallback
              style={{ backgroundColor: '#e0e3e4', color: '#595c5d', fontSize: '0.75rem', fontWeight: 500 }}
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
