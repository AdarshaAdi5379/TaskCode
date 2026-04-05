import { KPICards } from "@/components/dashboard/kpi-cards"
import { TaskChart } from "@/components/dashboard/task-chart"
import { WorkloadChart } from "@/components/dashboard/workload-chart"
import { MyTasks } from "@/components/dashboard/my-tasks"
import { ProjectProgress } from "@/components/dashboard/project-progress"
import { TeamActivity } from "@/components/dashboard/team-activity"
import { MainLayout } from "@/components/layout/main-layout"
import { ViewProjectsButton } from "@/components/dashboard/view-projects-button"

export const dynamic = "force-dynamic"

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your task overview.</p>
          </div>
          <ViewProjectsButton />
        </div>

        <KPICards />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <TaskChart />
            <WorkloadChart />
          </div>
          <div className="space-y-6">
            <MyTasks />
            <ProjectProgress />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
