import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware() {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized({ token }) {
        return token !== null
      },
    },
    pages: {
      signIn: '/signin',
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/board/:path*', '/invite/:path*'],
}
