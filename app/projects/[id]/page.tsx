"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { TaskModal } from "@/components/tasks/task-modal"
import { TaskList } from "@/components/tasks/task-list"
import { KanbanView } from "@/components/tasks/kanban-view"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, LayoutList, Grid3x3, Calendar } from "lucide-react"
import { useProjectContext } from "@/lib/project-context"
import { CalendarView } from "@/components/tasks/calendar-view"

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { id: projectId } = params
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeView, setActiveView] = useState("list")
  const { getProject } = useProjectContext()

  const project = getProject(projectId)

  return (
    <MainLayout>
      <div className="flex-1 space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project?.name || "Project"}</h1>
            <p className="text-muted-foreground">{project?.description || "Project workspace"}</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>

        {/* View Tabs */}
        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList className="grid w-full max-w-xs grid-cols-3">
            <TabsTrigger value="list" className="gap-2">
              <LayoutList className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </TabsTrigger>
            <TabsTrigger value="kanban" className="gap-2">
              <Grid3x3 className="h-4 w-4" />
              <span className="hidden sm:inline">Kanban</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
          </TabsList>

          {/* List View */}
          <TabsContent value="list" className="mt-6">
            <TaskList projectId={projectId} />
          </TabsContent>

          {/* Kanban View */}
          <TabsContent value="kanban" className="mt-6">
            <KanbanView projectId={projectId} />
          </TabsContent>

          {/* Calendar View */}
          <TabsContent value="calendar" className="mt-6">
            <CalendarView projectId={projectId} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Task Modal */}
      <TaskModal open={isModalOpen} onOpenChange={setIsModalOpen} projectId={projectId} />
    </MainLayout>
  )
}
