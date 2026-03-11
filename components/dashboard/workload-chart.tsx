"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { useTaskContext } from "@/lib/task-context"
import { useProjectContext } from "@/lib/project-context"

const COLORS = [
  "hsl(var(--color-chart-1))",
  "hsl(var(--color-chart-2))",
  "hsl(var(--color-chart-3))",
  "hsl(var(--color-chart-4))",
  "hsl(var(--color-chart-5))",
]

export function WorkloadChart() {
  const { tasks } = useTaskContext()
  const { projects } = useProjectContext()

  const getWorkloadByProject = () => {
    const projectCounts: Record<string, number> = {}

    tasks.filter((t) => t.status !== "done").forEach((task) => {
      projectCounts[task.projectId] = (projectCounts[task.projectId] || 0) + 1
    })

    return Object.entries(projectCounts).map(([projectId, count]) => {
      const project = projects.find((p) => p.id === projectId)
      return {
        name: project?.name || "Unknown Project",
        value: count,
        color: project?.color || "bg-gray-500",
      }
    })
  }

  const getWorkloadByPriority = () => {
    const priorityCounts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    }

    tasks.filter((t) => t.status !== "done").forEach((task) => {
      priorityCounts[task.priority]++
    })

    return Object.entries(priorityCounts).map(([priority, count]) => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: count,
    }))
  }

  const projectData = getWorkloadByProject()
  const priorityData = getWorkloadByPriority()

  const totalActiveTasks = tasks.filter((t) => t.status !== "done").length

  if (totalActiveTasks === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workload Distribution</CardTitle>
          <CardDescription>Tasks by project and priority</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            No active tasks
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>By Project</CardTitle>
          <CardDescription>Active tasks distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={projectData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {projectData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--color-card))",
                  border: "1px solid hsl(var(--color-border))",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>By Priority</CardTitle>
          <CardDescription>Active tasks breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {priorityData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.name === "Critical" ? "hsl(0, 72%, 50%)" :
                      entry.name === "High" ? "hsl(24, 90%, 50%)" :
                      entry.name === "Medium" ? "hsl(48, 90%, 50%)" :
                      "hsl(200, 72%, 50%)"
                    } 
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--color-card))",
                  border: "1px solid hsl(var(--color-border))",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
