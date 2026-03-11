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
import { parseNaturalLanguage, suggestPriority } from "@/lib/ai-service"
import { Sparkles, Zap, Calendar, Tag, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface QuickAddTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickAddTaskModal({ open, onOpenChange }: QuickAddTaskModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [projectId, setProjectId] = useState<string>("")
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">("medium")
  const [dueDate, setDueDate] = useState("")
  const [labels, setLabels] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [detectedInfo, setDetectedInfo] = useState<{
    priority?: string
    dueDate?: string
    labels?: string[]
  }>({})
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
      setDueDate("")
      setLabels([])
      setDetectedInfo({})
    }
  }, [open, projects, projectId])

  const analyzeInput = (input: string) => {
    if (!input.trim() || input.length < 5) {
      setDetectedInfo({})
      return
    }

    setIsAnalyzing(true)

    setTimeout(() => {
      try {
        const parsed = parseNaturalLanguage(input)
        const suggestedPriority = suggestPriority(input)

        const newDetectedInfo: typeof detectedInfo = {}

        if (parsed.priority) {
          newDetectedInfo.priority = parsed.priority
        } else {
          newDetectedInfo.priority = suggestedPriority
        }

        if (parsed.dueDate) {
          newDetectedInfo.dueDate = parsed.dueDate
        }

        if (parsed.labels && parsed.labels.length > 0) {
          newDetectedInfo.labels = parsed.labels
        }

        setDetectedInfo(newDetectedInfo)

        if (newDetectedInfo.priority) {
          setPriority(newDetectedInfo.priority as "low" | "medium" | "high" | "critical")
        }
        if (newDetectedInfo.dueDate) {
          setDueDate(newDetectedInfo.dueDate)
        }
        if (newDetectedInfo.labels) {
          setLabels(newDetectedInfo.labels)
        }
      } catch (e) {
        console.error("[TaskZen] Error parsing input:", e)
      }
      setIsAnalyzing(false)
    }, 300)
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    analyzeInput(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !projectId) return

    setIsLoading(true)

    setTimeout(() => {
      addTask({
        title: title.trim(),
        description: description.trim(),
        projectId,
        status: "todo",
        priority,
        dueDate: dueDate || undefined,
        assignees: [],
        labels,
        tags: [],
      })
      setTitle("")
      setDescription("")
      setProjectId("")
      setPriority("medium")
      setDueDate("")
      setLabels([])
      setDetectedInfo({})
      setIsLoading(false)
      onOpenChange(false)
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Quick Add Task
          </DialogTitle>
          <DialogDescription>
            Create a task instantly. Use natural language like "Finish report by Friday #work #urgent"
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Task Title</Label>
            <div className="relative">
              <Input
                id="task-title"
                placeholder="What needs to be done? (e.g., Finish report by Friday #urgent)"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
              {isAnalyzing && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Zap className="h-4 w-4 animate-pulse text-primary" />
                </div>
              )}
            </div>

            {Object.keys(detectedInfo).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {detectedInfo.priority && (
                  <Badge variant="outline" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Priority: {detectedInfo.priority}
                  </Badge>
                )}
                {detectedInfo.dueDate && (
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    Due: {new Date(detectedInfo.dueDate).toLocaleDateString()}
                  </Badge>
                )}
                {detectedInfo.labels && detectedInfo.labels.map((label) => (
                  <Badge key={label} variant="secondary" className="gap-1">
                    <Tag className="h-3 w-3" />
                    {label}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 rounded-lg bg-muted/50 text-sm">
            <p className="font-medium mb-2">Try natural language:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• "Fix login bug by tomorrow #urgent"</li>
              <li>• "Write documentation next week #docs"</li>
              <li>• "Review PR today @john"</li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project-select">Project</Label>
              {projects.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">No projects</p>
              ) : (
                <Select value={projectId} onValueChange={setProjectId} disabled={isLoading}>
                  <SelectTrigger id="project-select">
                    <SelectValue placeholder="Select project" />
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

            <div className="space-y-2">
              <Label htmlFor="priority-select">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)} disabled={isLoading}>
                <SelectTrigger id="priority-select">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date</Label>
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="labels">Labels</Label>
              <Input
                id="labels"
                placeholder="work, urgent, docs"
                value={labels.join(", ")}
                onChange={(e) => setLabels(e.target.value.split(",").map((l) => l.trim()).filter(Boolean))}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Input
              id="task-description"
              placeholder="Additional details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
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
