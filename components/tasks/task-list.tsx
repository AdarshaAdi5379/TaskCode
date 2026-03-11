"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  CheckCircle2, 
  Circle, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  AlertCircle,
  MessageSquare
} from "lucide-react"
import { useTaskContext } from "@/lib/task-context"
import { useToast } from "@/lib/toast-context"
import type { Task, TaskSortBy, TaskFilter } from "@/lib/types"
import { cn } from "@/lib/utils"
import { TaskDetailModal } from "./task-detail-modal"
import { ConfirmDialog } from "@/components/ui/alert-dialog"

interface TaskListProps {
  projectId: string
}

const priorityStyles: Record<string, string> = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

export function TaskList({ projectId }: TaskListProps) {
  const { 
    tasks, 
    updateTask, 
    deleteTask, 
    getTasksByProject, 
    softDeleteTask,
    toggleSubTask,
    sortTasks, 
    filterTasks, 
    searchTasks 
  } = useTaskContext()
  const { addToast } = useToast()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<TaskSortBy>("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [filterStatus, setFilterStatus] = useState<Task["status"] | "all">("all")
  const [filterPriority, setFilterPriority] = useState<Task["priority"] | "all">("all")
  const [filterDueDate, setFilterDueDate] = useState<TaskFilter["dueDate"] | "all">("all")
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [detailModalTaskId, setDetailModalTaskId] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)

  const projectTasks = getTasksByProject(projectId)

  const filteredAndSortedTasks = useMemo(() => {
    let result = projectTasks

    if (searchQuery.trim()) {
      result = searchTasks(result, searchQuery)
    }

    const filter: TaskFilter = {}
    if (filterStatus !== "all") filter.status = filterStatus
    if (filterPriority !== "all") filter.priority = filterPriority
    if (filterDueDate !== "all") filter.dueDate = filterDueDate
    
    if (filterStatus !== "all" || filterPriority !== "all" || filterDueDate !== "all") {
      result = filterTasks(result, filter)
    }

    result = sortTasks(result, sortBy, sortDirection)

    return result
  }, [projectTasks, searchQuery, filterStatus, filterPriority, filterDueDate, sortBy, sortDirection, searchTasks, filterTasks, sortTasks])

  const handleToggleStatus = (taskId: string, currentStatus: string) => {
    const statusMap: Record<string, "todo" | "in-progress" | "done"> = {
      todo: "in-progress",
      "in-progress": "done",
      done: "todo",
    }
    updateTask(taskId, { status: statusMap[currentStatus] || "todo" })
  }

  const toggleExpand = (taskId: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) {
        next.delete(taskId)
      } else {
        next.add(taskId)
      }
      return next
    })
  }

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id)
    setEditingTitle(task.title)
  }

  const saveEditing = () => {
    if (editingTaskId && editingTitle.trim()) {
      updateTask(editingTaskId, { title: editingTitle.trim() })
    }
    setEditingTaskId(null)
    setEditingTitle("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEditing()
    } else if (e.key === "Escape") {
      setEditingTaskId(null)
      setEditingTitle("")
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setFilterStatus("all")
    setFilterPriority("all")
    setFilterDueDate("all")
    setSortBy("createdAt")
    setSortDirection("desc")
  }

  const hasActiveFilters = searchQuery || filterStatus !== "all" || filterPriority !== "all" || filterDueDate !== "all"

  const completedSubtasks = (task: Task) => task.subtasks?.filter((st) => st.isCompleted).length || 0

  const confirmDelete = (taskId: string) => {
    setTaskToDelete(taskId)
    setDeleteConfirmOpen(true)
  }

  const handleDelete = () => {
    if (taskToDelete) {
      softDeleteTask(taskToDelete)
      addToast("success", "Task moved to trash")
      setTaskToDelete(null)
    }
  }

  if (projectTasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-1">No tasks yet</h3>
            <p className="text-muted-foreground mb-4">Get started by creating your first task</p>
            <Button onClick={() => window.dispatchEvent(new CustomEvent('open-quick-add'))}>
              Create Task
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Tasks</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-48"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as Task["status"] | "all")}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v as Task["priority"] | "all")}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterDueDate} onValueChange={(v) => setFilterDueDate(v as TaskFilter["dueDate"] | "all")}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Due Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="none">No Due Date</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as TaskSortBy)}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))}
            >
              <ArrowUpDown className={cn("h-4 w-4", sortDirection === "desc" && "rotate-180")} />
            </Button>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {filteredAndSortedTasks.map((task) => {
            const isExpanded = expandedTasks.has(task.id)
            const hasSubtasks = task.subtasks && task.subtasks.length > 0
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done"

            return (
              <div key={task.id} className="space-y-2">
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors group",
                    isOverdue && "border-red-300 dark:border-red-800"
                  )}
                >
                  {hasSubtasks && (
                    <button
                      onClick={() => toggleExpand(task.id)}
                      className="mt-0.5"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  )}
                  {!hasSubtasks && <div className="w-5" />}

                  <button
                    className="mt-0.5"
                    onClick={() => handleToggleStatus(task.id, task.status)}
                    aria-label={`Mark ${task.title} as done`}
                  >
                    {task.status === "done" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                    )}
                  </button>

                  <div className="flex-1">
                    {editingTaskId === task.id ? (
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={saveEditing}
                        onKeyDown={handleKeyDown}
                        className="h-7"
                        autoFocus
                      />
                    ) : (
                      <p 
                        className={cn(
                          "cursor-pointer hover:text-primary",
                          task.status === "done" && "line-through text-muted-foreground"
                        )}
                        onClick={() => startEditing(task)}
                        onDoubleClick={() => setDetailModalTaskId(task.id)}
                      >
                        {task.title}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      {task.dueDate && (
                        <span className={cn(
                          "text-xs flex items-center gap-1",
                          isOverdue ? "text-red-500" : "text-muted-foreground"
                        )}>
                          {isOverdue ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          {task.dueDate}
                        </span>
                      )}
                      {hasSubtasks && (
                        <span className="text-xs text-muted-foreground">
                          {completedSubtasks(task)}/{task.subtasks.length} subtasks
                        </span>
                      )}
                    </div>
                  </div>

                  <Badge className={priorityStyles[task.priority]} variant="outline">
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </Badge>

                  {task.assignees.length > 0 && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs">{task.assignees[0].slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => confirmDelete(task.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Delete ${task.title}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                {hasSubtasks && isExpanded && (
                  <div className="ml-11 space-y-1">
                    {task.subtasks.map((subtask) => (
                      <div
                        key={subtask.id}
                        className="flex items-center gap-2 rounded border border-border/50 bg-muted/30 p-2 pl-3"
                      >
                        <button onClick={() => toggleSubTask(task.id, subtask.id)}>
                          {subtask.isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                        <span className={cn(
                          "text-sm",
                          subtask.isCompleted && "line-through text-muted-foreground"
                        )}>
                          {subtask.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>

      <TaskDetailModal 
        open={!!detailModalTaskId} 
        onOpenChange={(open) => !open && setDetailModalTaskId(null)}
        taskId={detailModalTaskId}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDelete}
        title="Delete Task"
        description="Are you sure you want to delete this task? It will be moved to trash and can be restored within 30 days."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </Card>
  )
}
