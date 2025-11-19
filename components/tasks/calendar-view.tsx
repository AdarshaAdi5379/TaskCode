"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTaskContext } from "@/lib/task-context"
import type { Task } from "@/lib/types"

interface CalendarViewProps {
  projectId: string
}

export function CalendarView({ projectId }: CalendarViewProps) {
  const { getTasksByProject } = useTaskContext()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const projectTasks = getTasksByProject(projectId)

  // Get tasks for the selected date
  const selectedDateString = selectedDate.toDateString()
  const tasksForSelectedDate = projectTasks.filter((task) => {
    if (!task.dueDate) return false
    return new Date(task.dueDate).toDateString() === selectedDateString
  })

  // Get all dates that have tasks
  const datesWithTasks = new Set(
    projectTasks.filter((task) => task.dueDate).map((task) => new Date(task.dueDate).toDateString()),
  )

  // Priority colors
  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
    }
  }

  // Status colors
  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "done":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "in-progress":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
      case "todo":
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Calendar */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
          <CardDescription>View tasks by due date</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            disabled={(date) => {
              // Disable dates that don't have tasks (optional - remove this line to allow all dates)
              return false
            }}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Tasks for Selected Date */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </CardTitle>
          <CardDescription>
            {tasksForSelectedDate.length} task{tasksForSelectedDate.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasksForSelectedDate.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks scheduled for this date</p>
          ) : (
            tasksForSelectedDate.map((task) => (
              <div key={task.id} className="space-y-2 rounded-lg border p-3">
                <h4 className="font-medium line-clamp-2">{task.title}</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getStatusColor(task.status)} variant="secondary">
                    {task.status}
                  </Badge>
                  <Badge className={getPriorityColor(task.priority)} variant="secondary">
                    {task.priority}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
