"use client"

import type React from "react"
import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react"
import type { Project, ProjectContextType, ProjectMember } from "./types"
import { useUserContext } from "./user-context"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "./supabase/client"
import { deserializeProject, serializeProject } from "./supabase/serializers"
import { DEFAULT_PROJECT_SETTINGS } from "@/lib/settings/defaults"

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

const FALLBACK_DEFAULT_OWNER_ID = "current-user"

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const { user, isAuthenticated, isLoading } = useUserContext()
  const useSupabase = useMemo(() => isSupabaseConfigured(), [])

  useEffect(() => {
    if (useSupabase) return

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
          ownerId: FALLBACK_DEFAULT_OWNER_ID,
          members: [
            { userId: FALLBACK_DEFAULT_OWNER_ID, email: "user@example.com", name: "You", role: "owner", joinedAt: new Date() },
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
          ownerId: FALLBACK_DEFAULT_OWNER_ID,
          members: [
            { userId: FALLBACK_DEFAULT_OWNER_ID, email: "user@example.com", name: "You", role: "owner", joinedAt: new Date() },
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
          ownerId: FALLBACK_DEFAULT_OWNER_ID,
          members: [
            { userId: FALLBACK_DEFAULT_OWNER_ID, email: "user@example.com", name: "You", role: "owner", joinedAt: new Date() },
          ],
          settings: DEFAULT_PROJECT_SETTINGS,
        },
      ]
      setProjects(defaultProjects)
    }
    setIsHydrated(true)
  }, [useSupabase])

  useEffect(() => {
    if (!useSupabase) return
    if (isLoading) return

    if (!isAuthenticated || !user) {
      setProjects([])
      setIsHydrated(true)
      return
    }

    let cancelled = false
    const supabase = getSupabaseBrowserClient()

    const load = async () => {
      setIsHydrated(false)
      const { data, error } = await supabase
        .from("projects")
        .select("data")
        .order("created_at", { ascending: false })

      if (cancelled) return

      if (error) {
        console.error("[TaskZen] Failed to load projects from Supabase:", error)
        setProjects([])
        setIsHydrated(true)
        return
      }

      const loaded = (data ?? []).map((row: any) => deserializeProject(row.data))
      if (loaded.length > 0) {
        setProjects(loaded)
        setIsHydrated(true)
        return
      }
      setProjects([])
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
      localStorage.setItem("taskzen-projects", JSON.stringify(projects))
    }
  }, [projects, isHydrated, useSupabase])

  const addProject = useCallback((newProjectData: Omit<Project, "id" | "createdAt" | "updatedAt" | "isArchived" | "members" | "settings" | "ownerId">) => {
    const project: Project = {
      ...newProjectData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
      isArchived: false,
      ownerId: useSupabase && user ? user.id : FALLBACK_DEFAULT_OWNER_ID,
      members: [
        {
          userId: useSupabase && user ? user.id : FALLBACK_DEFAULT_OWNER_ID,
          email: user?.email || "user@example.com",
          name: user?.displayName || "You",
          role: "owner",
          joinedAt: new Date(),
        },
      ],
      settings: DEFAULT_PROJECT_SETTINGS,
    }
    setProjects((prev) => [project, ...prev])
    if (useSupabase && user) void persistProjectToSupabase(project, user.id)
  }, [useSupabase, user])

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    let updated: Project | null = null
    setProjects((prev) => prev.map((project) => {
      if (project.id !== id) return project
      updated = { ...project, ...updates, updatedAt: new Date() }
      return updated
    }))
    if (useSupabase && user && updated) void persistProjectToSupabase(updated, user.id)
  }, [useSupabase, user])

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== id))
    if (useSupabase) void deleteProjectFromSupabase(id)
  }, [useSupabase])

  const getProject = useCallback((id: string) => {
    return projects.find((project) => project.id === id)
  }, [projects])

  const getActiveProjects = useCallback(() => {
    return projects.filter((project) => !project.isArchived)
  }, [projects])

  const archiveProject = useCallback((id: string) => {
    let updated: Project | null = null
    setProjects((prev) => prev.map((project) => {
      if (project.id !== id) return project
      updated = { ...project, isArchived: true, updatedAt: new Date() }
      return updated
    }))
    if (useSupabase && user && updated) void persistProjectToSupabase(updated, user.id)
  }, [useSupabase, user])

  const restoreProject = useCallback((id: string) => {
    let updated: Project | null = null
    setProjects((prev) => prev.map((project) => {
      if (project.id !== id) return project
      updated = { ...project, isArchived: false, updatedAt: new Date() }
      return updated
    }))
    if (useSupabase && user && updated) void persistProjectToSupabase(updated, user.id)
  }, [useSupabase, user])

  const inviteMember = useCallback((projectId: string, email: string, name: string, role: ProjectMember["role"]) => {
    const newMember: ProjectMember = {
      userId: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      email,
      name,
      role,
      joinedAt: new Date(),
    }
    
    let updated: Project | null = null
    setProjects((prev) => prev.map((project) => {
      if (project.id !== projectId) return project
      updated = {
        ...project,
        members: [...project.members, newMember],
        updatedAt: new Date(),
      }
      return updated
    }))
    if (useSupabase && user && updated) void persistProjectToSupabase(updated, user.id)
  }, [useSupabase, user])

  const removeMember = useCallback((projectId: string, userId: string) => {
    let updated: Project | null = null
    setProjects((prev) => prev.map((project) => {
      if (project.id !== projectId) return project
      
      // Don't allow removing the owner
      const member = project.members.find((m) => m.userId === userId)
      if (member?.role === "owner") return project
      
      updated = {
        ...project,
        members: project.members.filter((m) => m.userId !== userId),
        updatedAt: new Date(),
      }
      return updated
    }))
    if (useSupabase && user && updated) void persistProjectToSupabase(updated, user.id)
  }, [useSupabase, user])

  const updateMemberRole = useCallback((projectId: string, userId: string, role: ProjectMember["role"]) => {
    let updated: Project | null = null
    setProjects((prev) => prev.map((project) => {
      if (project.id !== projectId) return project
      
      // Don't allow changing the owner's role
      const member = project.members.find((m) => m.userId === userId)
      if (member?.role === "owner") return project
      
      updated = {
        ...project,
        members: project.members.map((m) => 
          m.userId === userId ? { ...m, role } : m
        ),
        updatedAt: new Date(),
      }
      return updated
    }))
    if (useSupabase && user && updated) void persistProjectToSupabase(updated, user.id)
  }, [useSupabase, user])

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

async function persistProjectToSupabase(project: Project, userId: string): Promise<void> {
  try {
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from("projects").upsert({
      id: project.id,
      user_id: userId,
      data: serializeProject(project),
      updated_at: new Date().toISOString(),
    })
    if (error) console.error("[TaskZen] Failed to persist project:", error)
  } catch (e) {
    console.error("[TaskZen] Failed to persist project:", e)
  }
}

async function deleteProjectFromSupabase(projectId: string): Promise<void> {
  try {
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from("projects").delete().eq("id", projectId)
    if (error) console.error("[TaskZen] Failed to delete project:", error)
  } catch (e) {
    console.error("[TaskZen] Failed to delete project:", e)
  }
}
