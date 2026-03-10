"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTaskContext } from "@/lib/task-context"
import { useProjectContext } from "@/lib/project-context"

interface QuickAddTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickAddTaskModal({ open, onOpenChange }: QuickAddTaskModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [projectId, setProjectId] = useState<string>("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [isLoading, setIsLoading] = useState(false)
  const { addTask } = useTaskContext()
  const { projects } = useProjectContext()

  useEffect(() => {
    if (open && projects.length > 0 && !projectId) {
      setProjectId(projects[0].id)
    }
    if (!open) {
      setTitle("")
      setDescription("")
      setProjectId("")
      setPriority("medium")
    }
  }, [open, projects, projectId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !projectId) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      addTask({
        title: title.trim(),
        description: description.trim(),
        projectId,
        status: "todo",
        priority,
        assignees: [],
        labels: [],
      })
      setTitle("")
      setDescription("")
      setProjectId("")
      setPriority("medium")
      setIsLoading(false)
      onOpenChange(false)
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Quick Add Task</DialogTitle>
          <DialogDescription>Create a new task quickly</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="task-title">Task Title</Label>
            <Input
              id="task-title"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>

          {/* Project Selection */}
          <div className="space-y-2">
            <Label htmlFor="project-select">Project</Label>
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No projects available. Create a project first.</p>
            ) : (
              <Select value={projectId} onValueChange={setProjectId} disabled={isLoading}>
                <SelectTrigger id="project-select">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority-select">Priority</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as any)} disabled={isLoading}>
              <SelectTrigger id="priority-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="task-description">Description (optional)</Label>
            <Input
              id="task-description"
              placeholder="Add details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim() || !projectId || projects.length === 0}>
              {isLoading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
