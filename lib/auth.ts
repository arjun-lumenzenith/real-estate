import { betterAuth } from 'better-auth'
import { getPool } from './db'

// Build trusted origins list for cookie security
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

  return origins
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
      trustedOrigins: getOrigins(),
      emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
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
