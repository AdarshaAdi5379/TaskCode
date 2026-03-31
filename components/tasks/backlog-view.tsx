"use client"

import React, { useState } from "react"
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Play,
  MoreHorizontal,
  GripVertical,
  Flag,
  CalendarDays,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useTaskContext } from "@/lib/task-context"
import { useSprintContext } from "@/lib/sprint-context"
import type { Task, Sprint, IssueType } from "@/lib/types"
import { IssueTypeIcon } from "@/components/tasks/issue-type-icon"
import { cn } from "@/lib/utils"

interface BacklogViewProps {
  projectId: string
}

const priorityColors: Record<string, string> = {
  low:      "text-blue-500",
  medium:   "text-yellow-500",
  high:     "text-orange-500",
  critical: "text-red-500",
}

function formatDate(dateStr?: string) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// ─── Sprint Create/Edit Dialog ─────────────────────────────────────────────────
interface SprintDialogProps {
  projectId: string
  sprint?: Sprint
  open: boolean
  onOpenChange: (v: boolean) => void
}

function SprintDialog({ projectId, sprint, open, onOpenChange }: SprintDialogProps) {
  const { addSprint, updateSprint } = useSprintContext()

  const today = new Date().toISOString().slice(0, 10)
  const twoWeeks = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)

  const [name, setName] = useState(sprint?.name ?? `Sprint ${Date.now()}`)
  const [goal, setGoal] = useState(sprint?.goal ?? "")
  const [startDate, setStartDate] = useState(sprint?.startDate ?? today)
  const [endDate, setEndDate] = useState(sprint?.endDate ?? twoWeeks)

  const handleSave = () => {
    if (!name.trim()) return
    if (sprint) {
      updateSprint(sprint.id, { name, goal, startDate, endDate })
    } else {
      addSprint({ projectId, name, goal, startDate, endDate, status: "planning" })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{sprint ? "Edit Sprint" : "Create Sprint"}</DialogTitle>
          <DialogDescription>
            Define the sprint goal and dates for this iteration.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Sprint name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sprint 1" />
          </div>
          <div className="space-y-1.5">
            <Label>Sprint goal <span className="text-muted-foreground">(optional)</span></Label>
            <textarea
              value={goal}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setGoal(e.target.value)}
              placeholder="What do we want to achieve this sprint?"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Start date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>End date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>{sprint ? "Save changes" : "Create sprint"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Task Row ──────────────────────────────────────────────────────────────────
interface TaskRowProps {
  task: Task
  onMoveToSprint: (taskId: string, sprintId: string) => void
  onMoveToBacklog: (taskId: string) => void
  sprints: Sprint[]
  onSelect: (task: Task) => void
}

function TaskRow({ task, onMoveToSprint, onMoveToBacklog, sprints, onSelect }: TaskRowProps) {
  const planningSprints = sprints.filter((s) => s.status === "planning" || s.status === "active")

  return (
    <div
      className="group flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={() => onSelect(task)}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-50 shrink-0" />
      <IssueTypeIcon type={task.issueType ?? "task"} />
      <span className="flex-1 text-sm truncate">{task.title}</span>

      {/* Story points */}
      {task.storyPoints !== undefined && (
        <span className="flex items-center gap-0.5 text-xs text-muted-foreground shrink-0">
          <Zap className="h-3 w-3" />
          {task.storyPoints}
        </span>
      )}

      {/* Due date */}
      {task.dueDate && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <CalendarDays className="h-3 w-3" />
          {formatDate(task.dueDate)}
        </span>
      )}

      {/* Priority */}
      <Flag className={cn("h-3.5 w-3.5 shrink-0", priorityColors[task.priority])} />

      {/* Status badge */}
      <Badge variant="outline" className="text-xs capitalize shrink-0 hidden sm:flex">
        {task.status.replace("-", " ")}
      </Badge>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          {planningSprints.map((s) => (
            <DropdownMenuItem key={s.id} onClick={() => onMoveToSprint(task.id, s.id)}>
              Move to {s.name}
            </DropdownMenuItem>
          ))}
          {task.sprintId && (
            <>
              {planningSprints.length > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem onClick={() => onMoveToBacklog(task.id)}>
                Move to Backlog
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// ─── Sprint Section ────────────────────────────────────────────────────────────
interface SprintSectionProps {
  sprint: Sprint
  tasks: Task[]
  allSprints: Sprint[]
  onMoveToSprint: (taskId: string, sprintId: string) => void
  onMoveToBacklog: (taskId: string) => void
  onSelectTask: (task: Task) => void
}

function SprintSection({
  sprint,
  tasks,
  allSprints,
  onMoveToSprint,
  onMoveToBacklog,
  onSelectTask,
}: SprintSectionProps) {
  const { startSprint, completeSprint, deleteSprint } = useSprintContext()
  const [collapsed, setCollapsed] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0)
  const donePoints  = tasks.filter((t) => t.status === "done").reduce((sum, t) => sum + (t.storyPoints ?? 0), 0)

  const statusColors: Record<Sprint["status"], string> = {
    planning:  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    active:    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    completed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  }

  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between gap-2">
          <button
            className="flex items-center gap-2 flex-1 text-left"
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <CardTitle className="text-base">{sprint.name}</CardTitle>
            <Badge variant="outline" className={cn("text-xs capitalize", statusColors[sprint.status])}>
              {sprint.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDate(sprint.startDate)} — {formatDate(sprint.endDate)}
            </span>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            {totalPoints > 0 && (
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {donePoints}/{totalPoints} pts
              </span>
            )}
            <span className="text-xs text-muted-foreground">{tasks.length} issues</span>

            {sprint.status === "planning" && (
              <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => startSprint(sprint.id)}>
                <Play className="h-3 w-3" />
                Start
              </Button>
            )}
            {sprint.status === "active" && (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => completeSprint(sprint.id)}>
                Complete
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowEdit(true)}>Edit sprint</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => deleteSprint(sprint.id)}
                >
                  Delete sprint
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {sprint.goal && !collapsed && (
          <p className="text-sm text-muted-foreground mt-1 ml-6 italic">"{sprint.goal}"</p>
        )}
      </CardHeader>

      {!collapsed && (
        <CardContent className="px-4 pb-3 pt-0">
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No issues in this sprint. Drag issues from the backlog.
            </p>
          ) : (
            <div className="space-y-0.5">
              {tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  sprints={allSprints}
                  onMoveToSprint={onMoveToSprint}
                  onMoveToBacklog={onMoveToBacklog}
                  onSelect={onSelectTask}
                />
              ))}
            </div>
          )}
        </CardContent>
      )}

      <SprintDialog
        projectId={sprint.projectId}
        sprint={sprint}
        open={showEdit}
        onOpenChange={setShowEdit}
      />
    </Card>
  )
}

