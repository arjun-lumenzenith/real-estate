'use server'

import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { lead, inquiry } from '@/lib/db/schema'
import { createLeadSchema, updateLeadSchema, type CreateLeadInput, type UpdateLeadInput } from '@/lib/validations'
import { cache, cacheKeys } from '@/lib/cache'
import { eq, and, desc } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function createLead(input: CreateLeadInput) {
  try {
    const userId = await getUserId()
    const validated = createLeadSchema.parse(input)

    const referenceId = `REF-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`

    const result = await db
      .insert(lead)
      .values({
        id: uuidv4(),
        userId,
        ...validated,
        referenceId,
        status: 'new',
      })
      .returning()

    // Invalidate cache
    await cache.delete(cacheKeys.leads(userId))

    revalidatePath('/dashboard/leads')

    return {
      success: true,
      data: result[0],
      referenceId,
    }
  } catch (error) {
    console.error('[createLead] Error:', error)
    throw error
  }
}

export async function getLeads(page: number = 1, limit: number = 20) {
  try {
    const userId = await getUserId()
    const cacheKey = cacheKeys.leads(userId)

    // Try cache first
    let cachedLeads = await cache.get(cacheKey)
    if (cachedLeads) {
      return { success: true, data: cachedLeads as typeof leads.$inferSelect[] }
    }

    const offset = (page - 1) * limit

    const result = await db
      .select()
      .from(lead)
      .where(eq(lead.userId, userId))
      .orderBy(desc(lead.createdAt))
      .limit(limit)
      .offset(offset)

    // Cache for 5 minutes
    await cache.set(cacheKey, result, { ttl: 300 })

    return { success: true, data: result }
  } catch (error) {
    console.error('[getLeads] Error:', error)
    throw error
  }
}

export async function getLead(id: string) {
  try {
    const userId = await getUserId()
    const cacheKey = cacheKeys.lead(id)

    // Try cache first
    let cachedLead = await cache.get(cacheKey)
    if (cachedLead) {
      return { success: true, data: cachedLead }
    }

    const result = await db
      .select()
      .from(lead)
      .where(and(eq(lead.id, id), eq(lead.userId, userId)))

    if (!result.length) {
      throw new Error('Lead not found')
    }

    // Cache for 5 minutes
    await cache.set(cacheKey, result[0], { ttl: 300 })

    return { success: true, data: result[0] }
  } catch (error) {
    console.error('[getLead] Error:', error)
    throw error
  }
}

export async function updateLead(id: string, input: UpdateLeadInput) {
  try {
    const userId = await getUserId()
    const validated = updateLeadSchema.parse(input)

    const result = await db
      .update(lead)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(and(eq(lead.id, id), eq(lead.userId, userId)))
      .returning()

    if (!result.length) {
      throw new Error('Lead not found')
    }

    // Invalidate cache
    await cache.delete(cacheKeys.lead(id))
    await cache.delete(cacheKeys.leads(userId))

    revalidatePath(`/dashboard/leads/${id}`)
    revalidatePath('/dashboard/leads')

    return { success: true, data: result[0] }
  } catch (error) {
    console.error('[updateLead] Error:', error)
    throw error
  }
}

export async function deleteLead(id: string) {
  try {
    const userId = await getUserId()

    // Delete related inquiries first
    await getDb().delete(inquiry).where(eq(inquiry.leadId, id))

    // Delete lead
    const result = await db
      .delete(lead)
      .where(and(eq(lead.id, id), eq(lead.userId, userId)))
      .returning()

    if (!result.length) {
      throw new Error('Lead not found')
    }

    // Invalidate cache
    await cache.delete(cacheKeys.lead(id))
    await cache.delete(cacheKeys.leads(userId))

    revalidatePath('/dashboard/leads')

    return { success: true }
  } catch (error) {
    console.error('[deleteLead] Error:', error)
    throw error
  }
}

export async function getLeadInquiries(leadId: string) {
  try {
    const userId = await getUserId()

    // Verify lead belongs to user
    const leadCheck = await db
      .select()
      .from(lead)
      .where(and(eq(lead.id, leadId), eq(lead.userId, userId)))

    if (!leadCheck.length) {
      throw new Error('Lead not found')
    }

    const result = await db
      .select()
      .from(inquiry)
      .where(eq(inquiry.leadId, leadId))
      .orderBy(desc(inquiry.createdAt))

    return { success: true, data: result }
  } catch (error) {
    console.error('[getLeadInquiries] Error:', error)
    throw error
  }
}
