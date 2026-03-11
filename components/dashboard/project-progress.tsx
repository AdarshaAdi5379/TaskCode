"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useTaskContext } from "@/lib/task-context"
import { useProjectContext } from "@/lib/project-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink, Folder } from "lucide-react"
import { cn } from "@/lib/utils"

export function ProjectProgress() {
  const { tasks } = useTaskContext()
  const { getActiveProjects, getProject } = useProjectContext()

  const activeProjects = getActiveProjects()

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter((t) => t.projectId === projectId)
    const total = projectTasks.length
    const completed = projectTasks.filter((t) => t.status === "done").length
    const inProgress = projectTasks.filter((t) => t.status === "in-progress").length
    const todo = projectTasks.filter((t) => t.status === "todo").length
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0

    return { total, completed, inProgress, todo, progress }
  }

  if (activeProjects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Progress</CardTitle>
          <CardDescription>Track your projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No active projects</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Progress</CardTitle>
        <CardDescription>Overview of your projects</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeProjects.slice(0, 5).map((project) => {
          const stats = getProjectStats(project.id)

          return (
            <div key={project.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", project.color)} />
                  <span className="font-medium text-sm">{project.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {stats.completed}/{stats.total} tasks
                </span>
              </div>
              <Progress value={stats.progress} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{stats.progress}% complete</span>
                <div className="flex gap-2">
                  {stats.inProgress > 0 && (
                    <span>{stats.inProgress} in progress</span>
                  )}
                  {stats.todo > 0 && (
                    <span>{stats.todo} to do</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {activeProjects.length > 5 && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            +{activeProjects.length - 5} more projects
          </p>
        )}
      </CardContent>
    </Card>
  )
}
