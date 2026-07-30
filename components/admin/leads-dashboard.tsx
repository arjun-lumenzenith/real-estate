'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  getAdminLeads,
  deleteLead,
  type AdminLead,
  type SortableColumn,
} from '@/app/actions/admin-leads'
import { authClient } from '@/lib/auth-client'
import {
  ALL_COLUMNS,
  COLUMN_MAP,
  DEFAULT_ORDER,
  DEFAULT_VISIBLE,
  STORAGE_KEY,
  LEAD_STATUS_OPTIONS,
  reconcilePrefs,
  type ColumnKey,
} from '@/lib/admin-columns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/pagination'
import { EditLeadDialog } from '@/components/admin/edit-lead-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Search,
  SlidersHorizontal,
  Pencil,
  Trash2,
  LogOut,
  RotateCcw,
  GripVertical,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Eye,
} from 'lucide-react'

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface LeadsDashboardProps {
  initialData: AdminLead[]
  initialPagination: Pagination
  role: 'viewer' | 'editor'
  admin: { name: string; email: string }
}

const PAGE_SIZE = 10
const STATUS_STYLES: Record<string, string> = {
  new: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  contacted: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  qualified: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  converted: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  lost: 'bg-red-500/15 text-red-400 border-red-500/30',
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export function LeadsDashboard({ initialData, initialPagination, role, admin }: LeadsDashboardProps) {
  const router = useRouter()
  const isEditor = role === 'editor'

  // ---- Data / query state ----
  const [leads, setLeads] = useState<AdminLead[]>(initialData)
  const [pagination, setPagination] = useState<Pagination>(initialPagination)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [localityFilter, setLocalityFilter] = useState('')
  const [sortBy, setSortBy] = useState<SortableColumn>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  // ---- Column preference state (persisted to localStorage) ----
  const [order, setOrder] = useState<ColumnKey[]>(DEFAULT_ORDER)
  const [visible, setVisible] = useState<Record<ColumnKey, boolean>>(DEFAULT_VISIBLE)
  const [prefsLoaded, setPrefsLoaded] = useState(false)

  // ---- Edit / delete state ----
  const [editingLead, setEditingLead] = useState<AdminLead | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminLead | null>(null)
  const [deleting, setDeleting] = useState(false)

  const dragKey = useRef<ColumnKey | null>(null)

  // Load persisted column prefs on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : null
      const reconciled = reconcilePrefs(parsed)
      setOrder(reconciled.order)
      setVisible(reconciled.visible)
    } catch {
      // ignore malformed storage
    } finally {
      setPrefsLoaded(true)
    }
  }, [])

  // Persist column prefs whenever they change (after initial load).
  useEffect(() => {
    if (!prefsLoaded) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ order, visible }))
    } catch {
      // ignore quota errors
    }
  }, [order, visible, prefsLoaded])

  const fetchData = useCallback(
    async (opts: {
      page: number
      search: string
      status: string
      locality: string
      sortBy: SortableColumn
      sortDir: 'asc' | 'desc'
    }) => {
      setLoading(true)
      try {
        const res = await getAdminLeads({
          page: opts.page,
          limit: PAGE_SIZE,
          search: opts.search,
          status: opts.status as never,
          locality: opts.locality,
          sortBy: opts.sortBy,
          sortDir: opts.sortDir,
        })
        if (res.success) {
          setLeads(res.data)
          setPagination(res.pagination)
        }
      } catch (err) {
        console.error('[v0] admin leads fetch error:', err)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // Debounced refetch on query changes. Skip the very first render since the
  // server already provided page 1.
  const isInitialMount = useRef(true)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    const t = setTimeout(() => {
      fetchData({ page, search, status: statusFilter, locality: localityFilter, sortBy, sortDir })
    }, 300)
    return () => clearTimeout(t)
  }, [page, search, statusFilter, localityFilter, sortBy, sortDir, fetchData])

  const refresh = useCallback(() => {
    fetchData({ page, search, status: statusFilter, locality: localityFilter, sortBy, sortDir })
  }, [fetchData, page, search, statusFilter, localityFilter, sortBy, sortDir])

  // ---- Handlers ----
  const handleSort = (key: ColumnKey) => {
    const col = COLUMN_MAP[key]
    if (!col.sortable || !col.sortKey) return
    if (sortBy === col.sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(col.sortKey)
      setSortDir(col.type === 'datetime' ? 'desc' : 'asc')
    }
    setPage(1)
  }

  const resetToFirstPage = () => setPage(1)

  const toggleColumn = (key: ColumnKey) => {
    setVisible((v) => {
      const next = { ...v, [key]: !v[key] }
      // Guard against hiding every column.
      const anyVisible = DEFAULT_ORDER.some((k) => next[k])
      return anyVisible ? next : v
    })
  }

  const resetPrefs = () => {
    setOrder(DEFAULT_ORDER)
    setVisible(DEFAULT_VISIBLE)
  }

  // Drag-and-drop column reordering on the header row.
  const handleDragStart = (key: ColumnKey) => {
    dragKey.current = key
  }
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }
  const handleDrop = (targetKey: ColumnKey) => {
    const from = dragKey.current
    dragKey.current = null
    if (!from || from === targetKey) return
    setOrder((prev) => {
      const next = [...prev]
      const fromIdx = next.indexOf(from)
      const toIdx = next.indexOf(targetKey)
      if (fromIdx === -1 || toIdx === -1) return prev
      next.splice(fromIdx, 1)
      next.splice(toIdx, 0, from)
      return next
    })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const res = await deleteLead(deleteTarget.id)
    setDeleting(false)
    if (res.success) {
      setDeleteTarget(null)
      refresh()
    }
  }

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const orderedVisibleColumns = order.filter((k) => visible[k])
  const visibleCount = orderedVisibleColumns.length

  const renderCell = (lead: AdminLead, key: ColumnKey) => {
    const value = lead[key as keyof AdminLead]
    const col = COLUMN_MAP[key]
    if (key === 'status') {
      const s = String(value)
      return (
        <Badge variant="outline" className={`capitalize ${STATUS_STYLES[s] ?? ''}`}>
          {s}
        </Badge>
      )
    }
    if (col.type === 'datetime' && value) {
      return <span className="whitespace-nowrap text-muted-foreground">{formatDateTime(String(value))}</span>
    }
    if (key === 'notes' && value) {
      return <span className="line-clamp-2 max-w-xs text-muted-foreground">{String(value)}</span>
    }
    if (value === null || value === '' || value === undefined) {
      return <span className="text-muted-foreground/50">—</span>
    }
    return <span>{String(value)}</span>
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-card/40">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold leading-tight">Leads Admin</h1>
              <p className="text-sm text-muted-foreground">
                {admin.name || admin.email}
                <Badge
                  variant="outline"
                  className={`ml-2 gap-1 ${isEditor ? 'border-emerald-500/40 text-emerald-400' : 'border-border text-muted-foreground'}`}
                >
                  {isEditor ? <Pencil className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {isEditor ? 'Editor' : 'Read-only'}
                </Badge>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button render={<Link href="/" target="_blank" />} nativeButton={false} variant="outline" size="sm">
              <ExternalLink className="mr-1.5 h-4 w-4" />
              View site
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-1.5 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  resetToFirstPage()
                }}
                placeholder="Search name, email, phone, ref…"
                className="pl-9"
                aria-label="Search leads"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v)
                resetToFirstPage()
              }}
            >
              <SelectTrigger className="sm:w-40" aria-label="Filter by status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {LEAD_STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={localityFilter}
              onChange={(e) => {
                setLocalityFilter(e.target.value)
                resetToFirstPage()
              }}
              placeholder="Locality"
              className="sm:w-40"
              aria-label="Filter by locality"
            />
          </div>

          {/* Column controls */}
          <Popover>
            <PopoverTrigger render={<Button variant="outline" size="sm" />}>
              <SlidersHorizontal className="mr-1.5 h-4 w-4" />
              Columns
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">Toggle &amp; reorder</p>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={resetPrefs}>
                  <RotateCcw className="mr-1 h-3 w-3" />
                  Reset
                </Button>
              </div>
              <p className="mb-2 text-xs text-muted-foreground">
                Drag the table headers to reorder. Toggle visibility below.
              </p>
              <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
                {order.map((key) => (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                  >
                    <Checkbox checked={visible[key]} onCheckedChange={() => toggleColumn(key)} />
                    {COLUMN_MAP[key].label}
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Table */}
        <div className="relative overflow-x-auto rounded-lg border border-border/60 bg-card/30">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
              <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
            </div>
          )}
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                {orderedVisibleColumns.map((key) => {
                  const col = COLUMN_MAP[key]
                  const isSorted = col.sortKey === sortBy
                  return (
                    <th
                      key={key}
                      draggable
                      onDragStart={() => handleDragStart(key)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(key)}
                      scope="col"
                      className="group whitespace-nowrap px-3 py-2.5 text-left font-medium"
                    >
                      <div className="flex items-center gap-1">
                        <GripVertical
                          className="h-3.5 w-3.5 cursor-grab text-muted-foreground/40 group-hover:text-muted-foreground"
                          aria-hidden="true"
                        />
                        {col.sortable ? (
                          <button
                            type="button"
                            onClick={() => handleSort(key)}
                            className="inline-flex items-center gap-1 hover:text-primary"
                          >
                            {col.label}
                            {isSorted ? (
                              sortDir === 'asc' ? (
                                <ArrowUp className="h-3.5 w-3.5" />
                              ) : (
                                <ArrowDown className="h-3.5 w-3.5" />
                              )
                            ) : (
                              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/40" />
                            )}
                          </button>
                        ) : (
                          <span>{col.label}</span>
                        )}
                      </div>
                    </th>
                  )
                })}
                {isEditor && (
                  <th scope="col" className="whitespace-nowrap px-3 py-2.5 text-right font-medium">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && !loading ? (
                <tr>
                  <td colSpan={visibleCount + (isEditor ? 1 : 0)} className="px-3 py-12 text-center text-muted-foreground">
                    No leads found.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-border/40 last:border-0 hover:bg-muted/30">
                    {orderedVisibleColumns.map((key) => (
                      <td key={key} className="px-3 py-2.5 align-top">
                        {renderCell(lead, key)}
                      </td>
                    ))}
                    {isEditor && (
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingLead(lead)
                              setEditOpen(true)
                            }}
                            aria-label={`Edit ${lead.fullName}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(lead)}
                            aria-label={`Delete ${lead.fullName}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={(p) => setPage(p)}
          isLoading={loading}
        />
      </div>

      {/* Edit dialog (editors only) */}
      {isEditor && (
        <EditLeadDialog
          lead={editingLead}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSaved={refresh}
        />
      )}

      {/* Delete confirmation (editors only) */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete lead?</DialogTitle>
            <DialogDescription>
              This permanently removes{' '}
              <span className="font-medium text-foreground">{deleteTarget?.fullName}</span> (
              {deleteTarget?.referenceId}). This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Deleting…
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
