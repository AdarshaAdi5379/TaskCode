import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CheckCircle2 } from "lucide-react"

export function TeamActivity() {
  const activities = [
    { user: "Alex Johnson", action: "completed", task: "API Setup", time: "2 hours ago", initials: "AJ" },
    { user: "Sarah Chen", action: "started", task: "UI Design", time: "4 hours ago", initials: "SC" },
    { user: "Mike Ross", action: "commented on", task: "Database Schema", time: "6 hours ago", initials: "MR" },
    { user: "Emily Davis", action: "assigned", task: "Documentation", time: "1 day ago", initials: "ED" },
  ]

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle>Team Activity</CardTitle>
        <CardDescription>Recent updates from your team</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="text-xs">{activity.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{activity.user}</p>
                <p className="text-xs text-muted-foreground">
                  <span>{activity.action}</span>
                  {activity.action === "completed" && <CheckCircle2 className="h-3 w-3 inline ml-1 text-green-500" />}{" "}
                  <span className="font-medium truncate">{activity.task}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
