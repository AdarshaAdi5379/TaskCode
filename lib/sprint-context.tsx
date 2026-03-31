"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { Sprint, SprintContextType } from "./types"

const SprintContext = createContext<SprintContextType | undefined>(undefined)

export function SprintProvider({ children }: { children: React.ReactNode }) {
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("taskzen-sprints")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setSprints(
          parsed.map((s: Sprint) => ({
            ...s,
            createdAt: new Date(s.createdAt),
            completedAt: s.completedAt ? new Date(s.completedAt) : undefined,
          }))
        )
      } catch (e) {
        console.error("[TaskZen] Failed to load sprints from localStorage:", e)
      }
    }
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("taskzen-sprints", JSON.stringify(sprints))
    }
  }, [sprints, isHydrated])

  const addSprint = useCallback(
    (sprintData: Omit<Sprint, "id" | "createdAt" | "completedAt" | "velocity">): Sprint => {
      const sprint: Sprint = {
        ...sprintData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
      }
      setSprints((prev) => [...prev, sprint])
      return sprint
    },
    []
  )

  const updateSprint = useCallback((id: string, updates: Partial<Sprint>) => {
    setSprints((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    )
  }, [])

  const deleteSprint = useCallback((id: string) => {
    setSprints((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const startSprint = useCallback((id: string) => {
    setSprints((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "active" as const } : s))
    )
  }, [])

  const completeSprint = useCallback((id: string) => {
    setSprints((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: "completed" as const, completedAt: new Date() }
          : s
      )
    )
  }, [])

  const getSprintsByProject = useCallback(
    (projectId: string) => sprints.filter((s) => s.projectId === projectId),
    [sprints]
  )

  const getActiveSprint = useCallback(
    (projectId: string) =>
      sprints.find((s) => s.projectId === projectId && s.status === "active"),
    [sprints]
  )

  return (
    <SprintContext.Provider
      value={{
        sprints,
        addSprint,
        updateSprint,
        deleteSprint,
        startSprint,
        completeSprint,
        getSprintsByProject,
        getActiveSprint,
      }}
    >
      {children}
    </SprintContext.Provider>
  )
}

export function useSprintContext() {
  const context = useContext(SprintContext)
  if (!context) {
    throw new Error("useSprintContext must be used within SprintProvider")
  }
  return context
}
