import { KPICards } from "@/components/dashboard/kpi-cards"
import { TaskChart } from "@/components/dashboard/task-chart"
import { WorkloadChart } from "@/components/dashboard/workload-chart"
import { MyTasks } from "@/components/dashboard/my-tasks"
import { ProjectProgress } from "@/components/dashboard/project-progress"
import { TeamActivity } from "@/components/dashboard/team-activity"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

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
          <Link href="/projects/1">
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              View Projects
            </Button>
          </Link>
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
