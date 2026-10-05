'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, KeyRound, Loader2, LogOut, MonitorX, UserCog, X } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { PASSWORD_RULES, validatePassword } from '@/lib/password-policy'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function AccountMenu({ email }: { email: string }) {
  const router = useRouter()
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [busy, setBusy] = useState<'signout' | 'signout-all' | null>(null)

  const goToLogin = () => {
    router.push('/admin/login')
    router.refresh()
  }

  const handleSignOut = async () => {
    setBusy('signout')
    await authClient.signOut()
    goToLogin()
  }

  const handleSignOutEverywhere = async () => {
    setBusy('signout-all')
    await authClient.revokeSessions()
    await authClient.signOut().catch(() => {})
    goToLogin()
  }

  return (
    <>
      <Popover>
        <PopoverTrigger render={<Button variant="outline" size="sm" />}>
          <UserCog className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Account
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 p-2">
          <p className="truncate px-2 pb-2 pt-1 text-xs text-muted-foreground">{email}</p>
          <div className="flex flex-col">
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => setPasswordOpen(true)}
            >
              <KeyRound className="mr-2 h-4 w-4" aria-hidden="true" />
              Change password
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              disabled={busy !== null}
              onClick={handleSignOutEverywhere}
            >
              {busy === 'signout-all' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <MonitorX className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              Sign out of all devices
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-destructive hover:text-destructive"
              disabled={busy !== null}
              onClick={handleSignOut}
            >
              {busy === 'signout' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              Sign out
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <ChangePasswordDialog
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
        email={email}
        onChanged={goToLogin}
      />
    </>
  )
}

function ChangePasswordDialog({
  open,
  onOpenChange,
  email,
  onChanged,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
  onChanged: () => void
}) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setCurrent('')
    setNext('')
    setConfirm('')
    setError(null)
    setSaving(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const reason = validatePassword(next, email)
    if (reason) return setError(reason)
    if (next !== confirm) return setError('New passwords do not match.')
    if (next === current) return setError('New password must differ from the current one.')

    setSaving(true)
    const { error: changeError } = await authClient.changePassword({
      currentPassword: current,
      newPassword: next,
      revokeOtherSessions: true,
    })
    if (changeError) {
      setSaving(false)
      return setError(
        changeError.status === 429
          ? 'Too many attempts. Please wait a few minutes.'
          : changeError.message || 'Could not change password.',
      )
    }

    reset()
    onOpenChange(false)
    await authClient.signOut().catch(() => {})
    onChanged()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) reset()
        onOpenChange(value)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            {"You'll be signed out of every device and asked to sign in again."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              aria-describedby="password-rules"
              required
            />
            <ul id="password-rules" className="flex flex-col gap-1 pt-1 text-xs">
              {PASSWORD_RULES.map((rule) => {
                const passed = rule.test(next)
                return (
                  <li
                    key={rule.id}
                    className={passed ? 'flex items-center gap-1.5 text-primary' : 'flex items-center gap-1.5 text-muted-foreground'}
                  >
                    {passed ? (
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {rule.label}
                    <span className="sr-only">{passed ? '(met)' : '(not met)'}</span>
                  </li>
                )
              })}
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          {error && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              Update password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
