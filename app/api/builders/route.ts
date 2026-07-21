import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const searchParams = req.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))
    const offset = (page - 1) * limit

    // Try to use database if available
    try {
      const { getDb, withDbRetry } = await import('@/lib/db')
      const { builder } = await import('@/lib/db/schema')
      const { rateLimit, rateLimitConfigs } = await import('@/lib/rate-limit')
      const { cache, cacheKeys } = await import('@/lib/cache')
      const { desc, count } = await import('drizzle-orm')

      // Rate limit
      const rateLimitResult = await rateLimit(`api:${ip}`, rateLimitConfigs.search)
      if (!rateLimitResult.success) {
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          {
            status: 429,
            headers: {
              'X-RateLimit-Remaining': String(rateLimitResult.remaining),
              'X-RateLimit-Reset': String(rateLimitResult.resetTime),
            },
          }
        )
      }

      const cacheKey = cacheKeys.builders(
        String(page),
        String(limit)
      );

      // Try cache first
      const cached = await cache.get(cacheKey)
      if (cached) {
        return NextResponse.json({
          success: true,
          data: cached.data,
          pagination: cached.pagination,
          fromCache: true,
        })
      }
      
      // Get total count
      const countResult = await withDbRetry(() =>
        getDb()
          .select({ count: builder.id })
          .from(builder)
      )

      const total = countResult.length
      const totalPages = Math.ceil(total / limit)

      // Get paginated results
      const result = await withDbRetry(() =>
        getDb()
          .select()
          .from(builder)
          .orderBy(desc(builder.totalProjects))
          .limit(limit)
          .offset(offset)
      )

      if (result.length === 0 && page > 1) {
        return NextResponse.json({
          success: true,
          fromCache: false,
          data: [],
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: false,
            hasPrev: page > 1,
          },
        })
      }

      const response = {
        success: true,
        fromCache: false,
        data: result,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        }
      }

      // Cache for 1 hour
      await cache.set(cacheKey, response, { ttl: 3600 })

      return NextResponse.json(response)
    } catch (dbError) {
      console.error('[GET /api/builders] Database unavailable :', dbError)
      return NextResponse.json(
        {
          error: 'Builder search is temporarily unavailable',
        },
        {
          status: 503,
        }
      )
    }
  } catch (error) {
    console.error('[GET /api/builders] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
