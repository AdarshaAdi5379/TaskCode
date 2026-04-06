"use client"

import { useEffect, useState } from "react"
import type { Task, UserSettings } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/lib/toast-context"
import { useUserContext } from "@/lib/user-context"

export default function ProductivitySettingsPage() {
  return <ProductivitySettings />
}

const PRIORITIES: Task["priority"][] = ["low", "medium", "high", "critical"]

function ToggleRow({
  title,
  description,
  value,
  onToggle,
}: {
  title: string
  description: string
  value: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button variant={value ? "default" : "outline"} size="sm" onClick={onToggle}>
        {value ? "On" : "Off"}
      </Button>
    </div>
  )
}

type Productivity = NonNullable<UserSettings["productivity"]>

function ProductivitySettings() {
  const { user, updateSettings } = useUserContext()
  const { addToast } = useToast()

  const current: Productivity = {
    autoAssignCreator: user?.settings.productivity?.autoAssignCreator ?? true,
    defaultPriority: user?.settings.productivity?.defaultPriority ?? "medium",
    defaultDueDateOffsetDays: user?.settings.productivity?.defaultDueDateOffsetDays ?? 0,
    enableSubtasks: user?.settings.productivity?.enableSubtasks ?? true,
    enableRecurringTasks: user?.settings.productivity?.enableRecurringTasks ?? false,
    enableReminders: user?.settings.productivity?.enableReminders ?? true,
    calendar: {
      firstDayOfWeek: user?.settings.productivity?.calendar?.firstDayOfWeek ?? "mon",
      defaultView: user?.settings.productivity?.calendar?.defaultView ?? "month",
    },
  }

  const [draft, setDraft] = useState<Productivity>(current)
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (dirty) return
    setDraft(current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.settings.productivity, dirty])

  if (!user) return null

  const setField = (patch: Partial<Productivity>) => {
    setDirty(true)
    setDraft((prev) => ({ ...prev, ...patch }))
  }

  const setCalendar = (patch: Partial<NonNullable<Productivity["calendar"]>>) => {
    setDirty(true)
    setDraft((prev) => ({
      ...prev,
      calendar: { ...(prev.calendar ?? {}), ...patch },
    }))
  }

  const handleSave = () => {
    setError(null)
    const offset = Number(draft.defaultDueDateOffsetDays ?? 0)
    if (!Number.isFinite(offset) || offset < 0 || offset > 365) {
      setError("Default due date offset must be between 0 and 365 days.")
      return
    }

    setSaving(true)
    try {
      updateSettings({
        productivity: {
          autoAssignCreator: !!draft.autoAssignCreator,
          defaultPriority: draft.defaultPriority,
          defaultDueDateOffsetDays: Math.floor(offset),
          enableSubtasks: !!draft.enableSubtasks,
          enableRecurringTasks: !!draft.enableRecurringTasks,
          enableReminders: !!draft.enableReminders,
          calendar: {
            firstDayOfWeek: draft.calendar?.firstDayOfWeek ?? "mon",
            defaultView: draft.calendar?.defaultView ?? "month",
          },
        },
      })
      setDirty(false)
      addToast("success", "Productivity settings saved.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Productivity</h2>
          <p className="text-sm text-muted-foreground">Task defaults, reminders, and calendar preferences.</p>
        </div>
        <Button type="button" onClick={handleSave} disabled={!dirty || saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Default task behavior</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleRow
            title="Auto-assign creator"
            description="Automatically assign new tasks to the creator when no assignee is chosen."
            value={!!draft.autoAssignCreator}
            onToggle={() => setField({ autoAssignCreator: !draft.autoAssignCreator })}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Default priority</Label>
              <Select
                value={draft.defaultPriority ?? "medium"}
                onValueChange={(v: Task["priority"]) => setField({ defaultPriority: v })}
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
              <Label htmlFor="dueOffset">Default due date offset (days)</Label>
              <Input
                id="dueOffset"
                type="number"
                min={0}
                max={365}
                value={String(draft.defaultDueDateOffsetDays ?? 0)}
                onChange={(e) => setField({ defaultDueDateOffsetDays: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">
                Example: 2 means tasks default to due in 2 days (when no due date is set).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Task settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleRow
            title="Enable sub-tasks"
            description="Show and allow sub-tasks in task views."
            value={!!draft.enableSubtasks}
            onToggle={() => setField({ enableSubtasks: !draft.enableSubtasks })}
          />
          <ToggleRow
            title="Enable recurring tasks"
            description="Scaffold toggle for recurring tasks (implementation later)."
            value={!!draft.enableRecurringTasks}
            onToggle={() => setField({ enableRecurringTasks: !draft.enableRecurringTasks })}
          />
          <ToggleRow
            title="Enable reminders"
            description="Enable reminder UI and reminder sending (sending later)."
            value={!!draft.enableReminders}
            onToggle={() => setField({ enableReminders: !draft.enableReminders })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>First day of week</Label>
            <Select
              value={draft.calendar?.firstDayOfWeek ?? "mon"}
              onValueChange={(v: "sun" | "mon") => setCalendar({ firstDayOfWeek: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mon">Monday</SelectItem>
                <SelectItem value="sun">Sunday</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Default calendar view</Label>
            <Select
              value={draft.calendar?.defaultView ?? "month"}
              onValueChange={(v: "month" | "week" | "day") => setCalendar({ defaultView: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="day">Day</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Calendar view switching is implemented later.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
