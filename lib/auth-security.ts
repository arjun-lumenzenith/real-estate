import 'server-only'
import { getPool } from './db'

/* ------------------------------------------------------------------ */
/* Rate limiting storage                                               */
/* ------------------------------------------------------------------ */

// Postgres-backed so limits hold across serverless instances (in-memory
// counters reset per instance and would be trivially bypassed on Vercel).

interface RateLimitRecord {
  key: string
  count: number
  lastRequest: number
}

interface RateLimitRule {
  window: number
  max: number
}

const PRUNE_PROBABILITY = 0.02
const PRUNE_OLDER_THAN_MS = 24 * 60 * 60 * 1000

function maybePrune() {
  if (Math.random() > PRUNE_PROBABILITY) return
  getPool()
    .query('DELETE FROM auth_rate_limits WHERE last_request < $1::bigint', [
      Date.now() - PRUNE_OLDER_THAN_MS,
    ])
    .catch((err) => console.error('[auth-security] rate limit prune failed', err))
}

export const rateLimitStorage = {
  async get(key: string): Promise<RateLimitRecord | null> {
    const { rows } = await getPool().query(
      'SELECT key, count, last_request FROM auth_rate_limits WHERE key = $1',
      [key]
    )
    const row = rows[0]
    return row ? { key: row.key, count: row.count, lastRequest: Number(row.last_request) } : null
  },

  async set(key: string, value: RateLimitRecord): Promise<void> {
    await getPool().query(
      `INSERT INTO auth_rate_limits (key, count, last_request)
       VALUES ($1, $2, $3::bigint)
       ON CONFLICT (key) DO UPDATE SET count = EXCLUDED.count, last_request = EXCLUDED.last_request`,
      [key, value.count, value.lastRequest]
    )
  },

  /** Atomic check-and-increment over a fixed window. */
  async consume(key: string, rule: RateLimitRule) {
    const now = Date.now()
    const windowMs = rule.window * 1000
    try {
      const { rows } = await getPool().query(
        `INSERT INTO auth_rate_limits (key, count, last_request)
         VALUES ($1, 1, $2::bigint)
         ON CONFLICT (key) DO UPDATE SET
           count = CASE WHEN $2::bigint - auth_rate_limits.last_request > $3::bigint
                        THEN 1 ELSE auth_rate_limits.count + 1 END,
           last_request = CASE WHEN $2::bigint - auth_rate_limits.last_request > $3::bigint
                        THEN $2::bigint ELSE auth_rate_limits.last_request END
         RETURNING count, last_request`,
        [key, now, windowMs]
      )
      maybePrune()

      const { count, last_request } = rows[0]
      if (count <= rule.max) return { allowed: true, retryAfter: null }
      const retryAfter = Math.max(1, Math.ceil((Number(last_request) + windowMs - now) / 1000))
      return { allowed: false, retryAfter }
    } catch (err) {
      // Fail open so a database hiccup does not lock every admin out;
      // the per-account lockout still applies.
      console.error('[auth-security] rate limit check failed', err)
      return { allowed: true, retryAfter: null }
    }
  },
}

/* ------------------------------------------------------------------ */
/* Account lockout                                                     */
/* ------------------------------------------------------------------ */

export const MAX_FAILED_ATTEMPTS = 5
export const ATTEMPT_WINDOW_MINUTES = 15
export const LOCKOUT_MINUTES = 15

export function normalizeEmail(email: unknown): string | null {
  if (typeof email !== 'string') return null
  const trimmed = email.trim().toLowerCase()
  return trimmed.length > 0 && trimmed.length <= 320 ? trimmed : null
}

export async function getActiveLockout(email: string): Promise<Date | null> {
  const { rows } = await getPool().query(
    'SELECT locked_until FROM auth_login_attempts WHERE email = $1 AND locked_until > now()',
    [email]
  )
  return rows[0]?.locked_until ? new Date(rows[0].locked_until) : null
}

/**
 * Records a failed attempt. Counting restarts once the attempt window or a
 * previous lock has elapsed. Tracked per email whether or not the account
 * exists, so lockout behaviour does not reveal which emails are registered.
 */
export async function recordFailedLogin(email: string): Promise<Date | null> {
  // All right-hand SET expressions read the pre-update row, so `expired` is
  // evaluated consistently in each column.
  const expired = `(auth_login_attempts.window_started_at < now() - ($4::int * interval '1 minute')
    OR (auth_login_attempts.locked_until IS NOT NULL AND auth_login_attempts.locked_until <= now()))`

  const { rows } = await getPool().query(
    `INSERT INTO auth_login_attempts (email, failed_count, window_started_at, locked_until)
     VALUES ($1, 1, now(), NULL)
     ON CONFLICT (email) DO UPDATE SET
       failed_count = CASE WHEN ${expired} THEN 1 ELSE auth_login_attempts.failed_count + 1 END,
       window_started_at = CASE WHEN ${expired} THEN now() ELSE auth_login_attempts.window_started_at END,
       locked_until = CASE
         WHEN ${expired} THEN NULL
         WHEN auth_login_attempts.failed_count + 1 >= $2::int
           THEN now() + ($3::int * interval '1 minute')
         ELSE auth_login_attempts.locked_until
       END
     RETURNING locked_until`,
    [email, MAX_FAILED_ATTEMPTS, LOCKOUT_MINUTES, ATTEMPT_WINDOW_MINUTES]
  )
  const lockedUntil = rows[0]?.locked_until
  return lockedUntil ? new Date(lockedUntil) : null
}

export async function clearFailedLogins(email: string): Promise<void> {
  await getPool().query('DELETE FROM auth_login_attempts WHERE email = $1', [email])
}

export function lockoutMessage(lockedUntil: Date): string {
  const minutes = Math.max(1, Math.ceil((lockedUntil.getTime() - Date.now()) / 60000))
  return `Too many failed sign-in attempts. This account is locked for ${minutes} more minute${minutes === 1 ? '' : 's'}.`
}
