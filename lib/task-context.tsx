"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Task, TaskContextType } from "./types"

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Load tasks from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("taskzen-tasks")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setTasks(parsed.map((t: Task) => ({ ...t, createdAt: new Date(t.createdAt) })))
      } catch (e) {
        console.error("[v0] Failed to load tasks from localStorage:", e)
      }
    }
    setIsHydrated(true)
  }, [])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("taskzen-tasks", JSON.stringify(tasks))
    }
  }, [tasks, isHydrated])

  const addTask = (newTask: Omit<Task, "id" | "createdAt">) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setTasks((prev) => [task, ...prev])
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...updates } : task)))
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const getTasksByProject = (projectId: string) => {
    return tasks.filter((task) => task.projectId === projectId)
  }

  const getTasksByStatus = (status: Task["status"]) => {
    return tasks.filter((task) => task.status === status)
  }

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask, getTasksByProject, getTasksByStatus }}>
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
