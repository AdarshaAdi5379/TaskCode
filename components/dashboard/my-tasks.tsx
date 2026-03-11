"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, AlertCircle, Clock, MoreHorizontal, ExternalLink } from "lucide-react"
import { useTaskContext } from "@/lib/task-context"
import { useProjectContext } from "@/lib/project-context"
import Link from "next/link"
import { cn } from "@/lib/utils"

const DEFAULT_USER_ID = "current-user"

const priorityStyles: Record<string, string> = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

export function MyTasks() {
  const { getMyTasks, updateTask } = useTaskContext()
  const { getProject } = useProjectContext()

  const myTasks = getMyTasks(DEFAULT_USER_ID)

  const handleToggleStatus = (taskId: string, currentStatus: string) => {
    const statusMap: Record<string, "todo" | "in-progress" | "done"> = {
      todo: "in-progress",
      "in-progress": "done",
      done: "todo",
    }
    updateTask(taskId, { status: statusMap[currentStatus] || "todo" })
  }

  const sortedTasks = [...myTasks].sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })

  const overdueTasks = sortedTasks.filter((task) => {
    if (!task.dueDate) return false
    return new Date(task.dueDate) < new Date()
  })

  const todayTasks = sortedTasks.filter((task) => {
    if (!task.dueDate) return false
    const today = new Date()
    return new Date(task.dueDate).toDateString() === today.toDateString()
  })

  const upcomingTasks = sortedTasks.filter((task) => {
    if (!task.dueDate) return false
    const today = new Date()
    const dueDate = new Date(task.dueDate)
    return dueDate > today
  })

  const noDueDateTasks = sortedTasks.filter((task) => !task.dueDate)

  if (myTasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
          <CardDescription>Tasks assigned to you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No tasks assigned to you</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const TaskItem = ({ task }: { task: typeof myTasks[0] }) => {
    const project = getProject(task.projectId)
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done"

    return (
      <div className={cn(
        "flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors group",
        isOverdue && "border-red-300 dark:border-red-800"
      )}>
        <button
          onClick={() => handleToggleStatus(task.id, task.status)}
          className="mt-0.5"
        >
          {task.status === "done" ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-medium truncate",
            task.status === "done" && "line-through text-muted-foreground"
          )}>
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {project && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <div className={cn("w-2 h-2 rounded-full", project.color)} />
                {project.name}
              </span>
            )}
            {task.dueDate && (
              <span className={cn(
                "text-xs flex items-center gap-1",
                isOverdue ? "text-red-500" : "text-muted-foreground"
              )}>
                {isOverdue ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                {task.dueDate}
              </span>
            )}
          </div>
        </div>

        <Badge className={priorityStyles[task.priority]} variant="outline">
          {task.priority}
        </Badge>

        <Link href={`/projects/${task.projectId}`}>
          <Button variant="ghost" size="icon">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>My Tasks</CardTitle>
            <CardDescription>{myTasks.length} tasks assigned to you</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {overdueTasks.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-red-500 mb-2 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Overdue ({overdueTasks.length})
            </h4>
            <div className="space-y-2">
              {overdueTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        {todayTasks.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-orange-500 mb-2 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Due Today ({todayTasks.length})
            </h4>
            <div className="space-y-2">
              {todayTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        {upcomingTasks.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">
              Upcoming ({upcomingTasks.length})
            </h4>
            <div className="space-y-2">
              {upcomingTasks.slice(0, 5).map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
              {upcomingTasks.length > 5 && (
                <p className="text-xs text-muted-foreground pl-8">
                  +{upcomingTasks.length - 5} more tasks
                </p>
              )}
            </div>
          </div>
        )}

        {noDueDateTasks.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">
              No Due Date ({noDueDateTasks.length})
            </h4>
            <div className="space-y-2">
              {noDueDateTasks.slice(0, 3).map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
