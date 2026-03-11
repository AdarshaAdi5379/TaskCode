"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, AlertCircle, TrendingUp, Target, Flame } from "lucide-react"
import { useTaskContext } from "@/lib/task-context"

const DEFAULT_USER_ID = "current-user"

export function KPICards() {
  const { tasks, getTasksByStatus, getOverdueTasks, getTodaysTasks, getMyTasks } = useTaskContext()

  const pendingTasks = getTasksByStatus("todo")
  const inProgressTasks = getTasksByStatus("in-progress")
  const completedTasks = getTasksByStatus("done")
  const overdueTasks = getOverdueTasks()
  const todaysTasks = getTodaysTasks()
  const myTasks = getMyTasks(DEFAULT_USER_ID)

  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0

  const getProductivityStreak = () => {
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      const dateString = checkDate.toDateString()
      
      const completedOnDay = tasks.filter((task) => 
        task.status === "done" && 
        task.completedAt && 
        new Date(task.completedAt).toDateString() === dateString
      )
      
      if (completedOnDay.length > 0) {
        streak++
      } else if (i > 0) {
        break
      }
    }
    return streak
  }

  const streak = getProductivityStreak()

  const kpis = [
    {
      title: "My Tasks",
      value: myTasks.length.toString(),
      icon: Target,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      description: "Assigned to you",
    },
    {
      title: "Due Today",
      value: todaysTasks.length.toString(),
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      description: "Tasks due today",
    },
    {
      title: "Overdue",
      value: overdueTasks.length.toString(),
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      description: "Needs attention",
    },
    {
      title: "Completed",
      value: completedTasks.length.toString(),
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      description: "Total completed",
    },
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      description: "Of all tasks",
    },
    {
      title: "Streak",
      value: `${streak} days`,
      icon: Flame,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      description: "Consecutive days",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi) => {
        const Icon = kpi.icon
        return (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <div className={`rounded-lg p-2 ${kpi.bgColor}`}>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">{kpi.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
