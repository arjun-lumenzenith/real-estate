import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

type Database = ReturnType<typeof drizzle<typeof schema>>

let cachedPool: Pool | null = null
let cachedDb: Database | null = null

function getEnvNumber(name: string, defaultValue: number): number {
  const value = process.env[name]

  if (!value) {
    return defaultValue
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${name} must be a valid non-negative number`)
  }

  return parsed
}

export function getPool(): Pool {
  if (cachedPool) {
    return cachedPool
  }

  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  cachedPool = new Pool({
    connectionString,

    /*
     * For serverless deployments:
     *   DB_POOL_MIN=0
     *   DB_POOL_MAX=5
     *
     * For a dedicated long-running Node.js server:
     *   DB_POOL_MIN=1
     *   DB_POOL_MAX=10
     */
    min: getEnvNumber('DB_POOL_MIN', 0),
    max: getEnvNumber('DB_POOL_MAX', 10),

    connectionTimeoutMillis: getEnvNumber(
      'DB_CONNECTION_TIMEOUT',
      10_000
    ),

    idleTimeoutMillis: getEnvNumber(
      'DB_IDLE_TIMEOUT',
      30_000
    ),

    query_timeout: getEnvNumber(
      'DB_QUERY_TIMEOUT',
      10_000
    ),

    statement_timeout: getEnvNumber(
      'DB_STATEMENT_TIMEOUT',
      10_000
    ),
  })

  cachedPool.on('error', (error) => {
    console.error('[DB Pool Error]', error)
  })

  cachedPool.on('connect', () => {
    console.log('[DB] Connection established')
  })

  return cachedPool
}

export function getDb(): Database {
  if (!cachedDb) {
    cachedDb = drizzle(getPool(), { schema })
  }

  return cachedDb
}

/**
 * Executes a database operation with retry support.
 *
 * This is intended primarily for transient failures such as:
 * - connection reset
 * - temporary network failure
 * - database failover
 * - connection termination
 *
 * Do NOT blindly use this for non-idempotent INSERT operations unless
 * the operation has an idempotency key or a unique constraint that
 * makes retrying safe.
 */
export async function withDbRetry<T>(
  operation: () => Promise<T>,
  options: {
    retries?: number
    initialDelayMs?: number
  } = {}
): Promise<T> {
  const retries = options.retries ?? 2
  const initialDelayMs = options.initialDelayMs ?? 100

  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      if (attempt === retries) {
        throw error
      }

      const delayMs = initialDelayMs * Math.pow(2, attempt)

      console.warn(
        `[DB] Operation failed. Retrying in ${delayMs}ms ` +
        `(attempt ${attempt + 1}/${retries})`,
        error
      )

      await new Promise((resolve) => {
        setTimeout(resolve, delayMs)
      })
    }
  }

  throw lastError
}

export async function healthCheck(): Promise<boolean> {
  try {
    await getPool().query('SELECT 1')
    return true
  } catch (error) {
    console.error('[DB Health Check] Failed:', error)
    return false
  }
}

export async function closePool(): Promise<void> {
  if (!cachedPool) {
    return
  }

  const poolToClose = cachedPool

  cachedPool = null
  cachedDb = null

  await poolToClose.end()

  console.log('[DB] Pool closed')
}