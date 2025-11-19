"use client"

import { useState } from "react"
import { X, Calendar, Users, Tag, Flag, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useTaskContext } from "@/lib/task-context"

interface TaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
}

export function TaskModal({ open, onOpenChange, projectId }: TaskModalProps) {
  const { addTask } = useTaskContext()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("todo")
  const [priority, setPriority] = useState("medium")
  const [dueDate, setDueDate] = useState("")
  const [assignees, setAssignees] = useState<string[]>([])
  const [labels, setLabels] = useState<string[]>([])

  const allAssignees = [
    { id: "1", name: "You", initials: "YO" },
    { id: "2", name: "Alex Johnson", initials: "AJ" },
    { id: "3", name: "Sarah Chen", initials: "SC" },
  ]

  const priorityColors: Record<string, string> = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }

  const handleAddLabel = () => {
    if (labels.length < 5) {
      setLabels([...labels, `Label ${labels.length + 1}`])
    }
  }

  const handleRemoveLabel = (index: number) => {
    setLabels(labels.filter((_, i) => i !== index))
  }

  const handleAddAssignee = (assigneeId: string) => {
    if (!assignees.includes(assigneeId)) {
      setAssignees([...assignees, assigneeId])
    }
  }

  const handleRemoveAssignee = (assigneeId: string) => {
    setAssignees(assignees.filter((id) => id !== assigneeId))
  }

  const handleCreateTask = () => {
    if (!title.trim()) {
      alert("Please enter a task title")
      return
    }

    addTask({
      title,
      description,
      status: (status as "todo" | "in-progress" | "done") || "todo",
      priority: (priority as "low" | "medium" | "high" | "critical") || "medium",
      dueDate,
      assignees,
      labels,
      projectId,
    })

    // Reset form
    setTitle("")
    setDescription("")
    setStatus("todo")
    setPriority("medium")
    setDueDate("")
    setAssignees([])
    setLabels([])

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Task Title</label>
            <Input
              placeholder="Enter task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              placeholder="Add task description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Grid: Status, Priority, Due Date */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Status
              </label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Flag className="h-4 w-4" />
                Priority
              </label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Due Date
              </label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          {/* Assignees */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Assignees
            </label>
            <div className="flex flex-wrap gap-2">
              {assignees.map((assigneeId) => {
                const assignee = allAssignees.find((a) => a.id === assigneeId)
                return (
                  <Badge key={assigneeId} variant="secondary" className="gap-1">
                    <Avatar className="h-4 w-4">
                      <AvatarFallback className="text-xs">{assignee?.initials}</AvatarFallback>
                    </Avatar>
                    {assignee?.name}
                    <button
                      onClick={() => handleRemoveAssignee(assigneeId)}
                      className="ml-1 hover:opacity-70"
                      aria-label={`Remove ${assignee?.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              })}
            </div>
            <Select onValueChange={handleAddAssignee} value="">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Add assignees..." />
              </SelectTrigger>
              <SelectContent>
                {allAssignees
                  .filter((a) => !assignees.includes(a.id))
                  .map((assignee) => (
                    <SelectItem key={assignee.id} value={assignee.id}>
                      {assignee.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Labels */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Labels
            </label>
            <div className="flex flex-wrap gap-2">
              {labels.map((label, index) => (
                <Badge key={index} variant="outline" className="gap-1">
                  {label}
                  <button
                    onClick={() => handleRemoveLabel(index)}
                    className="ml-1 hover:opacity-70"
                    aria-label="Remove label"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            {labels.length < 5 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLabel}
                className="w-full bg-transparent"
              >
                <Tag className="h-4 w-4 mr-2" />
                Add Label
              </Button>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="button" className="flex-1 bg-primary hover:bg-primary/90" onClick={handleCreateTask}>
              Create Task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
