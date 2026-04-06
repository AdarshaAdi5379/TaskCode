"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useUserContext } from "@/lib/user-context"
import { useRouter } from "next/navigation"
import { User, Bell, LogOut, SlidersHorizontal } from "lucide-react"

interface UserProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserProfileModal({ open, onOpenChange }: UserProfileModalProps) {
  const { user, updateProfile, updateSettings, logout } = useUserContext()
  const router = useRouter()
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [email, setEmail] = useState(user?.email || "")
  const [activeTab, setActiveTab] = useState("profile")

  if (!user) return null

  const handleSaveProfile = () => {
    updateProfile({ displayName })
    onOpenChange(false)
  }

  const handleNotificationChange = (key: keyof typeof user.settings.notifications) => {
    updateSettings({
      notifications: {
        ...user.settings.notifications,
        [key]: !user.settings.notifications[key],
      },
    })
  }

  const handleLogout = () => {
    logout()
    onOpenChange(false)
  }

  const openAppearanceSettings = () => {
    onOpenChange(false)
    router.push("/settings/appearance")
  }

  const openNotificationSettings = () => {
    onOpenChange(false)
    router.push("/settings/notifications")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
          <DialogDescription>Manage your account and preferences</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="gap-1">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">{getInitials(user.displayName)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{user.displayName}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground capitalize">Role: {user.role}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  disabled
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="destructive" onClick={handleLogout} className="gap-1">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={openAppearanceSettings} className="gap-1">
                  <SlidersHorizontal className="h-4 w-4" />
                  Appearance
                </Button>
                <Button onClick={handleSaveProfile}>Save</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Task Assigned</p>
                  <p className="text-sm text-muted-foreground">Get notified when a task is assigned to you</p>
                </div>
                <Button
                  variant={user.settings.notifications.taskAssigned ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleNotificationChange("taskAssigned")}
                >
                  {user.settings.notifications.taskAssigned ? "On" : "Off"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Task Completed</p>
                  <p className="text-sm text-muted-foreground">Get notified when a task you created is completed</p>
                </div>
                <Button
                  variant={user.settings.notifications.taskCompleted ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleNotificationChange("taskCompleted")}
                >
                  {user.settings.notifications.taskCompleted ? "On" : "Off"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mentions</p>
                  <p className="text-sm text-muted-foreground">Get notified when someone mentions you in a comment</p>
                </div>
                <Button
                  variant={user.settings.notifications.mentions ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleNotificationChange("mentions")}
                >
                  {user.settings.notifications.mentions ? "On" : "Off"}
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={openNotificationSettings} className="gap-1">
                <Bell className="h-4 w-4" />
                Advanced settings
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
