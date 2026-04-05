"use client"

import type React from "react"
import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react"
import type { Task, TaskContextType, SubTask, Comment, TaskSortBy, TaskFilter, TaskDependency } from "./types"
import { useUserContext } from "./user-context"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "./supabase/client"
import { deserializeTask, serializeTask } from "./supabase/serializers"

const TaskContext = createContext<TaskContextType | undefined>(undefined)

const DEFAULT_PROJECT_SETTINGS = {
  defaultPriority: "medium" as const,
  defaultStatus: "todo" as const,
  autoCompleteSubtasks: true,
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const { user, isAuthenticated, isLoading } = useUserContext()
  const useSupabase = useMemo(() => isSupabaseConfigured(), [])

  useEffect(() => {
    if (useSupabase) return
    const stored = localStorage.getItem("taskzen-tasks")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setTasks(parsed.map((t: Task) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          updatedAt: t.updatedAt ? new Date(t.updatedAt) : undefined,
          deletedAt: t.deletedAt ? new Date(t.deletedAt) : undefined,
          completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
          subtasks: t.subtasks?.map((st: SubTask) => ({
            ...st,
            completedAt: st.completedAt ? new Date(st.completedAt) : undefined,
          })) || [],
          comments: t.comments?.map((c: Comment) => ({
            ...c,
            createdAt: new Date(c.createdAt),
          })) || [],
          dependencies: t.dependencies ?? [],
          issueType: t.issueType ?? "task",
        })))
      } catch (e) {
        console.error("[TaskZen] Failed to load tasks from localStorage:", e)
      }
    }
    setIsHydrated(true)
  }, [useSupabase])

  useEffect(() => {
    if (!useSupabase) return
    if (isLoading) return

    if (!isAuthenticated || !user) {
      setTasks([])
      setIsHydrated(true)
      return
    }

    let cancelled = false
    const supabase = getSupabaseBrowserClient()

    const load = async () => {
      setIsHydrated(false)
      const { data, error } = await supabase
        .from("tasks")
        .select("data")
        .order("created_at", { ascending: false })

      if (cancelled) return

      if (error) {
        console.error("[TaskZen] Failed to load tasks from Supabase:", error)
        setTasks([])
        setIsHydrated(true)
        return
      }

      setTasks((data ?? []).map((row: any) => deserializeTask(row.data)))
      setIsHydrated(true)
    }

    load()

    return () => {
      cancelled = true
    }
  }, [useSupabase, isAuthenticated, isLoading, user?.id])

  useEffect(() => {
    if (useSupabase) return
    if (isHydrated) {
      localStorage.setItem("taskzen-tasks", JSON.stringify(tasks))
    }
  }, [tasks, isHydrated, useSupabase])

  const addTask = useCallback((newTaskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "isSoftDeleted" | "deletedAt" | "subtasks" | "isCompleted" | "completedAt" | "comments" | "dependencies">) => {
    const task: Task = {
      ...newTaskData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
      isSoftDeleted: false,
      subtasks: [],
      isCompleted: false,
      comments: [],
      dependencies: [],
      issueType: newTaskData.issueType ?? "task",
    }
    setTasks((prev) => [task, ...prev])
    if (useSupabase && user) void persistTaskToSupabase(task, user.id)
  }, [useSupabase, user])

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    let updated: Task | null = null
    setTasks((prev) => prev.map((task) => {
      if (task.id === id) {
        const updatedTask = { ...task, ...updates, updatedAt: new Date() }
        
        // Handle status completion
        if (updates.status === "done" && task.status !== "done") {
          updatedTask.isCompleted = true
          updatedTask.completedAt = new Date()
        } else if (updates.status && updates.status !== "done" && task.status === "done") {
          updatedTask.isCompleted = false
          updatedTask.completedAt = undefined
        }
        
        updated = updatedTask
        return updatedTask
      }
      return task
    }))
    if (useSupabase && user && updated) void persistTaskToSupabase(updated, user.id)
  }, [useSupabase, user])

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
    if (useSupabase) void deleteTaskFromSupabase(id)
  }, [useSupabase])

  const softDeleteTask = useCallback((id: string) => {
    let updated: Task | null = null
    setTasks((prev) => prev.map((task) =>
      task.id === id
        ? (updated = { ...task, isSoftDeleted: true, deletedAt: new Date(), updatedAt: new Date() })
        : task,
    ))
    if (useSupabase && user && updated) void persistTaskToSupabase(updated, user.id)
  }, [useSupabase, user])

  const restoreTask = useCallback((id: string) => {
    let updated: Task | null = null
    setTasks((prev) => prev.map((task) =>
      task.id === id
        ? (updated = { ...task, isSoftDeleted: false, deletedAt: undefined, updatedAt: new Date() })
        : task,
    ))
    if (useSupabase && user && updated) void persistTaskToSupabase(updated, user.id)
  }, [useSupabase, user])

  const permanentDeleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
    if (useSupabase) void deleteTaskFromSupabase(id)
  }, [useSupabase])

  const snoozeTask = useCallback((id: string, until: string) => {
    let updated: Task | null = null
    setTasks((prev) => prev.map((task) =>
      task.id === id
        ? (updated = { ...task, snoozedUntil: until, updatedAt: new Date() })
        : task,
    ))
    if (useSupabase && user && updated) void persistTaskToSupabase(updated, user.id)
  }, [useSupabase, user])

  const getTasksByProject = useCallback((projectId: string) => {
    return tasks.filter((task) => task.projectId === projectId && !task.isSoftDeleted)
  }, [tasks])

  const getTasksByStatus = useCallback((status: Task["status"]) => {
    return tasks.filter((task) => task.status === status && !task.isSoftDeleted)
  }, [tasks])

  const getActiveTasks = useCallback(() => {
    const now = new Date()
    return tasks.filter((task) => {
      if (task.isSoftDeleted) return false
      if (task.snoozedUntil && new Date(task.snoozedUntil) > now) return false
      return true
    })
  }, [tasks])

  const getTrashedTasks = useCallback(() => {
    return tasks.filter((task) => task.isSoftDeleted)
  }, [tasks])

  const getSnoozedTasks = useCallback(() => {
    const now = new Date()
    return tasks.filter((task) => 
      task.snoozedUntil && new Date(task.snoozedUntil) > now && !task.isSoftDeleted
    )
  }, [tasks])

  const getOverdueTasks = useCallback(() => {
    const now = new Date()
    return tasks.filter((task) => {
      if (!task.dueDate || task.status === "done" || task.isSoftDeleted) return false
      // Exclude snoozed tasks — they are intentionally deferred
      if (task.snoozedUntil && new Date(task.snoozedUntil) > now) return false
      return new Date(task.dueDate) < now
    })
  }, [tasks])

  const getTodaysTasks = useCallback(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tasks.filter((task) => {
      if (!task.dueDate || task.status === "done" || task.isSoftDeleted) return false
      const dueDate = new Date(task.dueDate)
      return dueDate >= today && dueDate < tomorrow
    })
  }, [tasks])

  const getMyTasks = useCallback((userId: string) => {
    return tasks.filter((task) => 
      task.assignees.includes(userId) && !task.isSoftDeleted && task.status !== "done"
    )
  }, [tasks])

  const sortTasks = useCallback((tasksToSort: Task[], sortBy: TaskSortBy, direction: "asc" | "desc" = "asc") => {
    const sorted = [...tasksToSort].sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case "priority": {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
        }
        case "dueDate":
          if (!a.dueDate && !b.dueDate) comparison = 0
          else if (!a.dueDate) comparison = 1
          else if (!b.dueDate) comparison = -1
          else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          break
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case "status": {
          const statusOrder = { todo: 1, "in-progress": 2, done: 3 }
          comparison = statusOrder[a.status] - statusOrder[b.status]
          break
        }
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
      }
      return direction === "desc" ? -comparison : comparison
    })
    return sorted
  }, [])

  const filterTasks = useCallback((tasksToFilter: Task[], filter: TaskFilter) => {
    return tasksToFilter.filter((task) => {
      if (filter.status && task.status !== filter.status) return false
      if (filter.priority && task.priority !== filter.priority) return false
      if (filter.assignee && !task.assignees.includes(filter.assignee)) return false
      if (filter.dueDate) {
        const now = new Date()
        now.setHours(0, 0, 0, 0)
        const today = new Date(now)
        const upcoming = new Date(now)
        upcoming.setDate(upcoming.getDate() + 7)
        
        if (!task.dueDate && filter.dueDate !== "none") return false
        
        if (filter.dueDate === "overdue") {
          if (!task.dueDate || new Date(task.dueDate) >= now) return false
        } else if (filter.dueDate === "today") {
          if (!task.dueDate) return false
          const dueDate = new Date(task.dueDate)
          if (dueDate.toDateString() !== now.toDateString()) return false
        } else if (filter.dueDate === "upcoming") {
          if (!task.dueDate) return false
          const dueDate = new Date(task.dueDate)
          if (dueDate < now || dueDate > upcoming) return false
        } else if (filter.dueDate === "none") {
          if (task.dueDate) return false
        }
      }
      return true
    })
  }, [])

  const searchTasks = useCallback((tasksToSearch: Task[], query: string) => {
    if (!query.trim()) return tasksToSearch
    const lowerQuery = query.toLowerCase()
    return tasksToSearch.filter((task) => 
      task.title.toLowerCase().includes(lowerQuery) ||
      task.description?.toLowerCase().includes(lowerQuery) ||
      task.labels?.some((label) => label.toLowerCase().includes(lowerQuery)) ||
      task.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
    )
  }, [])

  // Sub-task functions
  const createSubTask = useCallback((parentTaskId: string, title: string) => {
    const newSubTask: SubTask = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title,
      isCompleted: false,
    }
    
    let updated: Task | null = null
    setTasks((prev) => prev.map((task) => {
      if (task.id === parentTaskId) {
        updated = {
          ...task,
          subtasks: [...task.subtasks, newSubTask],
          updatedAt: new Date(),
        }
        return updated
      }
      return task
    }))
    if (useSupabase && user && updated) void persistTaskToSupabase(updated, user.id)
  }, [useSupabase, user])

  const updateSubTask = useCallback((parentTaskId: string, subtaskId: string, updates: Partial<SubTask>) => {
    let updated: Task | null = null
    setTasks((prev) => prev.map((task) => {
      if (task.id === parentTaskId) {
        updated = {
          ...task,
          subtasks: task.subtasks.map((st) => 
            st.id === subtaskId ? { ...st, ...updates } : st
          ),
          updatedAt: new Date(),
        }
        return updated
      }
      return task
    }))
    if (useSupabase && user && updated) void persistTaskToSupabase(updated, user.id)
  }, [useSupabase, user])

  const deleteSubTask = useCallback((parentTaskId: string, subtaskId: string) => {
    let updated: Task | null = null
    setTasks((prev) => prev.map((task) => {
      if (task.id === parentTaskId) {
        updated = {
          ...task,
          subtasks: task.subtasks.filter((st) => st.id !== subtaskId),
          updatedAt: new Date(),
        }
        return updated
      }
      return task
    }))
    if (useSupabase && user && updated) void persistTaskToSupabase(updated, user.id)
  }, [useSupabase, user])

  const toggleSubTask = useCallback((parentTaskId: string, subtaskId: string) => {
    let updated: Task | null = null
    setTasks((prev) => prev.map((task) => {
      if (task.id === parentTaskId) {
        const updatedSubtasks = task.subtasks.map((st) => {
          if (st.id === subtaskId) {
            const isNowCompleted = !st.isCompleted
            return {
              ...st,
              isCompleted: isNowCompleted,
              completedAt: isNowCompleted ? new Date() : undefined,
            }
          }
          return st
        })
        
        // Check if all subtasks are completed
        const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.isCompleted)
        
        updated = {
          ...task,
          subtasks: updatedSubtasks,
          status: allCompleted ? "done" : task.status,
          isCompleted: allCompleted,
          completedAt: allCompleted ? new Date() : task.completedAt,
          updatedAt: new Date(),
        }
        return updated
      }
      return task
    }))
    if (useSupabase && user && updated) void persistTaskToSupabase(updated, user.id)
  }, [useSupabase, user])

  // Comment functions
  const addComment = useCallback((taskId: string, commentData: Omit<Comment, "id" | "createdAt">) => {
    const newComment: Comment = {
      ...commentData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    }
    
    let updated: Task | null = null
    setTasks((prev) => prev.map((task) => {
      if (task.id === taskId) {
        updated = {
          ...task,
          comments: [...task.comments, newComment],
          updatedAt: new Date(),
        }
        return updated
      }
      return task
    }))
    if (useSupabase && user && updated) void persistTaskToSupabase(updated, user.id)
  }, [useSupabase, user])

  const deleteComment = useCallback((taskId: string, commentId: string) => {
    let updated: Task | null = null
    setTasks((prev) => prev.map((task) => {
      if (task.id === taskId) {
        updated = {
          ...task,
          comments: task.comments.filter((c) => c.id !== commentId),
          updatedAt: new Date(),
        }
        return updated
      }
      return task
    }))
    if (useSupabase && user && updated) void persistTaskToSupabase(updated, user.id)
  }, [useSupabase, user])

  // Backlog: tasks with no sprint assigned
  const getBacklogTasks = useCallback((projectId: string) => {
    return tasks.filter(
      (t) => t.projectId === projectId && !t.isSoftDeleted && !t.sprintId
    )
  }, [tasks])

  // Sprint tasks
  const getSprintTasks = useCallback((sprintId: string) => {
    return tasks.filter((t) => t.sprintId === sprintId && !t.isSoftDeleted)
  }, [tasks])

  // Dependencies
  const addDependency = useCallback((taskId: string, dep: Omit<TaskDependency, "id">) => {
    const newDep: TaskDependency = {
      ...dep,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }
    let updated: Task | null = null
    setTasks((prev) => prev.map((task) => {
      if (task.id === taskId) {
        updated = {
          ...task,
          dependencies: [...(task.dependencies ?? []), newDep],
          updatedAt: new Date(),
        }
        return updated
      }
      return task
    }))
    if (useSupabase && user && updated) void persistTaskToSupabase(updated, user.id)
  }, [useSupabase, user])

  const removeDependency = useCallback((taskId: string, depId: string) => {
    let updated: Task | null = null
    setTasks((prev) => prev.map((task) => {
      if (task.id === taskId) {
        updated = {
          ...task,
          dependencies: (task.dependencies ?? []).filter((d) => d.id !== depId),
          updatedAt: new Date(),
        }
        return updated
      }
      return task
    }))
    if (useSupabase && user && updated) void persistTaskToSupabase(updated, user.id)
  }, [useSupabase, user])

  return (
    <TaskContext.Provider value={{
      tasks,
      addTask,
      updateTask,
      deleteTask,
      softDeleteTask,
      restoreTask,
      permanentDeleteTask,
      snoozeTask,
      getTasksByProject,
      getTasksByStatus,
      getActiveTasks,
      getTrashedTasks,
      getSnoozedTasks,
      getOverdueTasks,
      getTodaysTasks,
      getMyTasks,
      getBacklogTasks,
      getSprintTasks,
      createSubTask,
      updateSubTask,
      deleteSubTask,
      toggleSubTask,
      addComment,
      deleteComment,
      addDependency,
      removeDependency,
      sortTasks,
      filterTasks,
      searchTasks,
    }}>
      {children}
    </TaskContext.Provider>
  )
}

export function useTaskContext() {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error("useTaskContext must be used within TaskProvider")
  }
  return context
}

async function persistTaskToSupabase(task: Task, userId: string): Promise<void> {
  try {
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from("tasks").upsert({
      id: task.id,
      user_id: userId,
      project_id: task.projectId,
      data: serializeTask(task),
      updated_at: new Date().toISOString(),
    })
    if (error) console.error("[TaskZen] Failed to persist task:", error)
  } catch (e) {
    console.error("[TaskZen] Failed to persist task:", e)
  }
}

async function deleteTaskFromSupabase(taskId: string): Promise<void> {
  try {
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from("tasks").delete().eq("id", taskId)
    if (error) console.error("[TaskZen] Failed to delete task:", error)
  } catch (e) {
    console.error("[TaskZen] Failed to delete task:", e)
  }
}
