'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { LeadForm } from '@/components/lead-form'

interface SiteVisitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectName: string
}

export function SiteVisitDialog({ open, onOpenChange, projectName }: SiteVisitDialogProps) {
  const [formKey, setFormKey] = useState(0)

  const handleOpenChange = (value: boolean) => {
    onOpenChange(value)
    if (!value) setFormKey((k) => k + 1)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] max-w-xl overflow-hidden p-0">
        <DialogTitle className="sr-only">Book a site visit to {projectName}</DialogTitle>
        <DialogDescription className="sr-only">
          Share your details and an advisor will schedule your visit.
        </DialogDescription>
        <div className="max-h-[90vh] overflow-y-auto">
          <LeadForm
            key={formKey}
            isDialog
            heading={`Book a Site Visit — ${projectName}`}
            subheading="Share your details and our advisor will confirm a visit slot, with exclusive launch pricing."
            submitLabel="Book My Site Visit"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
