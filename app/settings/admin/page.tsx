"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SettingsSection } from "@/components/settings/settings-section"
import { useUserContext } from "@/lib/user-context"

export default function AdminSettingsPage() {
  const router = useRouter()
  const { user, isLoading } = useUserContext()
  const isAdmin = user?.role === "admin" || (user as any)?.role === "superadmin"

  useEffect(() => {
    if (isLoading) return
    if (!isAdmin) router.replace("/settings/profile")
  }, [isAdmin, isLoading, router])

  if (!isAdmin) return null

  return (
    <SettingsSection
      title="Admin"
      description="Admin-only controls: user management, logs, and feature flags."
    >
      Visible only to admins.
    </SettingsSection>
  )
}
