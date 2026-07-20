import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Fallback data for when database is not available
const FALLBACK_BUILDERS = [
  {
    id: 1,
    name: 'Prestige Group',
    description: "India's most trusted luxury developer with 60+ projects delivered",
    website: 'https://prestigeproperty.com',
    email: 'info@prestigeproperty.com',
    phoneNumber: '+91-80-40616666',
    totalProjects: 60,
    tier: 'tier1',
    isVerified: true,
    established: 1992,
  },
  {
    id: 2,
    name: 'Brigade Group',
    description: 'Redefining urban living in South India with 250+ projects',
    website: 'https://brigadegroup.com',
    email: 'sales@brigadegroup.com',
    phoneNumber: '+91-80-67616666',
    totalProjects: 250,
    tier: 'tier1',
    isVerified: true,
    established: 1993,
  },
  {
    id: 3,
    name: 'Sobha Limited',
    description: 'Backward integration quality leader with 100+ projects delivered',
    website: 'https://sobharealty.com',
    email: 'info@sobharealty.com',
    phoneNumber: '+91-80-25716666',
    totalProjects: 100,
    tier: 'tier1',
    isVerified: true,
    established: 1995,
  },
  {
    id: 4,
    name: 'Godrej Properties',
    description: 'Premium developer known for sustainability and innovation',
    website: 'https://godrejproperties.com',
    email: 'enquiry@godrejproperties.com',
    phoneNumber: '+91-22-61151111',
    totalProjects: 85,
    tier: 'tier1',
    isVerified: true,
    established: 1999,
  },
  {
    id: 5,
    name: 'Puravankara',
    description: 'Developer of premium residential and commercial properties',
    website: 'https://puravankara.com',
    email: 'info@puravankara.com',
    phoneNumber: '+91-80-40156666',
    totalProjects: 60,
    tier: 'tier1',
    isVerified: true,
    established: 2000,
  },
  {
    id: 6,
    name: 'Embassy Group',
    description: 'Mixed-use development leader with iconic projects',
    website: 'https://embassygroup.com',
    email: 'sales@embassygroup.com',
    phoneNumber: '+91-80-46666666',
    totalProjects: 45,
    tier: 'tier1',
    isVerified: true,
    established: 2000,
  },
]

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const searchParams = req.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))
    const offset = (page - 1) * limit

    // Try to use database if available
    try {
      const { getDb } = await import('@/lib/db')
      const { builder } = await import('@/lib/db/schema')
      const { rateLimit, rateLimitConfigs } = await import('@/lib/rate-limit')
      const { cache, cacheKeys } = await import('@/lib/cache')
      const { desc } = await import('drizzle-orm')

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
          fromCache: true
        })
      }

      // Get total count
      const countResult = await getDb()
        .select({ count: builder.id })
        .from(builder)

      const total = countResult.length
      const totalPages = Math.ceil(total / limit)

      // Get paginated results
      const result = await getDb()
        .select()
        .from(builder)
        .orderBy(desc(builder.totalProjects))
        .limit(limit)
        .offset(offset)

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

      if (result.length === 0) {
        throw new Error("No builders found in database");
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
      console.warn('[GET /api/builders] Database not available, using fallback:', dbError)
      const total = FALLBACK_BUILDERS.length
      const totalPages = Math.ceil(total / limit)
      const paginatedData = FALLBACK_BUILDERS.slice(offset, offset + limit)

      return NextResponse.json({
        success: true,
        fromCache: false,
        data: paginatedData,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        fallback: true,
      })
    }
  } catch (error) {
    console.error('[GET /api/builders] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
