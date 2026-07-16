import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

// Lazy-initialized pool and database instance
let cachedPool: Pool | null = null
let cachedDb: any = null

export function getPool(): Pool {
  if (!cachedPool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }

    // Connection pool with configurable parameters for performance
    const poolConfig = {
      connectionString: process.env.DATABASE_URL,
      // Pool sizing: min 2, max 20 connections
      min: process.env.DB_POOL_MIN ? parseInt(process.env.DB_POOL_MIN) : 2,
      max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX) : 20,
      // Connection timeout: 10 seconds
      connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT ? parseInt(process.env.DB_CONNECTION_TIMEOUT) : 10000,
      // Idle timeout: 30 seconds
      idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT ? parseInt(process.env.DB_IDLE_TIMEOUT) : 30000,
      // Query timeout: 10 seconds
      query_timeout: process.env.DB_QUERY_TIMEOUT ? parseInt(process.env.DB_QUERY_TIMEOUT) : 10000,
      // Statement timeout: 10 seconds
      statement_timeout: process.env.DB_STATEMENT_TIMEOUT ? parseInt(process.env.DB_STATEMENT_TIMEOUT) : 10000,
    }

    cachedPool = new Pool(poolConfig)

    // Set up error handling for the pool
    cachedPool.on('error', (err) => {
      console.error('[DB Pool Error]', err)
    })

    cachedPool.on('connect', () => {
      console.log('[DB] Connection established')
    })
  }

  return cachedPool
}

export function getDb() {
  if (!cachedDb) {
    cachedDb = drizzle(getPool(), { schema })
  }
  return cachedDb
}

// Health check function
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await getPool().query('SELECT 1')
    return result.rowCount === 1
  } catch (error) {
    console.error('[DB Health Check] Failed:', error)
    return false
  }
}

// Graceful shutdown
export async function closePool(): Promise<void> {
  if (cachedPool) {
    await cachedPool.end()
    console.log('[DB] Pool closed')
  }
}

// Export as aliases for backward compatibility
export const db = { __lazy: true }
export const pool = { __lazy: true }

// Override at runtime - this getter pattern ensures lazy initialization
Object.defineProperty(globalThis, '__db', {
  get: getDb,
  configurable: true,
})

Object.defineProperty(globalThis, '__pool', {
  get: getPool,
  configurable: true,
})
