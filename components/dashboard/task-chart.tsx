"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
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

  const data = tasks.length > 0 ? getTasksByDay() : [
    { name: "Mon", completed: 0, pending: 0 },
    { name: "Tue", completed: 0, pending: 0 },
    { name: "Wed", completed: 0, pending: 0 },
    { name: "Thu", completed: 0, pending: 0 },
    { name: "Fri", completed: 0, pending: 0 },
    { name: "Sat", completed: 0, pending: 0 },
    { name: "Sun", completed: 0, pending: 0 },
  ]

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Weekly Activity</CardTitle>
        <CardDescription>Tasks completed vs pending this week</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
            <XAxis dataKey="name" stroke="hsl(var(--color-muted-foreground))" />
            <YAxis stroke="hsl(var(--color-muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--color-card))",
                border: "1px solid hsl(var(--color-border))",
              }}
            />
            <Legend />
            <Bar dataKey="completed" stackId="a" fill="hsl(var(--color-chart-2))" name="Completed" />
            <Bar dataKey="pending" stackId="a" fill="hsl(var(--color-chart-3))" name="Pending" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
