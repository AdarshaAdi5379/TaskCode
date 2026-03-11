"use client"

import { useState, use } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { TaskModal } from "@/components/tasks/task-modal"
import { TaskList } from "@/components/tasks/task-list"
import { KanbanView } from "@/components/tasks/kanban-view"
import { CalendarView } from "@/components/tasks/calendar-view"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, LayoutList, Grid3x3, Calendar, Users, Activity, UserPlus, Trash2, MoreHorizontal, Crown, Shield, User, ArrowLeft, Home } from "lucide-react"
import { useProjectContext } from "@/lib/project-context"
import { useTaskContext } from "@/lib/task-context"
import { useUserContext } from "@/lib/user-context"
import { InviteMemberModal } from "@/components/modals/invite-member-modal"
import type { ActivityLog, ProjectMember } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { id: projectId } = resolvedParams
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [activeView, setActiveView] = useState("list")
  const { getProject, removeMember, updateMemberRole } = useProjectContext()
  const { tasks } = useTaskContext()
  const { user } = useUserContext()

  const project = getProject(projectId)

  const getRoleIcon = (role: ProjectMember["role"]) => {
    switch (role) {
      case "owner":
        return <Crown className="h-3 w-3 text-yellow-500" />
      case "admin":
        return <Shield className="h-3 w-3 text-blue-500" />
      default:
        return <User className="h-3 w-3 text-muted-foreground" />
    }
  }

  const getRoleBadgeColor = (role: ProjectMember["role"]) => {
    switch (role) {
      case "owner":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const currentUserMember = project?.members.find((m) => m.userId === user?.id)
  const canManageMembers = currentUserMember?.role === "owner" || currentUserMember?.role === "admin"

  const getProjectActivities = (): ActivityLog[] => {
    const projectTasks = tasks.filter((t) => t.projectId === projectId)
    const activities: ActivityLog[] = []

    projectTasks.forEach((task) => {
      activities.push({
        id: `created-${task.id}`,
        projectId,
        taskId: task.id,
        taskTitle: task.title,
        userId: user?.id || "system",
        userName: "You",
        action: "created",
        details: `Created task "${task.title}"`,
        createdAt: task.createdAt,
      })

      if (task.status === "done") {
        activities.push({
          id: `completed-${task.id}`,
          projectId,
          taskId: task.id,
          taskTitle: task.title,
          userId: user?.id || "system",
          userName: "You",
          action: "completed",
          details: `Completed task "${task.title}"`,
          createdAt: task.completedAt || new Date(),
        })
      }

      task.comments.forEach((comment) => {
        activities.push({
          id: `comment-${comment.id}`,
          projectId,
          taskId: task.id,
          taskTitle: task.title,
          userId: comment.userId,
          userName: comment.userName,
          action: "commented",
          details: `Commented on "${task.title}"`,
          createdAt: comment.createdAt,
        })
      })
    })

    return activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  const activities = getProjectActivities()

  const getActivityIcon = (action: ActivityLog["action"]) => {
    switch (action) {
      case "created":
        return <Plus className="h-4 w-4 text-green-500" />
      case "completed":
        return <Activity className="h-4 w-4 text-blue-500" />
      case "commented":
        return <Activity className="h-4 w-4 text-purple-500" />
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />
    }
  }

  const formatActivityTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(date).toLocaleDateString()
  }

  return (
    <MainLayout>
      {!project ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Project Not Found</h1>
            <p className="text-muted-foreground mt-2">This project may have been deleted or doesn't exist.</p>
            <Button asChild className="mt-4">
              <a href="/">Go to Dashboard</a>
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-6 p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <a href="/">
                  <ArrowLeft className="h-5 w-5" />
                </a>
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                <p className="text-muted-foreground">{project.description || "Project workspace"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canManageMembers && (
                <Button variant="outline" onClick={() => setShowInviteModal(true)} className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Invite
                </Button>
              )}
              <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                New Task
              </Button>
            </div>
          </div>

          {/* View Tabs */}
          <Tabs value={activeView} onValueChange={setActiveView}>
            <TabsList className="grid w-full max-w-lg grid-cols-4">
              <TabsTrigger value="list" className="gap-2">
                <LayoutList className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </TabsTrigger>
              <TabsTrigger value="kanban" className="gap-2">
                <Grid3x3 className="h-4 w-4" />
                <span className="hidden sm:inline">Kanban</span>
              </TabsTrigger>
              <TabsTrigger value="members" className="gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Team</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Activity</span>
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

            {/* Members View */}
            <TabsContent value="members" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>{project.members.length} members in this project</CardDescription>
                  </div>
                  {canManageMembers && (
                    <Button onClick={() => setShowInviteModal(true)} className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Invite
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.members.map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {member.name}
                            {member.userId === user?.id && (
                              <span className="text-muted-foreground ml-1">(You)</span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getRoleBadgeColor(member.role)} variant="outline">
                          <span className="flex items-center gap-1">
                            {getRoleIcon(member.role)}
                            <span className="capitalize">{member.role}</span>
                          </span>
                        </Badge>
                        {canManageMembers && member.role !== "owner" && member.userId !== user?.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeMember(projectId, member.userId)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity View */}
            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Feed</CardTitle>
                  <CardDescription>Recent project activity</CardDescription>
                </CardHeader>
                <CardContent>
                  {activities.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No activity yet</p>
                  ) : (
                    <div className="space-y-4">
                      {activities.slice(0, 20).map((activity) => (
                        <div key={activity.id} className="flex gap-3">
                          <div className="mt-1">{getActivityIcon(activity.action)}</div>
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium">{activity.userName}</span>{" "}
                              <span className="text-muted-foreground">{activity.details}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">{formatActivityTime(activity.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Task Modal */}
      {project && <TaskModal open={isModalOpen} onOpenChange={setIsModalOpen} projectId={projectId} />}
      
      {/* Invite Member Modal */}
      {project && (
        <InviteMemberModal
          open={showInviteModal}
          onOpenChange={setShowInviteModal}
          projectId={projectId}
        />
      )}
    </MainLayout>
  )
}
