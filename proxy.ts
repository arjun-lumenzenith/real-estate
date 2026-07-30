import { NextResponse, type NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

/**
 * Coarse gate for the admin area (Next.js 16 proxy convention).
 *
 * This only checks for the presence of a Better Auth session cookie and keeps
 * unauthenticated visitors away from /admin pages. It intentionally does NOT
 * verify the admin role — that requires a database lookup and is enforced
 * server-side in the admin pages/actions via requireAdmin()/requireEditor().
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // The login page itself must stay public.
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const sessionCookie = getSessionCookie(request)
    if (!sessionCookie) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
