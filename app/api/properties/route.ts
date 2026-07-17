import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Fallback data for when database is not available
const FALLBACK_PROPERTIES = [
  {
    id: 1,
    title: 'The Prestige City',
    locality: 'Sarjapur Road',
    builderId: 1,
    address: 'Sarjapur Road, Bangalore',
    minPrice: 7500000,
    maxPrice: 15000000,
    bhkOptions: '2,3,4',
    status: 'available',
    reraNumber: 'PRM/KA/RERA/1251',
    description: 'Luxury 2, 3, and 4 BHK apartments',
    amenities: 'Swimming pool, Gym, Clubhouse, Landscaped gardens, 24/7 Security',
    totalUnits: 120,
    soldUnits: 25,
    city: 'Bangalore',
    imageUrl: '/property-1.png'
  },
  {
    id: 2,
    title: 'Brigade Orchards',
    locality: 'Devanahalli',
    builderId: 2,
    address: 'Devanahalli, Bangalore',
    minPrice: 6000000,
    maxPrice: 12000000,
    bhkOptions: '1,2,3',
    status: 'available',
    reraNumber: 'PRM/KA/RERA/1389',
    description: 'Ready to Move 1, 2, and 3 BHK units',
    amenities: 'Jogging track, Kids play area, Meditation center, Power backup, Water purification',
    totalUnits: 200,
    soldUnits: 80,
    city: 'Bangalore',
    imageUrl: '/property-2.png'
  },
  {
    id: 3,
    title: 'Sobha City',
    locality: 'Whitefield',
    builderId: 3,
    address: 'Whitefield, Bangalore',
    minPrice: 12000000,
    maxPrice: 30000000,
    bhkOptions: '2,3,4',
    status: 'available',
    reraNumber: 'PRM/KA/RERA/1102',
    description: 'New Launch luxury residential project',
    amenities: 'Smart homes, Solar panels, Rainwater harvesting, Yoga studio, Gaming zone',
    totalUnits: 150,
    soldUnits: 15,
    city: 'Bangalore',
    imageUrl: '/property-3.png'
  },
]

export async function GET(req: NextRequest) {
  try {
    // Try to use database if available
    try {
      const { searchPropertiesSchema } = await import('@/lib/validations')
      const { getDb } = await import('@/lib/db')
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

      if (validated.minBudget) {
        filters.push(lte(property.minPrice, validated.maxBudget))
      }

      if (validated.maxBudget) {
        filters.push(gte(property.maxPrice, validated.minBudget))
      }

      if (validated.builderId !== undefined) {
        filters.push(eq(property.builderId, validated.builderId))
      }

      const offset = (validated.page - 1) * validated.limit

      const result = await getDb()
        .select()
        .from(property)
        .where(and(...filters))
        .orderBy(desc(property.createdAt))
        .limit(validated.limit)
        .offset(offset)

      // Get total count for pagination
      const countResult = await getDb()
        .select({
          total: count(),
        })
        .from(property)
        .where(and(...filters))

      if (countResult[0].total === 0) {
        throw new Error("Testing database fallback");
      }

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
      console.warn('[GET /api/properties] Database not available, using fallback:', dbError)

      // Fallback to sample data if database is not configured
      const searchParams = req.nextUrl.searchParams
      let properties = FALLBACK_PROPERTIES

      // Apply simple filtering on fallback data
      const locality = searchParams.get('locality')
      const localities = locality ? locality.split(',') : []
      // 2. Filter the properties array using .some()
      if (localities.length > 0) {
        properties = properties.filter((p) => {
          // Return true if the property's locality matches ANY of the selected localities
          return localities.some((loc) =>
            p.locality?.toLowerCase().includes(loc.toLowerCase())
          )
        })
      }

      const totalPages = Math.ceil(properties.length / 20)
      return NextResponse.json({
        success: true,
        data: properties,
        pagination: {
          page: 1,
          limit: 20,
          total: properties.length,
          totalPages,
          hasNext: false,
          hasPrev: false,
        },
        fromCache: false,
        fallback: true,
      })
    }
  } catch (error) {
    console.error('[GET /api/properties] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
