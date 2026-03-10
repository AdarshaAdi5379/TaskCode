"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CheckCircle2 } from "lucide-react"
import { useTaskContext } from "@/lib/task-context"

export function TeamActivity() {
  const { tasks } = useTaskContext()

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)

  const getActionText = (status: string) => {
    switch (status) {
      case "done":
        return "completed"
      case "in-progress":
        return "started"
      default:
        return "created"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`
    return "Just now"
  }

  const activities =
    recentTasks.length > 0
      ? recentTasks.map((task) => ({
          user: task.assignees[0] || "You",
          action: getActionText(task.status),
          task: task.title,
          time: getTimeAgo(task.createdAt),
          initials: getInitials(task.assignees[0] || "You"),
        }))
      : [
          { user: "Alex Johnson", action: "completed", task: "API Setup", time: "2 hours ago", initials: "AJ" },
          { user: "Sarah Chen", action: "started", task: "UI Design", time: "4 hours ago", initials: "SC" },
          { user: "Mike Ross", action: "commented on", task: "Database Schema", time: "6 hours ago", initials: "MR" },
          { user: "Emily Davis", action: "assigned", task: "Documentation", time: "1 day ago", initials: "ED" },
        ]

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle>Team Activity</CardTitle>
        <CardDescription>Recent updates from your team</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="text-xs">{activity.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{activity.user}</p>
                <p className="text-xs text-muted-foreground">
                  <span>{activity.action}</span>
                  {activity.action === "completed" && <CheckCircle2 className="h-3 w-3 inline ml-1 text-green-500" />}{" "}
                  <span className="font-medium truncate">{activity.task}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
