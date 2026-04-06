"use client"

import { useEffect, useState } from "react"
import type { WorkspaceSettings, WorkspaceWorkingDay } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/lib/toast-context"
import { useSettings } from "@/lib/settings/settings-context"

export default function WorkspaceSettingsPage() {
  return <WorkspaceSettingsView />
}

const DAYS: { key: WorkspaceWorkingDay; label: string }[] = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
]

type Role = WorkspaceSettings["permissions"]["canCreateProjects"]

function WorkspaceSettingsView() {
  const { workspaceSettings, updateWorkspaceSettings, isLoading } = useSettings()
  const { addToast } = useToast()

  const [draft, setDraft] = useState<WorkspaceSettings>(workspaceSettings)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (dirty) return
    setDraft(workspaceSettings)
  }, [workspaceSettings, dirty])

  if (isLoading) return null

  const toggleDay = (day: WorkspaceWorkingDay) => {
    setDirty(true)
    setDraft((prev) => {
      const has = prev.workingDays.includes(day)
      const workingDays = has ? prev.workingDays.filter((d) => d !== day) : [...prev.workingDays, day]
      return { ...prev, workingDays }
    })
  }

  const setPermission = (key: keyof WorkspaceSettings["permissions"], value: Role) => {
    setDirty(true)
    setDraft((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: value,
      },
    }))
  }

  const handleSave = () => {
    setError(null)
    const name = draft.name.trim()
    if (!name) {
      setError("Workspace name is required.")
      return
    }
    if (draft.workingDays.length === 0) {
      setError("Select at least one working day.")
      return
    }

    setSaving(true)
    try {
      updateWorkspaceSettings({
        name,
        logoURL: (draft.logoURL ?? "").trim(),
        description: draft.description.trim(),
        timezone: draft.timezone.trim() || "UTC",
        workingDays: draft.workingDays,
        permissions: draft.permissions,
      })
      setDirty(false)
      addToast("success", "Workspace settings saved.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Workspace</h2>
          <p className="text-sm text-muted-foreground">Single workspace mode (workspaceId: default).</p>
        </div>
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Workspace info</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="wsName">Workspace name</Label>
            <Input
              id="wsName"
              value={draft.name}
              onChange={(e) => {
                setDirty(true)
                setDraft((p) => ({ ...p, name: e.target.value }))
              }}
              placeholder="My Workspace"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wsLogo">Workspace logo URL (optional)</Label>
            <Input
              id="wsLogo"
              value={draft.logoURL ?? ""}
              onChange={(e) => {
                setDirty(true)
                setDraft((p) => ({ ...p, logoURL: e.target.value }))
              }}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="wsDesc">Description</Label>
            <Textarea
              id="wsDesc"
              value={draft.description}
              onChange={(e) => {
                setDirty(true)
                setDraft((p) => ({ ...p, description: e.target.value }))
              }}
              placeholder="What is this workspace for?"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timezone & working days</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 max-w-sm">
            <Label htmlFor="wsTz">Timezone</Label>
            <Input
              id="wsTz"
              value={draft.timezone}
              onChange={(e) => {
                setDirty(true)
                setDraft((p) => ({ ...p, timezone: e.target.value }))
              }}
              placeholder="UTC"
            />
            <p className="text-xs text-muted-foreground">Example: UTC, Asia/Kolkata, America/New_York</p>
          </div>

          <div className="space-y-2">
            <Label>Working days</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => {
                const on = draft.workingDays.includes(d.key)
                return (
                  <Button
                    key={d.key}
                    type="button"
                    size="sm"
                    variant={on ? "default" : "outline"}
                    onClick={() => toggleDay(d.key)}
                  >
                    {d.label}
                  </Button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Who can create projects</Label>
            <Select
              value={draft.permissions.canCreateProjects}
              onValueChange={(v: Role) => setPermission("canCreateProjects", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Who can invite users</Label>
            <Select
              value={draft.permissions.canInviteUsers}
              onValueChange={(v: Role) => setPermission("canInviteUsers", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Who can delete projects</Label>
            <Select
              value={draft.permissions.canDeleteProjects}
              onValueChange={(v: Role) => setPermission("canDeleteProjects", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-muted-foreground md:col-span-3">
            Enforcement is implemented later; these values are stored now.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Members management will be added when TaskCode has a real workspace/team model.
        </CardContent>
      </Card>
    </div>
  )
}
