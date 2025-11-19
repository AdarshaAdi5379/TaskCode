"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { name: "Mon", completed: 4, pending: 5 },
  { name: "Tue", completed: 6, pending: 3 },
  { name: "Wed", completed: 5, pending: 4 },
  { name: "Thu", completed: 8, pending: 2 },
  { name: "Fri", completed: 7, pending: 3 },
  { name: "Sat", completed: 3, pending: 2 },
  { name: "Sun", completed: 2, pending: 1 },
]

export function TaskChart() {
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
            <Bar dataKey="completed" stackId="a" fill="hsl(var(--color-chart-2))" />
            <Bar dataKey="pending" stackId="a" fill="hsl(var(--color-chart-3))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
