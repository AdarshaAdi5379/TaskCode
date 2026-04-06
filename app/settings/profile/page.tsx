"use client"

import { useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/ui/alert-dialog"
import { useToast } from "@/lib/toast-context"
import { useUserContext } from "@/lib/user-context"
import { useProjectContext } from "@/lib/project-context"

export default function ProfileSettingsPage() {
  return <ProfileSettings />
}

function ProfileSettings() {
  const router = useRouter()
  const { addToast } = useToast()
  const { user, updateProfile, updateSettings, updateEmail, changePassword, logoutAllDevices, deleteAccount } = useUserContext()
  const { projects } = useProjectContext()

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [displayName, setDisplayName] = useState(user?.displayName ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [photoURL, setPhotoURL] = useState(user?.photoURL ?? "")

  const [savingProfile, setSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const [logoutAllOpen, setLogoutAllOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const activeProjects = useMemo(() => projects.filter((p) => !p.isArchived), [projects])
  const defaultProjectId = user?.settings.defaults?.projectId ?? ""
  const defaultView = user?.settings.defaults?.view ?? "list"

  if (!user) return null

  const initials = (user.displayName || user.email || "U")
    .split(" ")
    .map((p) => p.trim().slice(0, 1))
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const handlePickAvatar = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarFile = async (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      addToast("error", "Please select an image file.")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      addToast("error", "Image is too large (max 2MB).")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : ""
      setPhotoURL(result)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async () => {
    setProfileError(null)
    const trimmedName = displayName.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName) {
      setProfileError("Name is required.")
      return
    }
    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      setProfileError("Please enter a valid email.")
      return
    }

    setSavingProfile(true)
    try {
      if (trimmedName !== user.displayName || photoURL !== (user.photoURL ?? "")) {
        updateProfile({ displayName: trimmedName, photoURL: photoURL || undefined })
      }
      if (trimmedEmail !== user.email) {
        const { error } = await updateEmail(trimmedEmail)
        if (error) {
          setProfileError(error)
          addToast("error", error)
          return
        }
      }
      addToast("success", "Profile updated.")
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSaveDefaults = (patch: { projectId?: string; view?: "list" | "kanban" | "calendar" }) => {
    updateSettings({
      defaults: {
        ...(user.settings.defaults ?? {}),
        ...patch,
      },
    })
    addToast("success", "Preferences saved.")
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
      <Card>
        <CardHeader>
          <CardTitle>Profile information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                {photoURL ? <AvatarImage src={photoURL} alt={user.displayName} /> : null}
                <AvatarFallback className="text-sm">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="font-medium truncate">{user.displayName}</div>
                <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                <div className="text-xs text-muted-foreground capitalize">Role: {user.role}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={handlePickAvatar}>
                Upload photo
              </Button>
              <Button type="button" onClick={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? "Saving..." : "Save"}
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleAvatarFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {profileError ? (
            <p className="text-sm text-destructive">{profileError}</p>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="displayName">Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                inputMode="email"
              />
              <p className="text-xs text-muted-foreground">
                If you use Supabase auth, email updates may require confirmation.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photoURL">Profile photo URL (optional)</Label>
            <Input
              id="photoURL"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default preferences</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Default workspace</Label>
            <Input value="My Workspace" disabled />
            <p className="text-xs text-muted-foreground">TaskCode currently uses a single workspace.</p>
          </div>

          <div className="space-y-2">
            <Label>Default project</Label>
            <Select
              value={defaultProjectId || "__none__"}
              onValueChange={(value) => handleSaveDefaults({ projectId: value === "__none__" ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {activeProjects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Default view</Label>
            <Select
              value={defaultView}
              onValueChange={(value) => handleSaveDefaults({ view: value as "list" | "kanban" | "calendar" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="list">List</SelectItem>
                <SelectItem value="kanban">Kanban</SelectItem>
                <SelectItem value="calendar">Calendar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account controls</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button type="button" variant="outline" onClick={() => setPasswordDialogOpen(true)}>
            Change password
          </Button>

          <Button type="button" variant="outline" onClick={() => setLogoutAllOpen(true)}>
            Logout from all devices
          </Button>
          <Button type="button" variant="destructive" onClick={() => setDeleteOpen(true)}>
            Delete account
          </Button>
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
        description="This action is irreversible. In Supabase mode, this requires a server-side admin flow."
        confirmText="Delete"
        variant="destructive"
      />

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>Set a new password for your account.</DialogDescription>
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
