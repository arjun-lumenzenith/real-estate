import { kv } from '@vercel/kv'

export interface CacheOptions {
  ttl?: number // TTL in seconds
}

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await kv.get(key)
      return value as T | null
    } catch (error) {
      console.error(`[Cache] Error getting key ${key}:`, error)
      return null
    }
  },

  async set<T>(
    key: string,
    value: T,
    options?: CacheOptions
  ): Promise<void> {
    try {
      if (options?.ttl) {
        await kv.setex(key, options.ttl, JSON.stringify(value))
      } else {
        await kv.set(key, JSON.stringify(value))
      }
    } catch (error) {
      console.error(`[Cache] Error setting key ${key}:`, error)
    }
  },

  async delete(key: string): Promise<void> {
    try {
      await kv.del(key)
    } catch (error) {
      console.error(`[Cache] Error deleting key ${key}:`, error)
    }
  },

  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await kv.keys(pattern)
      if (keys.length > 0) {
        await kv.del(...keys)
      }
    } catch (error) {
      console.error(`[Cache] Error deleting pattern ${pattern}:`, error)
    }
  },
}

// Cache key generators
export const cacheKeys = {
  leads: (userId: string) => `leads:${userId}`,
  lead: (id: string) => `lead:${id}`,
  properties: (
    localities?: string,
    bhkTypes?: string,
    minBudget?: string,
    maxBudget?: string,
    builderId?: string,
    page?: string,
    limit?: string
  ) =>
    `properties:${
      localities || "all"
    }:${
      bhkTypes || "all"
    }:${
      minBudget || "all"
    }:${
      maxBudget || "all"
    }:${
      builderId || "all"
    }:${
      page || "1"
    }:${
      limit || "10"
    }`,
  property: (id: string, ) => `property:${id}`,
  builders: (tier?: string, page?: string, limit?: string) => `builders:${tier || 'all'}:${
      page || "1"
    }:${
      limit || "10"
    }`,
  builder: (id: string) => `builder:${id}`,
  inquiries: (leadId: string) => `inquiries:${leadId}`,
}
