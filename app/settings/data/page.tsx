"use client"

import { useMemo, useRef, useState } from "react"
import type { ActivityLog, Task } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/lib/toast-context"
import { useTaskContext } from "@/lib/task-context"
import { useUserContext } from "@/lib/user-context"
import { useSettings } from "@/lib/settings/settings-context"

export default function DataSettingsPage() {
  return <DataSettings />
}

function downloadText(filename: string, content: string, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function csvEscape(value: unknown) {
  const s = String(value ?? "")
  if (/[",\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`
  return s
}

function tasksToCsv(tasks: Task[]) {
  const headers = [
    "id",
    "title",
    "description",
    "status",
    "priority",
    "dueDate",
    "projectId",
    "assignees",
    "labels",
    "isSoftDeleted",
    "deletedAt",
    "createdAt",
    "updatedAt",
  ]
  const lines = [
    headers.join(","),
    ...tasks.map((t) => ([
      t.id,
      t.title,
      t.description,
      t.status,
      t.priority,
      t.dueDate ?? "",
      t.projectId,
      (t.assignees ?? []).join("|"),
      (t.labels ?? []).join("|"),
      t.isSoftDeleted ? "true" : "false",
      t.deletedAt ? new Date(t.deletedAt).toISOString() : "",
      new Date(t.createdAt).toISOString(),
      t.updatedAt ? new Date(t.updatedAt).toISOString() : "",
    ]).map(csvEscape).join(",")),
  ]
  return lines.join("\n")
}

function buildActivityLogs(tasks: Task[], userId: string, userName: string): ActivityLog[] {
  const logs: ActivityLog[] = []
  tasks.forEach((task) => {
    logs.push({
      id: `created-${task.id}`,
      projectId: task.projectId,
      taskId: task.id,
      taskTitle: task.title,
      userId,
      userName,
      action: "created",
      details: `Created task "${task.title}"`,
      createdAt: task.createdAt,
    })

    if (task.status === "done") {
      logs.push({
        id: `completed-${task.id}`,
        projectId: task.projectId,
        taskId: task.id,
        taskTitle: task.title,
        userId,
        userName,
        action: "completed",
        details: `Completed task "${task.title}"`,
        createdAt: task.completedAt || new Date(),
      })
    }

    task.comments.forEach((comment) => {
      logs.push({
        id: `comment-${comment.id}`,
        projectId: task.projectId,
        taskId: task.id,
        taskTitle: task.title,
        userId: comment.userId,
        userName: comment.userName,
        action: "commented",
        details: `Commented on "${task.title}"`,
        createdAt: comment.createdAt,
      })
    })
  })
  return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

function DataSettings() {
  const { tasks } = useTaskContext()
  const { user } = useUserContext()
  const { addToast } = useToast()
  const { workspaceSettings, updateWorkspaceSettings } = useSettings()

  const importCsvRef = useRef<HTMLInputElement | null>(null)
  const importExcelRef = useRef<HTMLInputElement | null>(null)

  const [exporting, setExporting] = useState(false)
  const [trashRetention, setTrashRetention] = useState<7 | 30 | 60>(workspaceSettings.trashRetentionDays ?? 30)

  const safeUserId = user?.id ?? "system"
  const safeUserName = user?.displayName ?? "System"

  const exportAllTasksJson = async () => {
    setExporting(true)
    try {
      downloadText(
        `taskcode-tasks-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify(tasks, null, 2),
        "application/json;charset=utf-8",
      )
      addToast("success", "Exported tasks (JSON).")
    } finally {
      setExporting(false)
    }
  }

  const exportAllTasksCsv = async () => {
    setExporting(true)
    try {
      downloadText(
        `taskcode-tasks-${new Date().toISOString().slice(0, 10)}.csv`,
        tasksToCsv(tasks),
        "text/csv;charset=utf-8",
      )
      addToast("success", "Exported tasks (CSV).")
    } finally {
      setExporting(false)
    }
  }

  const exportActivityLogsJson = async () => {
    setExporting(true)
    try {
      const logs = buildActivityLogs(tasks, safeUserId, safeUserName)
      downloadText(
        `taskcode-activity-logs-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify(logs, null, 2),
        "application/json;charset=utf-8",
      )
      addToast("success", "Exported activity logs (JSON).")
    } finally {
      setExporting(false)
    }
  }

  const saveRetention = (days: 7 | 30 | 60) => {
    setTrashRetention(days)
    updateWorkspaceSettings({ trashRetentionDays: days })
    addToast("success", "Trash retention saved.")
  }

  const importComingSoon = () => {
    addToast("info", "Import will be implemented next.")
  }

  const tasksCount = tasks.length
  const trashedCount = useMemo(() => tasks.filter((t) => t.isSoftDeleted).length, [tasks])

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Data</h2>
        <p className="text-sm text-muted-foreground">Import/export tools and trash retention.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Tasks: {tasksCount} total ({trashedCount} in trash)
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void exportAllTasksCsv()} disabled={exporting}>
              Export tasks (CSV)
            </Button>
            <Button type="button" variant="outline" onClick={() => void exportAllTasksJson()} disabled={exporting}>
              Export tasks (JSON)
            </Button>
            <Button type="button" variant="outline" onClick={() => void exportActivityLogsJson()} disabled={exporting}>
              Export activity logs (JSON)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Importers are scaffolded. Next we’ll define a strict CSV schema + mapping UI.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => importCsvRef.current?.click()}>
              Import tasks (CSV)
            </Button>
            <Button type="button" variant="outline" onClick={() => importExcelRef.current?.click()}>
              Import tasks (Excel)
            </Button>
          </div>

          <input
            ref={importCsvRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={() => importComingSoon()}
          />
          <input
            ref={importExcelRef}
            type="file"
            accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={() => importComingSoon()}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trash</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 max-w-sm">
            <Label>Trash retention period</Label>
            <Select value={String(trashRetention)} onValueChange={(v) => saveRetention(Number(v) as 7 | 30 | 60)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Stored now; automatic cleanup enforcement will be added later.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
