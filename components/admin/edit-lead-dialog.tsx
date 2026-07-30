'use client'

import { useState } from 'react'
import type { AdminLead } from '@/app/actions/admin-leads'
import { updateLead } from '@/app/actions/admin-leads'
import { LEAD_STATUS_OPTIONS } from '@/lib/admin-columns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface EditLeadDialogProps {
  lead: AdminLead | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function EditLeadDialog({ lead, open, onOpenChange, onSaved }: EditLeadDialogProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})

  // Sync form when a new lead is opened.
  const leadId = lead?.id
  const [syncedId, setSyncedId] = useState<number | null>(null)
  if (lead && leadId !== syncedId) {
    setForm({
      fullName: lead.fullName ?? '',
      email: lead.email ?? '',
      phoneNumber: lead.phoneNumber ?? '',
      locality: lead.locality ?? '',
      budgetRange: lead.budgetRange ?? '',
      bhkRequirement: lead.bhkRequirement ?? '',
      source: lead.source ?? '',
      status: lead.status ?? 'new',
      notes: lead.notes ?? '',
    })
    setSyncedId(leadId ?? null)
    setError(null)
  }

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleSave = async () => {
    if (!lead) return
    setSaving(true)
    setError(null)
    const res = await updateLead(lead.id, form)
    setSaving(false)
    if (!res.success) {
      setError(res.error || 'Failed to save changes.')
      return
    }
    onSaved()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
          <DialogDescription>
            {lead ? `Reference ${lead.referenceId}` : 'Update the lead details below.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full Name" id="edit-fullName">
            <Input id="edit-fullName" value={form.fullName ?? ''} onChange={(e) => set('fullName', e.target.value)} />
          </Field>
          <Field label="Email" id="edit-email">
            <Input id="edit-email" type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} />
          </Field>
          <Field label="Phone" id="edit-phone">
            <Input id="edit-phone" value={form.phoneNumber ?? ''} onChange={(e) => set('phoneNumber', e.target.value)} />
          </Field>
          <Field label="Locality" id="edit-locality">
            <Input id="edit-locality" value={form.locality ?? ''} onChange={(e) => set('locality', e.target.value)} />
          </Field>
          <Field label="Budget" id="edit-budget">
            <Input id="edit-budget" value={form.budgetRange ?? ''} onChange={(e) => set('budgetRange', e.target.value)} />
          </Field>
          <Field label="BHK" id="edit-bhk">
            <Input id="edit-bhk" value={form.bhkRequirement ?? ''} onChange={(e) => set('bhkRequirement', e.target.value)} />
          </Field>
          <Field label="Source" id="edit-source">
            <Input id="edit-source" value={form.source ?? ''} onChange={(e) => set('source', e.target.value)} />
          </Field>
          <Field label="Status" id="edit-status">
            <Select value={form.status} onValueChange={(v) => set('status', v)}>
              <SelectTrigger id="edit-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {LEAD_STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes" id="edit-notes">
              <textarea
                id="edit-notes"
                value={form.notes ?? ''}
                onChange={(e) => set('notes', e.target.value)}
                rows={3}
                className="flex w-full rounded-md border border-input bg-input/30 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </Field>
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}