// ─── Main Backlog View ─────────────────────────────────────────────────────────
export function BacklogView({ projectId }: BacklogViewProps) {
  const { tasks, updateTask, getBacklogTasks, getSprintTasks, addTask } = useTaskContext()
  const { getSprintsByProject } = useSprintContext()

  const [showCreateSprint, setShowCreateSprint] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskType, setNewTaskType] = useState<IssueType>("task")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const sprints = getSprintsByProject(projectId)
  const backlogTasks = getBacklogTasks(projectId)

  const handleMoveToSprint = (taskId: string, sprintId: string) => {
    updateTask(taskId, { sprintId })
  }

  const handleMoveToBacklog = (taskId: string) => {
    updateTask(taskId, { sprintId: undefined })
  }

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    addTask({
      title: newTaskTitle.trim(),
      description: "",
      projectId,
      status: "todo",
      priority: "medium",
      assignees: [],
      labels: [],
      issueType: newTaskType,
    })
    setNewTaskTitle("")
  }

  return (
    <div className="space-y-4">
      {/* Sprints */}
      {sprints.map((sprint) => {
        const sprintTasks = tasks.filter(
          (t) => t.sprintId === sprint.id && !t.isSoftDeleted
        )
        return (
          <SprintSection
            key={sprint.id}
            sprint={sprint}
            tasks={sprintTasks}
            allSprints={sprints}
            onMoveToSprint={handleMoveToSprint}
            onMoveToBacklog={handleMoveToBacklog}
            onSelectTask={setSelectedTask}
          />
        )
      })}

      {/* Backlog bucket */}
      <Card>
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Backlog</CardTitle>
            <span className="text-xs text-muted-foreground">{backlogTasks.length} issues</span>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-1">
          {backlogTasks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No items in the backlog.
            </p>
          )}
          {backlogTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              sprints={sprints}
              onMoveToSprint={handleMoveToSprint}
              onMoveToBacklog={handleMoveToBacklog}
              onSelect={setSelectedTask}
            />
          ))}

          {/* Quick add */}
          <form onSubmit={handleQuickAdd} className="flex items-center gap-2 pt-2">
            {/* Issue type selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                  <IssueTypeIcon type={newTaskType} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(["task", "bug", "story", "epic"] as IssueType[]).map((t) => (
                  <DropdownMenuItem key={t} onClick={() => setNewTaskType(t)}>
                    <IssueTypeIcon type={t} className="mr-2" />
                    <span className="capitalize">{t}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Input
              placeholder="Add issue to backlog…"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="h-8 text-sm"
            />
            <Button type="submit" size="sm" className="h-8 shrink-0" disabled={!newTaskTitle.trim()}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Create sprint button */}
      <Button variant="outline" className="w-full gap-2" onClick={() => setShowCreateSprint(true)}>
        <Plus className="h-4 w-4" />
        Create Sprint
      </Button>

      <SprintDialog
        projectId={projectId}
        open={showCreateSprint}
        onOpenChange={setShowCreateSprint}
      />
    </div>
  )
}
