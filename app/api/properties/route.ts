import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Try to use database if available
    try {
      const { searchPropertiesSchema } = await import('@/lib/validations')
      const { getDb, withDbRetry } = await import('@/lib/db')
      const { property } = await import('@/lib/db/schema')
      const { rateLimit, rateLimitConfigs } = await import('@/lib/rate-limit')
      const { cache, cacheKeys } = await import('@/lib/cache')
      const { eq, like, and, or, gte, lte, desc, count } = await import('drizzle-orm')

      const ip = req.headers.get('x-forwarded-for') || 'unknown'

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

      const searchParams = req.nextUrl.searchParams
      const localityParam = searchParams.get("locality");
      const localities = localityParam ? localityParam.split(",") : [];

      const bhkParam = searchParams.get("bhkType");
      const bhkTypes = bhkParam ? bhkParam.split(",") : [];

      const input = {
        localities,
        bhkTypes,
        minBudget: searchParams.get("minBudget")
          ? Number(searchParams.get("minBudget"))
          : undefined,
        maxBudget: searchParams.get("maxBudget")
          ? Number(searchParams.get("maxBudget"))
          : undefined,
        builderId: searchParams.get('builderId')
          ? Number(searchParams.get('builderId'))
          : undefined,
        page: parseInt(searchParams.get("page") || "1"),
        limit: Math.min(parseInt(searchParams.get("limit") || "20"), 10),
      }

      const validated = searchPropertiesSchema.parse(input)
      const cacheKey = cacheKeys.properties(
        (validated.localities ?? []).sort().join(","),
        (validated.bhkTypes ?? []).sort().join(","),
        String(validated.minBudget ?? ""),
        String(validated.maxBudget ?? ""),
        String(validated.builderId ?? ""),
        String(validated.page),
        String(validated.limit)
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

      // Build query filters
      const filters = [eq(property.status, 'available')]

      // Assuming 'bhkTypes' is your parsed string array: ['2', '3']
      if (bhkTypes && bhkTypes.length > 0) {
        // Create an array of individual 'like' conditions for each selected BHK option
        const bhkConditions = bhkTypes.map((bhk: string) =>
          like(property.bhkOptions, `%${bhk}%`)
        )

        // Wrap them inside an 'or()' statement so it matches ANY of the selected BHK types
        filters.push(or(...bhkConditions))
      }

      // ==========================================
      // 3. DYNAMIC LOCALITY FILTERS (ARRAY)
      // ==========================================
      // Assuming 'localities' is your array: ['Indiranagar', 'Whitefield']
      if (localities && localities.length > 0) {
        // If your column matches exactly, use 'inArray'. 
        // If it's partial text, generate an 'or' block of 'like' clauses:
        const localityConditions = localities.map((loc: string) =>
          like(property.locality, `%${loc}%`)
        )

        filters.push(or(...localityConditions))
      }

      if (validated.maxBudget !== undefined) {
        filters.push(lte(property.minPrice, validated.maxBudget))
      }

      if (validated.minBudget !== undefined) {
        filters.push(gte(property.maxPrice, validated.minBudget))
      }

      if (validated.builderId !== undefined) {
        filters.push(eq(property.builderId, validated.builderId))
      }

      const offset = (validated.page - 1) * validated.limit

      const result = await withDbRetry(() =>
        getDb()
          .select()
          .from(property)
          .where(and(...filters))
          .orderBy(desc(property.createdAt))
          .limit(validated.limit)
          .offset(offset)
      )

      // Get total count for pagination
      const countResult = await withDbRetry(() =>
        getDb()
          .select({
            total: count(),
          })
          .from(property)
          .where(and(...filters))
        )

      const totalPages = Math.ceil(countResult[0].total / validated.limit)
      const response = {
        success: true,
        data: result,
        pagination: {
          page: validated.page,
          limit: validated.limit,
          total: countResult[0].total,
          totalPages,
          hasNext: validated.page < totalPages,
          hasPrev: validated.page > 1,
        },
        fromCache: false,
      }

      // Cache for 1 hour
      await cache.set(cacheKey, response, { ttl: 3600 })

      return NextResponse.json(response)
    } catch (dbError) {
      console.error('[GET /api/properties] Database unavailable :', dbError)
    
      return NextResponse.json(
        {
          error: 'Property search is temporarily unavailable',
        },
        {
          status: 503,
        }
      )
    }
  } catch (error) {
    console.error('[GET /api/properties] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
