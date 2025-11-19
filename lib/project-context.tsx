"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Project, ProjectContextType } from "./types"

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Load projects from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("taskzen-projects")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setProjects(parsed.map((p: Project) => ({ ...p, createdAt: new Date(p.createdAt) })))
      } catch (e) {
        console.error("[v0] Failed to load projects from localStorage:", e)
      }
    } else {
      // Initialize with default projects
      const defaultProjects: Project[] = [
        {
          id: "1",
          name: "Website Redesign",
          description: "Design system update",
          color: "bg-blue-500",
          createdAt: new Date(),
        },
        {
          id: "2",
          name: "Mobile App",
          description: "iOS and Android apps",
          color: "bg-purple-500",
          createdAt: new Date(),
        },
        {
          id: "3",
          name: "Marketing Campaign",
          description: "Q4 marketing push",
          color: "bg-orange-500",
          createdAt: new Date(),
        },
      ]
      setProjects(defaultProjects)
    }
    setIsHydrated(true)
  }, [])

  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("taskzen-projects", JSON.stringify(projects))
    }
  }, [projects, isHydrated])

  const addProject = (newProject: Omit<Project, "id" | "createdAt">) => {
    const project: Project = {
      ...newProject,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setProjects((prev) => [project, ...prev])
  }

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((project) => (project.id === id ? { ...project, ...updates } : project)))
  }

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== id))
  }

  const getProject = (id: string) => {
    return projects.find((project) => project.id === id)
  }

  return (
    <ProjectContext.Provider value={{ projects, addProject, updateProject, deleteProject, getProject }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjectContext() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error("useProjectContext must be used within ProjectProvider")
  }
  return context
}
