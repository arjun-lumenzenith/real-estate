import { betterAuth } from 'better-auth'
import { getPool } from './db'

// Build the static trusted origins list for cookie security.
const getOrigins = () => {
  const origins: string[] = []

  // Vercel production URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    origins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
  }

  // Vercel preview URL
  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`)
  }

  // V0 runtime URL (for v0 preview)
  if (process.env.V0_RUNTIME_URL) {
    origins.push(process.env.V0_RUNTIME_URL)
  }

  // Local development
  origins.push('http://localhost:3000')
  origins.push('http://127.0.0.1:3000')

  return origins
}

/**
 * Trusted origins as a function so we can also trust the origin of the incoming
 * request itself. This makes auth work across the v0 preview iframe, Vercel
 * preview/production deployments, and local dev without hard-coding every host.
 * We only auto-trust hosts we know are ours (localhost + *.vusercontent.net +
 * *.vercel.app) so this does not weaken CSRF protection for arbitrary origins.
 */
const trustedOrigins = (request?: Request): string[] => {
  const origins = getOrigins()

  const header = request?.headers?.get?.('origin') || request?.headers?.get?.('referer')
  if (header) {
    try {
      const { origin, hostname, protocol } = new URL(header)
      const isLoopback = hostname === 'localhost' || hostname === '127.0.0.1'
      const isOwnPlatform =
        hostname.endsWith('.vusercontent.net') || hostname.endsWith('.vercel.app')
      if ((protocol === 'https:' && isOwnPlatform) || isLoopback) {
        origins.push(origin)
      }
    } catch {
      // ignore malformed origin/referer headers
    }
  }

  return Array.from(new Set(origins))
}

// Lazy initialization of auth to defer database access until runtime
let authInstance: any = null

function initializeAuth() {
  if (!authInstance) {
    if (!process.env.BETTER_AUTH_SECRET) {
      throw new Error('BETTER_AUTH_SECRET is not set. Generate one with: openssl rand -base64 32')
    }

    authInstance = betterAuth({
      database: getPool(),
      secret: process.env.BETTER_AUTH_SECRET,
      baseURL: process.env.BETTER_AUTH_URL || getOrigins()[0],
      trustedOrigins,
      emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
      },
      user: {
        additionalFields: {
          role: {
            type: 'string',
            required: false,
            defaultValue: 'user',
            input: false, // never settable via sign-up / client
          },
        },
      },
      session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // Update session every 24 hours
        cookieCache: {
          enabled: true,
          maxAge: 300, // Cache for 5 minutes
        },
      },
      advanced: {
        defaultCookieAttributes: {
          ...(process.env.NODE_ENV === 'development'
            ? {
                sameSite: 'none' as const,
                secure: true,
              }
            : {
                sameSite: 'lax' as const,
                secure: true,
              }),
        },
      },
    })
  }

  return authInstance
}

// Export auth handler - will be initialized on first use
export const auth = new Proxy({}, {
  get: (target, prop) => {
    return (initializeAuth() as any)[prop]
  },
}) as any
