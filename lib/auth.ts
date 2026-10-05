import { betterAuth } from 'better-auth'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { getPool } from './db'
import {
  clearFailedLogins,
  getActiveLockout,
  lockoutMessage,
  normalizeEmail,
  rateLimitStorage,
  recordFailedLogin,
} from './auth-security'
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, validatePassword } from './password-policy'

export const SESSION_IDLE_TIMEOUT_SECONDS = 60 * 60 * 8
export const SESSION_ABSOLUTE_MAX_SECONDS = 60 * 60 * 24

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
        // Admin accounts are provisioned by the seed endpoint only.
        disableSignUp: true,
        minPasswordLength: PASSWORD_MIN_LENGTH,
        maxPasswordLength: PASSWORD_MAX_LENGTH,
        revokeSessionsOnPasswordReset: true,
      },
      rateLimit: {
        enabled: true,
        window: 60,
        max: 100,
        storage: 'custom-storage',
        customStorage: rateLimitStorage,
        customRules: {
          '/sign-in/email': { window: 60, max: 5 },
          '/change-password': { window: 300, max: 5 },
          '/revoke-sessions': { window: 60, max: 10 },
          '/get-session': false,
        },
      },
      hooks: {
        before: createAuthMiddleware(async (ctx) => {
          if (ctx.path === '/sign-in/email') {
            const email = normalizeEmail(ctx.body?.email)
            if (!email) return
            const lockedUntil = await getActiveLockout(email)
            if (lockedUntil) {
              throw new APIError('TOO_MANY_REQUESTS', {
                message: lockoutMessage(lockedUntil),
                code: 'ACCOUNT_LOCKED',
              })
            }
            return
          }

          const candidate =
            ctx.path === '/sign-up/email'
              ? { password: ctx.body?.password, email: ctx.body?.email }
              : ctx.path === '/change-password' || ctx.path === '/reset-password'
                ? { password: ctx.body?.newPassword, email: null }
                : null
          if (candidate) {
            const reason = validatePassword(candidate.password ?? '', candidate.email)
            if (reason) {
              throw new APIError('BAD_REQUEST', { message: reason, code: 'WEAK_PASSWORD' })
            }
          }
        }),
        after: createAuthMiddleware(async (ctx) => {
          if (ctx.path !== '/sign-in/email') return
          const email = normalizeEmail(ctx.body?.email)
          if (!email) return

          const returned = ctx.context.returned as
            | { statusCode?: number; status?: string }
            | undefined
          const isError = returned instanceof Error
          if (!isError) {
            await clearFailedLogins(email)
            return
          }
          if (returned?.statusCode === 401 || returned?.status === 'UNAUTHORIZED') {
            await recordFailedLogin(email)
          }
        }),
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
        // Idle timeout: a session expires after 8h without activity and is
        // extended (at most hourly) while in use. A hard 24h cap from sign-in
        // is enforced in lib/rbac.ts.
        expiresIn: SESSION_IDLE_TIMEOUT_SECONDS,
        updateAge: 60 * 60,
        freshAge: 60 * 15,
        cookieCache: {
          enabled: true,
          maxAge: 60,
        },
      },
      advanced: {
        ipAddress: {
          ipAddressHeaders: ['x-vercel-forwarded-for', 'x-forwarded-for', 'x-real-ip'],
        },
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
