"use client"

import { useState, use } from "react"
import { X, Calendar, Users, Tag, Flag, CheckCircle2, MessageSquare, Plus, Send, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTaskContext } from "@/lib/task-context"
import { useUserContext } from "@/lib/user-context"
import type { Task } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TaskDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId: string | null
}

const priorityColors: Record<string, string> = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

export function TaskDetailModal({ open, onOpenChange, taskId }: TaskDetailModalProps) {
  const { tasks, updateTask, addComment, deleteComment } = useTaskContext()
  const { user } = useUserContext()
  const [newComment, setNewComment] = useState("")
  
  const task = tasks.find((t) => t.id === taskId)

  const handleAddComment = () => {
    if (!newComment.trim() || !task || !user) return

    const mentions: string[] = []
    const mentionRegex = /@(\w+)/g
    let match
    while ((match = mentionRegex.exec(newComment)) !== null) {
      mentions.push(match[1])
    }

    addComment(task.id, {
      userId: user.id,
      userName: user.displayName,
      content: newComment.trim(),
      mentions,
    })

    setNewComment("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleAddComment()
    }
  }

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className={cn(task.status === "done" && "line-through")}>{task.title}</span>
            <Badge className={priorityColors[task.priority]} variant="outline">
              {task.priority}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments ({task.comments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={task.description}
                onChange={(e) => updateTask(task.id, { description: e.target.value })}
                className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Add a description..."
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Status
              </label>
              <Select value={task.status} onValueChange={(v) => updateTask(task.id, { status: v as Task["status"] })}>
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
              <Select value={task.priority} onValueChange={(v) => updateTask(task.id, { priority: v as Task["priority"] })}>
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
              <Input 
                type="date" 
                value={task.dueDate || ""} 
                onChange={(e) => updateTask(task.id, { dueDate: e.target.value })} 
              />
            </div>

            {/* Subtasks */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Subtasks ({task.subtasks.filter((st) => st.isCompleted).length}/{task.subtasks.length})
                </label>
                <div className="space-y-2">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-2 rounded border p-2">
                      <button onClick={() => {}}>
                        {subtask.isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2" />
                        )}
                      </button>
                      <span className={cn(subtask.isCompleted && "line-through text-muted-foreground")}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="comments" className="mt-4">
            <div className="space-y-4">
              {/* Add Comment */}
              <div className="flex gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user?.displayName?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Write a comment... (use @mention to mention someone)"
                    className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full"
                  />
                  <div className="flex justify-between">
                    <p className="text-xs text-muted-foreground">Press Enter to send, Shift+Enter for new line</p>
                    <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                      <Send className="h-4 w-4 mr-1" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4 pt-4">
                {task.comments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No comments yet</p>
                ) : (
                  task.comments
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{comment.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{comment.userName}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => deleteComment(task.id, comment.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                          {comment.mentions.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {comment.mentions.map((mention) => (
                                <Badge key={mention} variant="secondary" className="text-xs">
                                  @{mention}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
