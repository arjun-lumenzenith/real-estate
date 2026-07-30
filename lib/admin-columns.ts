import type { SortableColumn } from '@/app/actions/admin-leads'

export type ColumnKey =
  | 'referenceId'
  | 'fullName'
  | 'email'
  | 'phoneNumber'
  | 'locality'
  | 'budgetRange'
  | 'bhkRequirement'
  | 'source'
  | 'status'
  | 'notes'
  | 'createdAt'
  | 'updatedAt'

export interface ColumnDef {
  key: ColumnKey
  label: string
  sortable: boolean
  sortKey?: SortableColumn
  editable: boolean
  /** Rendering / editing hint */
  type: 'text' | 'email' | 'tel' | 'status' | 'notes' | 'datetime'
  defaultVisible: boolean
}

export const ALL_COLUMNS: ColumnDef[] = [
  { key: 'referenceId', label: 'Ref ID', sortable: true, sortKey: 'referenceId', editable: false, type: 'text', defaultVisible: true },
  { key: 'fullName', label: 'Name', sortable: true, sortKey: 'fullName', editable: true, type: 'text', defaultVisible: true },
  { key: 'email', label: 'Email', sortable: true, sortKey: 'email', editable: true, type: 'email', defaultVisible: true },
  { key: 'phoneNumber', label: 'Phone', sortable: true, sortKey: 'phoneNumber', editable: true, type: 'tel', defaultVisible: true },
  { key: 'locality', label: 'Locality', sortable: true, sortKey: 'locality', editable: true, type: 'text', defaultVisible: true },
  { key: 'budgetRange', label: 'Budget', sortable: true, sortKey: 'budgetRange', editable: true, type: 'text', defaultVisible: true },
  { key: 'bhkRequirement', label: 'BHK', sortable: true, sortKey: 'bhkRequirement', editable: true, type: 'text', defaultVisible: true },
  { key: 'status', label: 'Status', sortable: true, sortKey: 'status', editable: true, type: 'status', defaultVisible: true },
  { key: 'source', label: 'Source', sortable: true, sortKey: 'source', editable: true, type: 'text', defaultVisible: false },
  { key: 'notes', label: 'Notes', sortable: false, editable: true, type: 'notes', defaultVisible: false },
  { key: 'createdAt', label: 'Created', sortable: true, sortKey: 'createdAt', editable: false, type: 'datetime', defaultVisible: true },
  { key: 'updatedAt', label: 'Updated', sortable: true, sortKey: 'updatedAt', editable: false, type: 'datetime', defaultVisible: false },
]

export const COLUMN_MAP: Record<ColumnKey, ColumnDef> = ALL_COLUMNS.reduce(
  (acc, col) => {
    acc[col.key] = col
    return acc
  },
  {} as Record<ColumnKey, ColumnDef>
)

export const DEFAULT_ORDER: ColumnKey[] = ALL_COLUMNS.map((c) => c.key)
export const DEFAULT_VISIBLE: Record<ColumnKey, boolean> = ALL_COLUMNS.reduce(
  (acc, col) => {
    acc[col.key] = col.defaultVisible
    return acc
  },
  {} as Record<ColumnKey, boolean>
)

export const LEAD_STATUS_OPTIONS = ['new', 'contacted', 'qualified', 'converted', 'lost'] as const

export const STORAGE_KEY = 'admin-leads-column-prefs-v1'

export interface ColumnPrefs {
  order: ColumnKey[]
  visible: Record<ColumnKey, boolean>
}

/**
 * Merge stored prefs with the canonical column set so that newly added
 * columns still appear (appended) and removed columns are dropped.
 */
export function reconcilePrefs(stored: Partial<ColumnPrefs> | null): ColumnPrefs {
  const validKeys = new Set(DEFAULT_ORDER)

  let order: ColumnKey[] = []
  if (stored?.order && Array.isArray(stored.order)) {
    order = stored.order.filter((k): k is ColumnKey => validKeys.has(k as ColumnKey))
  }
  // Append any canonical columns missing from stored order.
  for (const key of DEFAULT_ORDER) {
    if (!order.includes(key)) order.push(key)
  }

  const visible: Record<ColumnKey, boolean> = { ...DEFAULT_VISIBLE }
  if (stored?.visible) {
    for (const key of DEFAULT_ORDER) {
      if (typeof stored.visible[key] === 'boolean') visible[key] = stored.visible[key]
    }
  }

  return { order, visible }
}
