"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, AlertCircle, TrendingUp } from "lucide-react"
import { useTaskContext } from "@/lib/task-context"

export function KPICards() {
  const { tasks, getTasksByStatus } = useTaskContext()

  const pendingTasks = getTasksByStatus("todo")
  const inProgressTasks = getTasksByStatus("in-progress")
  const completedTasks = getTasksByStatus("done")

  const overdueTasks = tasks.filter((task) => {
    if (!task.dueDate || task.status === "done") return false
    return new Date(task.dueDate) < new Date()
  })

  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0

  const kpis = [
    {
      title: "Pending Tasks",
      value: (pendingTasks.length + inProgressTasks.length).toString(),
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Completed",
      value: completedTasks.length.toString(),
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Overdue",
      value: overdueTasks.length.toString(),
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              <p className="text-xs text-muted-foreground">
                {kpi.title === "Completion Rate" ? "This week" : "Total in workspace"}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
