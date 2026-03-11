"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProjectContext } from "@/lib/project-context"
import { useUserContext } from "@/lib/user-context"
import { Mail, UserPlus, Link as LinkIcon, Copy, Check } from "lucide-react"

interface InviteMemberModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
}

export function InviteMemberModal({ open, onOpenChange, projectId }: InviteMemberModalProps) {
  const { inviteMember, getProject } = useProjectContext()
  const { user } = useUserContext()
  const project = getProject(projectId)
  
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<"admin" | "member">("member")
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const projectLink = `${window.location.origin}/projects/${projectId}?invite=${projectId}`

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !name.trim()) return

    setIsLoading(true)
    
    setTimeout(() => {
      inviteMember(projectId, email.trim(), name.trim(), role)
      setEmail("")
      setName("")
      setRole("member")
      setIsLoading(false)
      onOpenChange(false)
    }, 500)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(projectLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setEmail("")
      setName("")
      setRole("member")
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Invite Team Members</DialogTitle>
          <DialogDescription>Add new members to {project?.name}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-name">Name</Label>
              <Input
                id="invite-name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as "admin" | "member")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">
                    <div className="flex flex-col">
                      <span>Member</span>
                      <span className="text-xs text-muted-foreground">Can view and edit tasks</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex flex-col">
                      <span>Admin</span>
                      <span className="text-xs text-muted-foreground">Can manage members and settings</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isLoading || !email.trim() || !name.trim()} className="flex-1">
              <UserPlus className="h-4 w-4 mr-2" />
              {isLoading ? "Inviting..." : "Send Invite"}
            </Button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or share link</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Project Link</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={projectLink}
                readOnly
                className="pl-10 pr-10 text-sm"
              />
            </div>
            <Button variant="outline" size="icon" onClick={handleCopyLink}>
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Anyone with this link can request to join the project
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
