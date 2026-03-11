"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts"
import { useTaskContext } from "@/lib/task-context"

export function TaskChart() {
  const { tasks } = useTaskContext()

  const getTasksByDay = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const today = new Date()
    const result: { name: string; completed: number; pending: number }[] = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayName = days[date.getDay()]
      const dateString = date.toDateString()

      const completed = tasks.filter(
        (task) => task.status === "done" && new Date(task.createdAt).toDateString() === dateString,
      ).length
      const pending = tasks.filter(
        (task) => task.status !== "done" && new Date(task.createdAt).toDateString() === dateString,
      ).length

      result.push({ name: dayName, completed, pending })
    }

    return result
  }

  const getCompletionTrend = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const today = new Date()
    const result: { name: string; completed: number; cumulative: number }[] = []
    let cumulative = 0

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayName = days[date.getDay()]
      const dateString = date.toDateString()

      const completed = tasks.filter(
        (task) => task.status === "done" && task.completedAt && new Date(task.completedAt).toDateString() === dateString,
      ).length

      cumulative += completed
      result.push({ name: dayName, completed, cumulative })
    }

    return result
  }

  const barData = tasks.length > 0 ? getTasksByDay() : [
    { name: "Mon", completed: 0, pending: 0 },
    { name: "Tue", completed: 0, pending: 0 },
    { name: "Wed", completed: 0, pending: 0 },
    { name: "Thu", completed: 0, pending: 0 },
    { name: "Fri", completed: 0, pending: 0 },
    { name: "Sat", completed: 0, pending: 0 },
    { name: "Sun", completed: 0, pending: 0 },
  ]

  const lineData = getCompletionTrend()

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
          <CardDescription>Tasks created this week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
              <XAxis dataKey="name" stroke="hsl(var(--color-muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--color-muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--color-card))",
                  border: "1px solid hsl(var(--color-border))",
                }}
              />
              <Legend />
              <Bar dataKey="completed" stackId="a" fill="hsl(var(--color-chart-2))" name="Completed" radius={[0, 0, 0, 0]} />
              <Bar dataKey="pending" stackId="a" fill="hsl(var(--color-chart-3))" name="Pending" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Completion Trend</CardTitle>
          <CardDescription>Cumulative tasks completed</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
              <XAxis dataKey="name" stroke="hsl(var(--color-muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--color-muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--color-card))",
                  border: "1px solid hsl(var(--color-border))",
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="cumulative" 
                stroke="hsl(var(--color-chart-1))" 
                strokeWidth={2}
                name="Total Completed"
                dot={{ fill: "hsl(var(--color-chart-1))" }}
              />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="hsl(var(--color-chart-2))" 
                strokeWidth={2}
                name="Daily Completed"
                dot={{ fill: "hsl(var(--color-chart-2))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
