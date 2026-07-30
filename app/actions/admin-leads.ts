'use server'

import { getDb } from '@/lib/db'
import { lead } from '@/lib/db/schema'
import { requireAdmin, requireEditor } from '@/lib/rbac'
import { and, asc, desc, eq, ilike, or, sql, type SQL } from 'drizzle-orm'

const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'converted', 'lost'] as const
type LeadStatus = (typeof LEAD_STATUSES)[number]

// Columns that are safe to sort by (whitelist prevents SQL injection via column name)
const SORTABLE_COLUMNS = {
  id: lead.id,
  fullName: lead.fullName,
  email: lead.email,
  phoneNumber: lead.phoneNumber,
  locality: lead.locality,
  budgetRange: lead.budgetRange,
  bhkRequirement: lead.bhkRequirement,
  source: lead.source,
  status: lead.status,
  referenceId: lead.referenceId,
  createdAt: lead.createdAt,
  updatedAt: lead.updatedAt,
} as const

export type SortableColumn = keyof typeof SORTABLE_COLUMNS

export interface GetLeadsParams {
  page?: number
  limit?: number
  sortBy?: SortableColumn
  sortDir?: 'asc' | 'desc'
  search?: string
  status?: LeadStatus | 'all'
  locality?: string
}

export interface AdminLead {
  id: number
  fullName: string
  email: string
  phoneNumber: string
  locality: string | null
  budgetRange: string | null
  bhkRequirement: string | null
  source: string
  status: string
  referenceId: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface GetLeadsResult {
  success: boolean
  data: AdminLead[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
  role: 'viewer' | 'editor'
  error?: string
}

export async function getAdminLeads(params: GetLeadsParams = {}): Promise<GetLeadsResult> {
  const admin = await requireAdmin()
  const db = getDb()

  const page = Math.max(1, params.page ?? 1)
  const limit = Math.min(100, Math.max(1, params.limit ?? 10))
  const offset = (page - 1) * limit

  const sortBy: SortableColumn = params.sortBy && SORTABLE_COLUMNS[params.sortBy] ? params.sortBy : 'createdAt'
  const sortDir = params.sortDir === 'asc' ? 'asc' : 'desc'

  // Build filter conditions
  const conditions: SQL[] = []

  if (params.search && params.search.trim()) {
    const term = `%${params.search.trim()}%`
    const searchCondition = or(
      ilike(lead.fullName, term),
      ilike(lead.email, term),
      ilike(lead.phoneNumber, term),
      ilike(lead.referenceId, term),
      ilike(lead.locality, term)
    )
    if (searchCondition) conditions.push(searchCondition)
  }

  if (params.status && params.status !== 'all') {
    conditions.push(eq(lead.status, params.status))
  }

  if (params.locality && params.locality.trim()) {
    conditions.push(ilike(lead.locality, `%${params.locality.trim()}%`))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const orderColumn = SORTABLE_COLUMNS[sortBy]
  const orderBy = sortDir === 'asc' ? asc(orderColumn) : desc(orderColumn)

  const [rows, countResult] = await Promise.all([
    db.select().from(lead).where(whereClause).orderBy(orderBy).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(lead).where(whereClause),
  ])

  const total = countResult[0]?.count ?? 0

  return {
    success: true,
    role: admin.role,
    data: rows.map((r) => ({
      id: r.id,
      fullName: r.fullName,
      email: r.email,
      phoneNumber: r.phoneNumber,
      locality: r.locality,
      budgetRange: r.budgetRange,
      bhkRequirement: r.bhkRequirement,
      source: r.source,
      status: r.status,
      referenceId: r.referenceId,
      notes: r.notes,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })),
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  }
}

// Fields an editor is allowed to modify inline
const EDITABLE_FIELDS = new Set([
  'fullName',
  'email',
  'phoneNumber',
  'locality',
  'budgetRange',
  'bhkRequirement',
  'source',
  'status',
  'notes',
])

export async function updateLead(
  id: number,
  patch: Partial<Record<string, string | null>>
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireEditor()
    const db = getDb()

    const updates: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(patch)) {
      if (EDITABLE_FIELDS.has(key)) {
        if (key === 'status' && value && !LEAD_STATUSES.includes(value as LeadStatus)) {
          return { success: false, error: `Invalid status: ${value}` }
        }
        updates[key] = value
      }
    }

    if (Object.keys(updates).length === 0) {
      return { success: false, error: 'No valid fields to update' }
    }

    updates.updatedAt = new Date()

    await db.update(lead).set(updates).where(eq(lead.id, id))
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error)?.message || 'Update failed' }
  }
}

export async function deleteLead(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    await requireEditor()
    const db = getDb()
    await db.delete(lead).where(eq(lead.id, id))
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error)?.message || 'Delete failed' }
  }
}
