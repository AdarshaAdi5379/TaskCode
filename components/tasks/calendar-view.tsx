"use client"

import { useState, useMemo } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  ChevronLeft, 
  ChevronRight, 
  CalendarDays,
  LayoutGrid,
  List,
  Clock,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import { useTaskContext } from "@/lib/task-context"
import { useProjectContext } from "@/lib/project-context"
import type { Task } from "@/lib/types"
import { cn } from "@/lib/utils"

interface CalendarViewProps {
  projectId: string
}

type ViewMode = "month" | "week"

const priorityColors: Record<Task["priority"], string> = {
  low: "bg-blue-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
}

const statusColors: Record<Task["status"], string> = {
  todo: "bg-gray-400",
  "in-progress": "bg-purple-500",
  done: "bg-green-500",
}

export function CalendarView({ projectId }: CalendarViewProps) {
  const { getTasksByProject, updateTask } = useTaskContext()
  const { getProject } = useProjectContext()
  const project = getProject(projectId)
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>("month")
  const [colorBy, setColorBy] = useState<"priority" | "status">("priority")

  const projectTasks = getTasksByProject(projectId)

  const tasksForSelectedDate = useMemo(() => {
    const selectedDateString = selectedDate.toDateString()
    return projectTasks.filter((task) => {
      if (!task.dueDate) return false
      return new Date(task.dueDate).toDateString() === selectedDateString
    })
  }, [projectTasks, selectedDate])

  const getTaskCountForDate = (date: Date) => {
    const dateString = date.toDateString()
    return projectTasks.filter((task) => {
      if (!task.dueDate) return false
      return new Date(task.dueDate).toDateString() === dateString
    }).length
  }

  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() - 1)
    setCurrentMonth(newMonth)
  }

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + 1)
    setCurrentMonth(newMonth)
  }

  const handleToday = () => {
    const today = new Date()
    setCurrentMonth(today)
    setSelectedDate(today)
  }

  const getColorForTask = (task: Task) => {
    return colorBy === "priority" ? priorityColors[task.priority] : statusColors[task.status]
  }

  const today = new Date()
  const isToday = (date: Date) => date.toDateString() === today.toDateString()

  const overdueCount = projectTasks.filter((task) => {
    if (!task.dueDate || task.status === "done") return false
    return new Date(task.dueDate) < today
  }).length

  const upcomingCount = projectTasks.filter((task) => {
    if (!task.dueDate || task.status === "done") return false
    const dueDate = new Date(task.dueDate)
    return dueDate >= today
  }).length

  const completedCount = projectTasks.filter((t) => t.status === "done").length

  const handleDateSelect = (date: Date | undefined) => {
    if (date) setSelectedDate(date)
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToday}>
            <CalendarDays className="h-4 w-4 mr-1" />
            Today
          </Button>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <span className="font-medium text-lg">
            {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Select value={colorBy} onValueChange={(v) => setColorBy(v as "priority" | "status")}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Color by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex rounded-lg border">
            <Button
              variant={viewMode === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("month")}
              className="rounded-r-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("week")}
              className="rounded-l-none rounded-r-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Due Today</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {getTaskCountForDate(today)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-muted-foreground">Overdue</span>
            </div>
            <p className="text-2xl font-bold mt-1">{overdueCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>
            <p className="text-2xl font-bold mt-1">{completedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Upcoming</span>
            </div>
            <p className="text-2xl font-bold mt-1">{upcomingCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Calendar</CardTitle>
            <CardDescription>
              Click on a date to view tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Tasks for Selected Date */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
              {isToday(selectedDate) && (
                <Badge variant="secondary" className="ml-2">Today</Badge>
              )}
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
                <div 
                  key={task.id} 
                  className="space-y-2 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", getColorForTask(task))} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium line-clamp-2">{task.title}</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {task.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
