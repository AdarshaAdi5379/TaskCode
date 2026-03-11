"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, Check, CheckCheck, Trash2, X, MessageSquare, UserPlus, CheckCircle2, AtSign, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useNotificationContext } from "@/lib/notification-context"
import { useProjectContext } from "@/lib/project-context"
import { cn } from "@/lib/utils"
import type { Notification } from "@/lib/types"

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { 
    notifications, 
    unreadCount, 
    filter, 
    setFilter, 
    filteredNotifications,
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll 
  } = useNotificationContext()
  const { projects } = useProjectContext()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowFilters(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "mention":
        return <AtSign className="h-4 w-4 text-blue-500" />
      case "comment":
        return <MessageSquare className="h-4 w-4 text-purple-500" />
      case "task_assigned":
        return <UserPlus className="h-4 w-4 text-green-500" />
      case "task_completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "project_invite":
        return <UserPlus className="h-4 w-4 text-orange-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`
    return new Date(date).toLocaleDateString()
  }

  const clearFilters = () => {
    setFilter({})
    setShowFilters(false)
  }

  const hasActiveFilters = filter.type || filter.projectId

  const displayNotifications = hasActiveFilters ? filteredNotifications : notifications

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-popover border rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
                className={cn("h-7 text-xs", showFilters && "bg-muted")}
              >
                <Filter className="h-3 w-3 mr-1" />
                Filter
              </Button>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-7 text-xs">
                  <CheckCheck className="h-3 w-3 mr-1" />
                </Button>
              )}
              {notifications.length > 0 && (
                <Button variant="ghost" size="icon" onClick={clearAll} className="h-7 w-7">
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="p-3 border-b bg-muted/30 space-y-2">
              <Select 
                value={filter.type || "all"} 
                onValueChange={(v) => setFilter({ ...filter, type: v === "all" ? undefined : v as Notification["type"] })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="mention">Mentions</SelectItem>
                  <SelectItem value="comment">Comments</SelectItem>
                  <SelectItem value="task_assigned">Task Assigned</SelectItem>
                  <SelectItem value="task_completed">Task Completed</SelectItem>
                  <SelectItem value="project_invite">Project Invite</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filter.projectId || "all"} 
                onValueChange={(v) => setFilter({ ...filter, projectId: v === "all" ? undefined : v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full text-xs">
                  Clear filters
                </Button>
              )}
            </div>
          )}

          <div className="max-h-80 overflow-y-auto">
            {displayNotifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {hasActiveFilters ? "No notifications match filters" : "No notifications yet"}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {displayNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-3 hover:bg-muted/50 transition-colors cursor-pointer",
                      !notification.isRead && "bg-blue-50 dark:bg-blue-950/30"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm", !notification.isRead && "font-medium")}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
