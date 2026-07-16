'use server'

import { getDb } from '@/lib/db'
import { property, builder } from '@/lib/db/schema'
import {
  createPropertySchema,
  updatePropertySchema,
  searchPropertiesSchema,
  type SearchPropertiesInput,
} from '@/lib/validations'
import { cache, cacheKeys } from '@/lib/cache'
import { eq, and, like, between, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'

export async function searchProperties(input: SearchPropertiesInput) {
  try {
    const validated = searchPropertiesSchema.parse(input)
    const cacheKey = cacheKeys.properties(validated.locality, String(validated.minBudget))

    // Try cache first
    const cachedProperties = await cache.get(cacheKey)
    if (cachedProperties) {
      return { success: true, data: cachedProperties }
    }

    let query = getDb().select().from(property)

    // Apply filters
    const filters = [eq(property.status, 'available')]

    if (validated.locality) {
      filters.push(like(property.locality, `%${validated.locality}%`))
    }

    if (validated.minBudget || validated.maxBudget) {
      filters.push(
        between(
          property.minPrice,
          validated.minBudget || 0,
          validated.maxBudget || Number.MAX_SAFE_INTEGER
        )
      )
    }

    if (validated.bhkType) {
      filters.push(like(property.bhkTypes, `%${validated.bhkType}%`))
    }

    if (validated.builderId) {
      filters.push(eq(property.builderId, validated.builderId))
    }

    const offset = (validated.page - 1) * validated.limit

    const result = await query
      .where(and(...filters))
      .orderBy(desc(property.createdAt))
      .limit(validated.limit)
      .offset(offset)

    // Cache for 1 hour
    await cache.set(cacheKey, result, { ttl: 3600 })

    return { success: true, data: result }
  } catch (error) {
    console.error('[searchProperties] Error:', error)
    throw error
  }
}

export async function getProperty(id: string) {
  try {
    const cacheKey = cacheKeys.property(id)

    // Try cache first
    const cachedProperty = await cache.get(cacheKey)
    if (cachedProperty) {
      return { success: true, data: cachedProperty }
    }

    const result = await db
      .select()
      .from(properties)
      .where(eq(properties.id, id))

    if (!result.length) {
      throw new Error('Property not found')
    }

    // Cache for 1 hour
    await cache.set(cacheKey, result[0], { ttl: 3600 })

    return { success: true, data: result[0] }
  } catch (error) {
    console.error('[getProperty] Error:', error)
    throw error
  }
}

export async function getPropertyWithBuilder(id: string) {
  try {
    const cacheKey = `property:detailed:${id}`

    // Try cache first
    const cached = await cache.get(cacheKey)
    if (cached) {
      return { success: true, data: cached }
    }

    const result = await db
      .select()
      .from(properties)
      .where(eq(properties.id, id))

    if (!result.length) {
      throw new Error('Property not found')
    }

    const prop = result[0]

    // Get builder info
    const builderResult = await db
      .select()
      .from(builder)
      .where(eq(builder.id, prop.builderId))

    const combined = {
      ...prop,
      builder: builderResult[0] || null,
    }

    // Cache for 1 hour
    await cache.set(cacheKey, combined, { ttl: 3600 })

    return { success: true, data: combined }
  } catch (error) {
    console.error('[getPropertyWithBuilder] Error:', error)
    throw error
  }
}

export async function getFeaturedProperties() {
  try {
    const cacheKey = 'featured:properties'

    // Try cache first
    const cached = await cache.get(cacheKey)
    if (cached) {
      return { success: true, data: cached }
    }

    const result = await db
      .select()
      .from(property)
      .where(eq(property.status, 'available'))
      .orderBy(desc(property.createdAt))
      .limit(3)

    // Cache for 24 hours
    await cache.set(cacheKey, result, { ttl: 86400 })

    return { success: true, data: result }
  } catch (error) {
    console.error('[getFeaturedProperties] Error:', error)
    throw error
  }
}

export async function getPropertiesByLocality(locality: string) {
  try {
    const cacheKey = `properties:locality:${locality.toLowerCase()}`

    // Try cache first
    const cached = await cache.get(cacheKey)
    if (cached) {
      return { success: true, data: cached }
    }

    const result = await db
      .select()
      .from(property)
      .where(
        and(
          eq(property.status, 'available'),
          like(property.locality, `%${locality}%`)
        )
      )
      .orderBy(desc(property.createdAt))
      .limit(20)

    // Cache for 1 hour
    await cache.set(cacheKey, result, { ttl: 3600 })

    return { success: true, data: result }
  } catch (error) {
    console.error('[getPropertiesByLocality] Error:', error)
    throw error
  }
}
