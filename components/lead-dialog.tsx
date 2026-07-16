'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'
import { LeadForm } from '@/components/lead-form'

interface LeadDialogProps {
  triggerText: string
  triggerVariant?: 'default' | 'outline' | 'ghost'
  className?: string
}

export default function LeadDialog({
  triggerText,
  triggerVariant = 'default',
  className,
}: LeadDialogProps) {
  const [open, setOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)

  const handleOpenChange = (value: boolean) => {
    setOpen(value)

    if (!value) {
      // Force LeadForm to remount and reset to default values
      setFormKey((k) => k + 1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant={triggerVariant}
            className={className}
          />
        }
      >
        {triggerText}
      </DialogTrigger>

      <DialogContent
        className="max-w-4xl w-[95vw] p-0 overflow-hidden"
      >
        <div className="max-h-[90vh] overflow-y-auto">
          <LeadForm key={formKey} isDialog={true} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
