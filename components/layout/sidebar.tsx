"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, Plus, FolderOpen, Trash2, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useProjectContext } from "@/lib/project-context"
import { useTaskContext } from "@/lib/task-context"
import { QuickAddProjectModal } from "@/components/modals/quick-add-project-modal"
import { QuickAddTaskModal } from "@/components/modals/quick-add-task-modal"

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const [expandedProjects, setExpandedProjects] = useState(true)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const { projects, deleteProject } = useProjectContext()
  const { deleteTask, getTasksByProject } = useTaskContext()

  const toggleProjects = () => {
    setExpandedProjects(!expandedProjects)
  }

  const handleDeleteProject = (projectId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this project? All tasks in this project will also be deleted.")) {
      const projectTasks = getTasksByProject(projectId)
      projectTasks.forEach((task) => deleteTask(task.id))
      deleteProject(projectId)
    }
  }

  const handleSidebarClose = () => {
    setShowProjectModal(false)
    setShowTaskModal(false)
    onClose()
  }

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={handleSidebarClose} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-border bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out md:relative md:top-0 md:h-screen md:translate-x-0 md:border-t-0",
          open ? "translate-x-0 z-40" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col p-4">
          {/* Quick Add Task */}
          <Button
            onClick={() => setShowTaskModal(true)}
            className="mb-4 w-full gap-2 bg-primary hover:bg-primary/90"
            size="sm"
            aria-label="Quick add task"
          >
            <Plus className="h-4 w-4" />
            Quick Add Task
          </Button>

          {/* Projects Section */}
          <nav className="flex-1 space-y-2">
            <div className="space-y-2">
              {/* Projects Header with Add Button */}
              <div className="flex items-center justify-between">
                <button
                  onClick={toggleProjects}
                  className="flex flex-1 items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
                  aria-expanded={expandedProjects}
                >
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Projects
                  </div>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", expandedProjects ? "" : "-rotate-90")} />
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProjectModal(true)}
                  className="h-8 w-8 p-0"
                  aria-label="Add new project"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Projects List */}
              {expandedProjects && (
                <div className="space-y-1 pl-2">
                  {projects.length === 0 ? (
                    <p className="text-xs text-sidebar-foreground/50 py-2">No projects yet</p>
                  ) : (
                    projects.map((project) => (
                      <div
                        key={project.id}
                        className="group flex items-center justify-between rounded-lg px-3 py-2 hover:bg-sidebar-accent/50 transition-colors"
                      >
                        <Link
                          href={`/projects/${project.id}`}
                          className="flex flex-1 items-center gap-2 text-sm text-sidebar-foreground"
                          onClick={handleSidebarClose}
                        >
                          <div className={cn("h-2 w-2 rounded-full", project.color)} />
                          <span className="truncate">{project.name}</span>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteProject(project.id, e)}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Delete ${project.name}`}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </nav>

          {/* Footer */}
          <div className="space-y-2 border-t border-sidebar-border pt-4">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              Trash
            </Button>
          </div>
        </div>
      </aside>

      {/* Modals */}
      <QuickAddProjectModal open={showProjectModal} onOpenChange={setShowProjectModal} />
      <QuickAddTaskModal open={showTaskModal} onOpenChange={setShowTaskModal} />
    </>
  )
}
