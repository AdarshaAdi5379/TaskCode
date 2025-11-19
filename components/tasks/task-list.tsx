"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CheckCircle2, Circle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTaskContext } from "@/lib/task-context"

interface Task {
  id: string
  title: string
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high" | "critical"
  assignees: string[]
  dueDate?: string
}

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
  const { tasks, updateTask, deleteTask, getTasksByProject } = useTaskContext()
  const projectTasks = getTasksByProject(projectId)

  const handleToggleStatus = (taskId: string, currentStatus: string) => {
    const statusMap: Record<string, "todo" | "in-progress" | "done"> = {
      todo: "in-progress",
      "in-progress": "done",
      done: "todo",
    }
    updateTask(taskId, { status: statusMap[currentStatus] || "todo" })
  }

  if (projectTasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No tasks yet. Create one to get started!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {projectTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors group"
            >
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
                <p className={task.status === "done" ? "line-through text-muted-foreground" : ""}>{task.title}</p>
                {task.dueDate && <p className="text-xs text-muted-foreground">Due: {task.dueDate}</p>}
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
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Delete ${task.title}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
