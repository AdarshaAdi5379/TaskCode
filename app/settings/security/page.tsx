"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/ui/alert-dialog"
import { useToast } from "@/lib/toast-context"
import { useUserContext } from "@/lib/user-context"
import { isSupabaseConfigured } from "@/lib/supabase/client"

export default function SecuritySettingsPage() {
  return <SecuritySettings />
}

const TIMEOUT_OPTIONS: { label: string; minutes: number }[] = [
  { label: "Never", minutes: 0 },
  { label: "15 minutes", minutes: 15 },
  { label: "30 minutes", minutes: 30 },
  { label: "1 hour", minutes: 60 },
  { label: "4 hours", minutes: 240 },
]

function SecuritySettings() {
  const router = useRouter()
  const configured = useMemo(() => isSupabaseConfigured(), [])
  const { addToast } = useToast()
  const { user, updateSettings, changePassword, logoutAllDevices, deleteAccount } = useUserContext()

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const [logoutAllOpen, setLogoutAllOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (!user) return null

  const currentTimeout = user.settings.security?.sessionTimeoutMinutes ?? 0

  const saveTimeout = (minutes: number) => {
    updateSettings({
      security: {
        ...(user.settings.security ?? {}),
        sessionTimeoutMinutes: minutes,
      },
    })
    addToast("success", "Security settings saved.")
  }

  const handleChangePassword = async () => {
    setPasswordError(null)
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.")
      return
    }

    setPasswordSaving(true)
    try {
      const { error } = await changePassword(newPassword)
      if (error) {
        setPasswordError(error)
        addToast("error", error)
        return
      }
      addToast("success", "Password updated.")
      setPasswordDialogOpen(false)
      setNewPassword("")
      setConfirmPassword("")
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleLogoutAll = async () => {
    const { error } = await logoutAllDevices()
    if (error) addToast("error", error)
    else addToast("success", "Logged out from all devices.")
    router.replace("/login")
  }

  const handleDeleteAccount = async () => {
    const { error } = await deleteAccount()
    if (error) {
      addToast("error", error)
      return
    }
    addToast("success", "Account deleted.")
    router.replace("/login")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Security</h2>
        <p className="text-sm text-muted-foreground">Sessions, password, privacy controls, and device management.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Login security</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button type="button" variant="outline" onClick={() => setPasswordDialogOpen(true)}>
            Change password
          </Button>
          <Button type="button" variant="outline" onClick={() => setLogoutAllOpen(true)}>
            Logout from all devices
          </Button>

          <div className="w-full pt-2 sm:pt-0 sm:ml-auto sm:w-64 space-y-2">
            <Label>Session timeout</Label>
            <Select value={String(currentTimeout)} onValueChange={(v) => saveTimeout(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEOUT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.minutes} value={String(opt.minutes)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Stored now; enforcement is implemented later.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active sessions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            A full session/device list requires backend support. For now, use “Logout from all devices”.
          </p>
          <p>
            Auth provider: <span className="font-mono">{configured ? "supabase" : "local"}</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy controls</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button type="button" variant="outline" onClick={() => router.push("/settings/data")}>
            Data export
          </Button>
          <Button type="button" variant="destructive" onClick={() => setDeleteOpen(true)}>
            Delete account
          </Button>
          <p className="text-xs text-muted-foreground w-full">
            In Supabase mode, account deletion needs a server-side admin flow.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Device management</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Device list and revoke controls will be added when session tracking is available.
        </CardContent>
      </Card>

      <ConfirmDialog
        open={logoutAllOpen}
        onOpenChange={setLogoutAllOpen}
        onConfirm={() => void handleLogoutAll()}
        title="Logout from all devices?"
        description="This will end your sessions across devices (best-effort depending on auth provider)."
        confirmText="Logout"
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => void handleDeleteAccount()}
        title="Delete your account?"
        description="This action is irreversible."
        confirmText="Delete"
        variant="destructive"
      />

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>
              {configured ? "Set a new password for your account." : "Local mode: password change is not enforced."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {passwordError ? <p className="text-sm text-destructive">{passwordError}</p> : null}

            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void handleChangePassword()} disabled={passwordSaving}>
                {passwordSaving ? "Saving..." : "Update password"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
