import type React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { SettingsShell } from "@/components/settings/settings-shell"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <MainLayout>
      <SettingsShell>{children}</SettingsShell>
    </MainLayout>
  )
}

