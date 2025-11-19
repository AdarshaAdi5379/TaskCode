"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Circle } from "lucide-react"
import { useTaskContext } from "@/lib/task-context"

interface Task {
  id: string
  title: string
  priority: "low" | "medium" | "high" | "critical"
  assignees: string[]
  status: "todo" | "in-progress" | "done"
  dueDate?: string
}

interface Column {
  id: string
  title: string
  tasks: Task[]
}

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
  const { getTasksByProject, updateTask } = useTaskContext()
  const projectTasks = getTasksByProject(projectId)

  const columns: Record<string, { title: string; color: string }> = {
    todo: { title: "To Do", color: "bg-slate-50 dark:bg-slate-900" },
    "in-progress": { title: "In Progress", color: "bg-blue-50 dark:bg-blue-900/20" },
    done: { title: "Done", color: "bg-green-50 dark:bg-green-900/20" },
  }

  const getTasksByStatusType = (status: "todo" | "in-progress" | "done") => {
    return projectTasks.filter((task) => task.status === status)
  }

  const handleStatusChange = (taskId: string, newStatus: "todo" | "in-progress" | "done") => {
    updateTask(taskId, { status: newStatus })
  }

  return (
    <div className="grid gap-4 overflow-x-auto pb-2">
      <div className="flex gap-6 min-w-max">
        {Object.entries(columns).map(([statusKey, { title, color }]) => {
          const statusTasks = getTasksByStatusType(statusKey as "todo" | "in-progress" | "done")
          return (
            <div
              key={statusKey}
              className={`flex w-80 flex-col rounded-lg border border-border bg-muted/30 p-4 ${color}`}
            >
              {/* Column Header */}
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{title}</h3>
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                  {statusTasks.length}
                </span>
              </div>

              {/* Tasks */}
              <div className="space-y-3 flex-1">
                {statusTasks.map((task) => (
                  <Card key={task.id} className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <button
                          className="mt-1"
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
                        <div className="flex-1">
                          <p className="text-sm font-medium leading-snug">{task.title}</p>
                          {task.dueDate && <p className="text-xs text-muted-foreground mt-1">Due: {task.dueDate}</p>}
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
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
