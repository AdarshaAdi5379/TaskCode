"use client"

import React, { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTaskContext } from "@/lib/task-context"
import { IssueTypeIcon } from "@/components/tasks/issue-type-icon"
import type { Task } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TimelineViewProps {
  projectId: string
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function startOfDay(d: Date) {
  const c = new Date(d)
  c.setHours(0, 0, 0, 0)
  return c
}

function addDays(d: Date, n: number) {
  const c = new Date(d)
  c.setDate(c.getDate() + n)
  return c
}

function daysBetween(a: Date, b: Date) {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000)
}

function formatMonth(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

function formatDay(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const priorityBarColors: Record<string, string> = {
  low:      "bg-blue-400",
  medium:   "bg-yellow-400",
  high:     "bg-orange-400",
  critical: "bg-red-500",
}

const DAY_WIDTH = 32   // px per day column
const ROW_HEIGHT = 40  // px per row
const LABEL_WIDTH = 240 // px for task label column

// ─── Component ────────────────────────────────────────────────────────────────
export function TimelineView({ projectId }: TimelineViewProps) {
  const { getTasksByProject } = useTaskContext()
  const allTasks = getTasksByProject(projectId)

  // Only tasks with at least one date (start = createdAt, end = dueDate)
  const tasks = useMemo(() => {
    return allTasks.filter((t) => t.dueDate)
  }, [allTasks])

  // Viewport: centre around today, show N_DAYS days
  const N_DAYS = 42
  const [viewStart, setViewStart] = useState(() => addDays(new Date(), -7))
  const viewEnd = useMemo(() => addDays(viewStart, N_DAYS - 1), [viewStart])

  const days = useMemo(() => {
    return Array.from({ length: N_DAYS }, (_, i) => addDays(viewStart, i))
  }, [viewStart])

  const today = startOfDay(new Date())

  // Group days by month for the header
  const monthGroups = useMemo(() => {
    const groups: { label: string; count: number }[] = []
    let current = ""
    let count = 0
    for (const day of days) {
      const label = day.toLocaleDateString("en-US", { month: "short", year: "numeric" })
      if (label !== current) {
        if (current) groups.push({ label: current, count })
        current = label
        count = 1
      } else {
        count++
      }
    }
    if (current) groups.push({ label: current, count })
    return groups
  }, [days])

  const navigate = (direction: "prev" | "next") => {
    setViewStart((d) => addDays(d, direction === "prev" ? -14 : 14))
  }

  const todayOffset = daysBetween(viewStart, today)
  const todayVisible = todayOffset >= 0 && todayOffset < N_DAYS

  if (allTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
        <Calendar className="h-10 w-10 opacity-40" />
        <p className="font-medium">No tasks in this project yet</p>
        <p className="text-sm">Create tasks with due dates to see them on the timeline.</p>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
        <Calendar className="h-10 w-10 opacity-40" />
        <p className="font-medium">No dated tasks</p>
        <p className="text-sm">Tasks with due dates will appear here as Gantt bars.</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {formatDay(viewStart)} — {formatDay(viewEnd)}
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => setViewStart(addDays(new Date(), -7))}
        >
          Today
        </Button>
      </div>

      {/* Scrollable grid */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: LABEL_WIDTH + N_DAYS * DAY_WIDTH }}>
          {/* Header — month row */}
          <div className="flex border-b" style={{ height: 28 }}>
            <div style={{ width: LABEL_WIDTH }} className="border-r bg-background shrink-0" />
            <div className="flex">
              {monthGroups.map((g, i) => (
                <div
                  key={i}
                  className="border-r text-xs font-semibold text-muted-foreground flex items-center pl-2 bg-muted/20"
                  style={{ width: g.count * DAY_WIDTH }}
                >
                  {g.label}
                </div>
              ))}
            </div>
          </div>

          {/* Header — day row */}
          <div className="flex border-b" style={{ height: 28 }}>
            <div style={{ width: LABEL_WIDTH }} className="border-r bg-background shrink-0" />
            <div className="flex">
              {days.map((day, i) => {
                const isToday = day.toDateString() === today.toDateString()
                const isWeekend = day.getDay() === 0 || day.getDay() === 6
                return (
                  <div
                    key={i}
                    className={cn(
                      "border-r text-[10px] flex items-center justify-center shrink-0 select-none",
                      isToday && "bg-primary/10 font-bold text-primary",
                      isWeekend && !isToday && "text-muted-foreground bg-muted/20"
                    )}
                    style={{ width: DAY_WIDTH }}
                  >
                    {day.getDate()}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Rows */}
          <div className="relative">
            {tasks.map((task, rowIdx) => (
              <TaskRow
                key={task.id}
                task={task}
                rowIdx={rowIdx}
                viewStart={viewStart}
                N_DAYS={N_DAYS}
                DAY_WIDTH={DAY_WIDTH}
                ROW_HEIGHT={ROW_HEIGHT}
                LABEL_WIDTH={LABEL_WIDTH}
                days={days}
              />
            ))}

            {/* Today indicator */}
            {todayVisible && (
              <div
                className="absolute top-0 bottom-0 w-px bg-primary/60 z-10 pointer-events-none"
                style={{ left: LABEL_WIDTH + todayOffset * DAY_WIDTH + DAY_WIDTH / 2 }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Task Row ─────────────────────────────────────────────────────────────────
interface TaskRowProps {
  task: Task
  rowIdx: number
  viewStart: Date
  N_DAYS: number
  DAY_WIDTH: number
  ROW_HEIGHT: number
  LABEL_WIDTH: number
  days: Date[]
}

function TaskRow({
  task,
  viewStart,
  N_DAYS,
  DAY_WIDTH,
  ROW_HEIGHT,
  LABEL_WIDTH,
  days,
}: TaskRowProps) {
  const [hovered, setHovered] = useState(false)

  // Task spans from createdAt to dueDate
  const taskStart = startOfDay(new Date(task.createdAt))
  const taskEnd = startOfDay(new Date(task.dueDate!))

  const startOffset = Math.max(0, daysBetween(viewStart, taskStart))
  const endOffset = Math.min(N_DAYS - 1, daysBetween(viewStart, taskEnd))

  const barWidth = Math.max(1, endOffset - startOffset + 1) * DAY_WIDTH
  const barLeft = LABEL_WIDTH + startOffset * DAY_WIDTH

  const isVisible = endOffset >= 0 && startOffset < N_DAYS
  const isOverdue = taskEnd < startOfDay(new Date()) && task.status !== "done"
  const isDone = task.status === "done"

  const today = startOfDay(new Date())

  return (
    <div
      className="relative flex border-b hover:bg-muted/20 transition-colors"
      style={{ height: ROW_HEIGHT }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Label column */}
      <div
        className="flex items-center gap-2 px-3 border-r shrink-0 overflow-hidden"
        style={{ width: LABEL_WIDTH }}
      >
        <IssueTypeIcon type={task.issueType ?? "task"} />
        <span className="text-sm truncate">{task.title}</span>
      </div>

      {/* Day columns background */}
      <div className="flex flex-1">
        {days.map((day, i) => {
          const isWeekend = day.getDay() === 0 || day.getDay() === 6
          const isTodayCol = day.toDateString() === today.toDateString()
          return (
            <div
              key={i}
              className={cn(
                "border-r shrink-0",
                isWeekend && "bg-muted/10",
                isTodayCol && "bg-primary/5"
              )}
              style={{ width: DAY_WIDTH, height: ROW_HEIGHT }}
            />
          )
        })}
      </div>

      {/* Gantt bar */}
      {isVisible && (
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 rounded h-6 flex items-center px-2 text-xs font-medium text-white truncate cursor-pointer transition-opacity",
            isDone ? "opacity-50" : "opacity-90 hover:opacity-100",
            isOverdue ? "bg-red-500" : priorityBarColors[task.priority]
          )}
          style={{
            left: barLeft,
            width: barWidth,
            zIndex: 5,
          }}
        >
          {barWidth > 60 && task.title}
        </div>
      )}

      {/* Tooltip on hover */}
      {hovered && (
        <div
          className="absolute z-20 bg-popover border rounded-lg shadow-lg p-3 text-sm space-y-1 pointer-events-none"
          style={{ left: barLeft + 4, top: ROW_HEIGHT, minWidth: 200 }}
        >
          <div className="font-semibold">{task.title}</div>
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Badge variant="outline" className="capitalize text-xs">
              {task.status.replace("-", " ")}
            </Badge>
            <Badge variant="outline" className="capitalize text-xs">
              {task.priority}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDay(taskStart)} → {formatDay(taskEnd)}
          </div>
          {isOverdue && (
            <div className="text-xs text-red-500 font-medium">Overdue</div>
          )}
        </div>
      )}
    </div>
  )
}
