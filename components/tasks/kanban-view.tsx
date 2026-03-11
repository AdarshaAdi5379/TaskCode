"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
import { Circle, Plus, Search, X } from "lucide-react"
import { useTaskContext } from "@/lib/task-context"
import type { Task, TaskFilter } from "@/lib/types"
import { cn } from "@/lib/utils"

interface KanbanViewProps {
  projectId: string
}

const priorityStyles: Record<string, string> = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

export function KanbanView({ projectId }: KanbanViewProps) {
  const { getTasksByProject, updateTask, addTask } = useTaskContext()
  const projectTasks = getTasksByProject(projectId)
  
  const [draggedTask, setDraggedTask] = useState<{ taskId: string; sourceStatus: string } | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPriority, setFilterPriority] = useState<Task["priority"] | "all">("all")
  const [addingToColumn, setAddingToColumn] = useState<"todo" | "in-progress" | "done" | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState("")

  const columns: Record<string, { title: string; color: string }> = {
    todo: { title: "To Do", color: "bg-slate-50 dark:bg-slate-900" },
    "in-progress": { title: "In Progress", color: "bg-blue-50 dark:bg-blue-900/20" },
    done: { title: "Done", color: "bg-green-50 dark:bg-green-900/20" },
  }

  const filteredTasks = useMemo(() => {
    let result = projectTasks
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter((task) => 
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      )
    }
    
    if (filterPriority !== "all") {
      result = result.filter((task) => task.priority === filterPriority)
    }
    
    return result
  }, [projectTasks, searchQuery, filterPriority])

  const getTasksByStatusType = (status: "todo" | "in-progress" | "done") => {
    return filteredTasks.filter((task) => task.status === status)
  }

  const handleDragStart = (taskId: string, status: string) => {
    setDraggedTask({ taskId, sourceStatus: status })
  }

  const handleDragOver = (e: React.DragEvent, columnStatus: string) => {
    e.preventDefault()
    setDragOverColumn(columnStatus)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (newStatus: "todo" | "in-progress" | "done") => {
    if (draggedTask && draggedTask.sourceStatus !== newStatus) {
      updateTask(draggedTask.taskId, { status: newStatus })
    }
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  const handleStatusChange = (taskId: string, newStatus: "todo" | "in-progress" | "done") => {
    updateTask(taskId, { status: newStatus })
  }

  const handleQuickAdd = (status: "todo" | "in-progress" | "done") => {
    if (!newTaskTitle.trim()) return
    
    addTask({
      title: newTaskTitle.trim(),
      description: "",
      projectId,
      status,
      priority: "medium",
      assignees: [],
      labels: [],
      tags: [],
    })
    
    setNewTaskTitle("")
    setAddingToColumn(null)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setFilterPriority("all")
  }

  const hasActiveFilters = searchQuery || filterPriority !== "all"

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v as Task["priority"] | "all")}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>

      {/* Kanban Columns */}
      <div className="grid gap-4 overflow-x-auto pb-2">
        <div className="flex gap-6 min-w-max">
          {Object.entries(columns).map(([statusKey, { title, color }]) => {
            const statusTasks = getTasksByStatusType(statusKey as "todo" | "in-progress" | "done")
            const isDragOver = dragOverColumn === statusKey

            return (
              <div
                key={statusKey}
                className={cn(
                  "flex w-80 flex-col rounded-lg border border-border bg-muted/30 p-4 transition-all",
                  color,
                  isDragOver && "ring-2 ring-primary ring-opacity-50 bg-primary/5",
                  draggedTask && draggedTask.sourceStatus !== statusKey && "cursor-drop"
                )}
                onDragOver={(e) => handleDragOver(e, statusKey)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(statusKey as "todo" | "in-progress" | "done")}
              >
                {/* Column Header */}
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                    {statusTasks.length}
                  </span>
                </div>

                {/* Add Task Button */}
                {addingToColumn === statusKey ? (
                  <div className="mb-3 space-y-2">
                    <Input
                      placeholder="Task title..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleQuickAdd(statusKey as "todo" | "in-progress" | "done")
                        if (e.key === "Escape") setAddingToColumn(null)
                      }}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleQuickAdd(statusKey as "todo" | "in-progress" | "done")}>
                        Add
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setAddingToColumn(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mb-3 w-full justify-start text-muted-foreground hover:text-foreground"
                    onClick={() => setAddingToColumn(statusKey as "todo" | "in-progress" | "done")}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add task
                  </Button>
                )}

                {/* Tasks */}
                <div className="space-y-3 flex-1">
                  {statusTasks.map((task) => (
                    <Card
                      key={task.id}
                      className={cn(
                        "cursor-grab active:cursor-grabbing hover:shadow-md transition-all",
                        draggedTask?.taskId === task.id && "opacity-50"
                      )}
                      draggable
                      onDragStart={() => handleDragStart(task.id, task.status)}
                      onDragEnd={() => setDraggedTask(null)}
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start gap-2">
                          <button
                            className="mt-1 flex-shrink-0"
                            onClick={() => {
                              const nextStatus: Record<string, "todo" | "in-progress" | "done"> = {
                                todo: "in-progress",
                                "in-progress": "done",
                                done: "todo",
                              }
                              handleStatusChange(task.id, nextStatus[task.status])
                            }}
                          >
                            <Circle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-snug truncate">{task.title}</p>
                            {task.dueDate && (
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                {task.dueDate}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2">
                          <Badge className={priorityStyles[task.priority]} variant="outline">
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </Badge>
                          {task.assignees.length > 0 && (
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {task.assignees[0].slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {statusTasks.length === 0 && !addingToColumn && (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      No tasks in this column
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
