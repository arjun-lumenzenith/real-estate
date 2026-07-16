import { kv } from '@vercel/kv'

export interface RateLimitConfig {
  limit: number // Maximum requests
  window: number // Time window in seconds
}

const DEFAULT_CONFIG: RateLimitConfig = {
  limit: 100,
  window: 60,
}

export async function rateLimit(
  identifier: string,
  config?: Partial<RateLimitConfig>
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const key = `ratelimit:${identifier}`

  try {
    const current = await kv.get<number>(key)
    const count = (current || 0) as number

    if (count >= finalConfig.limit) {
      const ttl = await kv.ttl(key)
      return {
        success: false,
        remaining: 0,
        resetTime: ttl > 0 ? ttl : finalConfig.window,
      }
    }

    // Increment and set expiry on first request
    if (count === 0) {
      await kv.setex(key, finalConfig.window, 1)
    } else {
      await kv.incr(key)
    }

    return {
      success: true,
      remaining: finalConfig.limit - count - 1,
      resetTime: finalConfig.window,
    }
  } catch (error) {
    console.error(`[RateLimit] Error for identifier ${identifier}:`, error)
    // Fail open - allow request on error
    return {
      success: true,
      remaining: finalConfig.limit,
      resetTime: finalConfig.window,
    }
  }
}

// Predefined rate limit configurations
export const rateLimitConfigs = {
  api: { limit: 1000, window: 60 }, // 1000 requests per minute
  lead: { limit: 10, window: 60 }, // 10 leads per minute
  search: { limit: 100, window: 60 }, // 100 searches per minute
  auth: { limit: 5, window: 300 }, // 5 auth attempts per 5 minutes
}
