"use client"

import { useEffect, useMemo, useState } from "react"
import type { Project, Task } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/lib/toast-context"
import { useProjectContext } from "@/lib/project-context"

export default function ProjectSettingsPage() {
  return <ProjectSettings />
}

const COLOR_OPTIONS = [
  { name: "Blue", value: "bg-blue-500" },
  { name: "Purple", value: "bg-purple-500" },
  { name: "Orange", value: "bg-orange-500" },
  { name: "Red", value: "bg-red-500" },
  { name: "Green", value: "bg-green-500" },
  { name: "Pink", value: "bg-pink-500" },
] as const

const PRIORITIES: Task["priority"][] = ["low", "medium", "high", "critical"]
const STATUSES: Task["status"][] = ["todo", "in-progress", "done"]

function ProjectSettings() {
  const { projects, updateProject } = useProjectContext()
  const { addToast } = useToast()

  const sortedProjects = useMemo(() => {
    const copy = [...projects]
    copy.sort((a, b) => {
      if (a.isArchived !== b.isArchived) return a.isArchived ? 1 : -1
      return a.name.localeCompare(b.name)
    })
    return copy
  }, [projects])

  const firstProjectId = sortedProjects[0]?.id ?? ""
  const [selectedProjectId, setSelectedProjectId] = useState(firstProjectId)

  const selectedProject = useMemo(
    () => sortedProjects.find((p) => p.id === selectedProjectId) ?? null,
    [sortedProjects, selectedProjectId],
  )

  const [draft, setDraft] = useState<Project | null>(selectedProject)
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (dirty) return
    setDraft(selectedProject)
  }, [selectedProject, dirty])

  useEffect(() => {
    if (!selectedProjectId && firstProjectId) setSelectedProjectId(firstProjectId)
  }, [firstProjectId, selectedProjectId])

  const handleSave = () => {
    setError(null)
    if (!draft) return
    const name = draft.name.trim()
    if (!name) {
      setError("Project name is required.")
      return
    }

    setSaving(true)
    try {
      updateProject(draft.id, {
        name,
        description: draft.description.trim(),
        color: draft.color,
        icon: (draft.icon ?? "").trim() || undefined,
        settings: draft.settings,
      })
      setDirty(false)
      addToast("success", "Project settings saved.")
    } finally {
      setSaving(false)
    }
  }

  const setDraftField = (patch: Partial<Project>) => {
    setDirty(true)
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev))
  }

  if (sortedProjects.length === 0) {
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
          <p className="text-sm text-muted-foreground">Project defaults, workflows, and label management.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>No projects yet</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Create a project first, then you can configure its settings here.
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!draft) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
          <p className="text-sm text-muted-foreground">Project defaults, workflows, and label management.</p>
        </div>
        <Button type="button" onClick={handleSave} disabled={saving || !dirty}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Choose project</CardTitle>
        </CardHeader>
        <CardContent className="max-w-md space-y-2">
          <Label>Project</Label>
          <Select
            value={selectedProjectId}
            onValueChange={(v) => {
              setDirty(false)
              setSelectedProjectId(v)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {sortedProjects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.icon ? `${p.icon} ` : ""}{p.name}{p.isArchived ? " (Archived)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project info</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="projName">Project name</Label>
            <Input
              id="projName"
              value={draft.name}
              onChange={(e) => setDraftField({ name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="projIcon">Project icon (optional)</Label>
            <Input
              id="projIcon"
              value={draft.icon ?? ""}
              onChange={(e) => setDraftField({ icon: e.target.value })}
              placeholder="e.g. 🚀"
            />
            <p className="text-xs text-muted-foreground">Tip: use a single emoji for now.</p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="projDesc">Description</Label>
            <Textarea
              id="projDesc"
              value={draft.description}
              onChange={(e) => setDraftField({ description: e.target.value })}
              placeholder="Brief description of the project"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Project color</Label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setDraftField({ color: c.value })}
                  className={`h-10 rounded-lg border-2 transition-all ${c.value} ${
                    draft.color === c.value ? "border-foreground" : "border-transparent"
                  }`}
                  title={c.name}
                  aria-label={c.name}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Defaults</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Default priority</Label>
            <Select
              value={draft.settings.defaultPriority}
              onValueChange={(v: Task["priority"]) =>
                setDraftField({ settings: { ...draft.settings, defaultPriority: v } })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Default status</Label>
            <Select
              value={draft.settings.defaultStatus}
              onValueChange={(v: Task["status"]) =>
                setDraftField({ settings: { ...draft.settings, defaultStatus: v } })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Auto-complete subtasks</Label>
            <Button
              type="button"
              variant={draft.settings.autoCompleteSubtasks ? "default" : "outline"}
              onClick={() =>
                setDraftField({
                  settings: { ...draft.settings, autoCompleteSubtasks: !draft.settings.autoCompleteSubtasks },
                })
              }
            >
              {draft.settings.autoCompleteSubtasks ? "On" : "Off"}
            </Button>
            <p className="text-xs text-muted-foreground">
              When enabled, completing all subtasks can auto-complete the parent task.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workflow (coming soon)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Custom task statuses are scaffolded but not implemented yet.</p>
          <p>
            Current global statuses:{" "}
            <span className="font-mono">{STATUSES.join(" | ")}</span>
          </p>
          <p>Implementing per-project workflows requires expanding the task status model.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Labels (coming soon)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Labels management (create/delete/colors) will be implemented after we define a project-level labels schema.
        </CardContent>
      </Card>
    </div>
  )
}
