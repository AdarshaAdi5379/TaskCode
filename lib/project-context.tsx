"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { Project, ProjectContextType, ProjectMember, ProjectSettings } from "./types"

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
  defaultPriority: "medium",
  defaultStatus: "todo",
  autoCompleteSubtasks: true,
}

const DEFAULT_OWNER_ID = "current-user"

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("taskzen-projects")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setProjects(parsed.map((p: Project) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
          members: p.members?.map((m: ProjectMember) => ({
            ...m,
            joinedAt: new Date(m.joinedAt),
          })) || [],
        })))
      } catch (e) {
        console.error("[TaskZen] Failed to load projects from localStorage:", e)
      }
    } else {
      const defaultProjects: Project[] = [
        {
          id: "1",
          name: "Website Redesign",
          description: "Design system update",
          color: "bg-blue-500",
          createdAt: new Date(),
          isArchived: false,
          ownerId: DEFAULT_OWNER_ID,
          members: [
            { userId: DEFAULT_OWNER_ID, email: "user@example.com", name: "You", role: "owner", joinedAt: new Date() },
          ],
          settings: DEFAULT_PROJECT_SETTINGS,
        },
        {
          id: "2",
          name: "Mobile App",
          description: "iOS and Android apps",
          color: "bg-purple-500",
          createdAt: new Date(),
          isArchived: false,
          ownerId: DEFAULT_OWNER_ID,
          members: [
            { userId: DEFAULT_OWNER_ID, email: "user@example.com", name: "You", role: "owner", joinedAt: new Date() },
          ],
          settings: DEFAULT_PROJECT_SETTINGS,
        },
        {
          id: "3",
          name: "Marketing Campaign",
          description: "Q4 marketing push",
          color: "bg-orange-500",
          createdAt: new Date(),
          isArchived: false,
          ownerId: DEFAULT_OWNER_ID,
          members: [
            { userId: DEFAULT_OWNER_ID, email: "user@example.com", name: "You", role: "owner", joinedAt: new Date() },
          ],
          settings: DEFAULT_PROJECT_SETTINGS,
        },
      ]
      setProjects(defaultProjects)
    }
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("taskzen-projects", JSON.stringify(projects))
    }
  }, [projects, isHydrated])

  const addProject = useCallback((newProjectData: Omit<Project, "id" | "createdAt" | "updatedAt" | "isArchived" | "members" | "settings">) => {
    const project: Project = {
      ...newProjectData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
      isArchived: false,
      ownerId: DEFAULT_OWNER_ID,
      members: [
        { userId: DEFAULT_OWNER_ID, email: "user@example.com", name: "You", role: "owner", joinedAt: new Date() },
      ],
      settings: DEFAULT_PROJECT_SETTINGS,
    }
    setProjects((prev) => [project, ...prev])
  }, [])

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((project) => 
      project.id === id 
        ? { ...project, ...updates, updatedAt: new Date() }
        : project
    ))
  }, [])

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== id))
  }, [])

  const getProject = useCallback((id: string) => {
    return projects.find((project) => project.id === id)
  }, [projects])

  const getActiveProjects = useCallback(() => {
    return projects.filter((project) => !project.isArchived)
  }, [projects])

  const archiveProject = useCallback((id: string) => {
    setProjects((prev) => prev.map((project) => 
      project.id === id 
        ? { ...project, isArchived: true, updatedAt: new Date() }
        : project
    ))
  }, [])

  const restoreProject = useCallback((id: string) => {
    setProjects((prev) => prev.map((project) => 
      project.id === id 
        ? { ...project, isArchived: false, updatedAt: new Date() }
        : project
    ))
  }, [])

  const inviteMember = useCallback((projectId: string, email: string, name: string, role: ProjectMember["role"]) => {
    const newMember: ProjectMember = {
      userId: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      email,
      name,
      role,
      joinedAt: new Date(),
    }
    
    setProjects((prev) => prev.map((project) => 
      project.id === projectId 
        ? { 
            ...project, 
            members: [...project.members, newMember],
            updatedAt: new Date(),
          }
        : project
    ))
  }, [])

  const removeMember = useCallback((projectId: string, userId: string) => {
    setProjects((prev) => prev.map((project) => {
      if (project.id !== projectId) return project
      
      // Don't allow removing the owner
      const member = project.members.find((m) => m.userId === userId)
      if (member?.role === "owner") return project
      
      return {
        ...project,
        members: project.members.filter((m) => m.userId !== userId),
        updatedAt: new Date(),
      }
    }))
  }, [])

  const updateMemberRole = useCallback((projectId: string, userId: string, role: ProjectMember["role"]) => {
    setProjects((prev) => prev.map((project) => {
      if (project.id !== projectId) return project
      
      // Don't allow changing the owner's role
      const member = project.members.find((m) => m.userId === userId)
      if (member?.role === "owner") return project
      
      return {
        ...project,
        members: project.members.map((m) => 
          m.userId === userId ? { ...m, role } : m
        ),
        updatedAt: new Date(),
      }
    }))
  }, [])

  const isMember = useCallback((projectId: string, userId: string) => {
    const project = projects.find((p) => p.id === projectId)
    return project?.members.some((m) => m.userId === userId) || false
  }, [projects])

  const isOwner = useCallback((projectId: string, userId: string) => {
    const project = projects.find((p) => p.id === projectId)
    const member = project?.members.find((m) => m.userId === userId)
    return member?.role === "owner" || false
  }, [projects])

  return (
    <ProjectContext.Provider value={{
      projects,
      addProject,
      updateProject,
      deleteProject,
      getProject,
      getActiveProjects,
      archiveProject,
      restoreProject,
      inviteMember,
      removeMember,
      updateMemberRole,
      isMember,
      isOwner,
    }}>
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
