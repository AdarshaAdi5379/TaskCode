"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/lib/toast-context"
import { useUserContext } from "@/lib/user-context"

export default function NotificationSettingsPage() {
  return <NotificationsSettings />
}

function ToggleRow({
  title,
  description,
  value,
  onToggle,
}: {
  title: string
  description: string
  value: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button variant={value ? "default" : "outline"} size="sm" onClick={onToggle}>
        {value ? "On" : "Off"}
      </Button>
    </div>
  )
}

function NotificationsSettings() {
  const { user, updateSettings } = useUserContext()
  const { addToast } = useToast()

  if (!user) return null

  const n = user.settings.notifications

  const patch = (next: Partial<typeof n>) => {
    updateSettings({
      notifications: {
        ...n,
        ...next,
      },
    })
    addToast("success", "Notification preferences saved.")
  }

  const quietStart = n.quietHours?.start ?? "22:00"
  const quietEnd = n.quietHours?.end ?? "07:00"

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Notifications</h2>
        <p className="text-sm text-muted-foreground">Control in-app and email notifications, reminders, and quiet hours.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>In-app notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleRow
            title="Task assigned to you"
            description="When someone assigns you a task."
            value={n.taskAssigned}
            onToggle={() => patch({ taskAssigned: !n.taskAssigned })}
          />
          <ToggleRow
            title="Mentioned in comment"
            description="When someone mentions you in a comment."
            value={n.mentions}
            onToggle={() => patch({ mentions: !n.mentions })}
          />
          <ToggleRow
            title="Task completed"
            description="When a task you care about is completed."
            value={n.taskCompleted}
            onToggle={() => patch({ taskCompleted: !n.taskCompleted })}
          />
          <ToggleRow
            title="Project updates"
            description="Key updates within projects you follow."
            value={n.projectUpdates ?? true}
            onToggle={() => patch({ projectUpdates: !(n.projectUpdates ?? true) })}
          />
          <ToggleRow
            title="Due date reminders"
            description="Reminders as deadlines approach."
            value={n.dueDateReminders ?? true}
            onToggle={() => patch({ dueDateReminders: !(n.dueDateReminders ?? true) })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleRow
            title="Email notifications"
            description="Master switch for all email notifications."
            value={n.email}
            onToggle={() => patch({ email: !n.email })}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <div className={n.email ? "" : "opacity-60 pointer-events-none"}>
              <ToggleRow
                title="Mentions"
                description="Email me when I’m mentioned."
                value={n.emailMentions ?? true}
                onToggle={() => patch({ emailMentions: !(n.emailMentions ?? true) })}
              />
            </div>
            <div className={n.email ? "" : "opacity-60 pointer-events-none"}>
              <ToggleRow
                title="Assignments"
                description="Email me when I’m assigned a task."
                value={n.emailAssignments ?? true}
                onToggle={() => patch({ emailAssignments: !(n.emailAssignments ?? true) })}
              />
            </div>
            <div className={n.email ? "" : "opacity-60 pointer-events-none"}>
              <ToggleRow
                title="Invites"
                description="Email me when I’m invited."
                value={n.emailInvites ?? true}
                onToggle={() => patch({ emailInvites: !(n.emailInvites ?? true) })}
              />
            </div>
            <div className={n.email ? "" : "opacity-60 pointer-events-none"}>
              <ToggleRow
                title="Weekly summary"
                description="Email me a weekly summary."
                value={n.emailWeeklySummary ?? true}
                onToggle={() => patch({ emailWeeklySummary: !(n.emailWeeklySummary ?? true) })}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Email delivery is implemented later; these preferences are stored now.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reminders & quiet hours</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="reminderTime">Default reminder time</Label>
            <Input
              id="reminderTime"
              type="time"
              value={n.reminderTime ?? "09:00"}
              onChange={(e) => patch({ reminderTime: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="digestTime">Daily digest time</Label>
            <Input
              id="digestTime"
              type="time"
              value={n.dailyDigestTime ?? "18:00"}
              onChange={(e) => patch({ dailyDigestTime: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Quiet hours</Label>
            <div className="flex gap-2">
              <Input
                aria-label="Quiet hours start"
                type="time"
                value={quietStart}
                onChange={(e) => patch({ quietHours: { start: e.target.value, end: quietEnd } })}
              />
              <Input
                aria-label="Quiet hours end"
                type="time"
                value={quietEnd}
                onChange={(e) => patch({ quietHours: { start: quietStart, end: e.target.value } })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
