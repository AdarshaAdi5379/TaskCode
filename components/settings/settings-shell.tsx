"use client"

import type React from "react"
import { useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useUserContext } from "@/lib/user-context"
import { SettingsContentSkeleton } from "./settings-content-skeleton"
import {
  Palette,
  Bell,
  User,
  Shield,
  Database,
  Plug,
  Briefcase,
  FolderKanban,
  KeyRound,
  Timer,
} from "lucide-react"

type SettingsNavItem = {
  key: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
}

const SETTINGS_NAV: SettingsNavItem[] = [
  { key: "profile", label: "Profile", href: "/settings/profile", icon: User },
  { key: "appearance", label: "Appearance", href: "/settings/appearance", icon: Palette },
  { key: "notifications", label: "Notifications", href: "/settings/notifications", icon: Bell },
  { key: "workspace", label: "Workspace", href: "/settings/workspace", icon: Briefcase },
  { key: "projects", label: "Projects", href: "/settings/projects", icon: FolderKanban },
  { key: "security", label: "Security", href: "/settings/security", icon: KeyRound },
  { key: "data", label: "Data", href: "/settings/data", icon: Database },
  { key: "productivity", label: "Productivity", href: "/settings/productivity", icon: Timer },
  { key: "integrations", label: "Integrations", href: "/settings/integrations", icon: Plug },
  { key: "admin", label: "Admin", href: "/settings/admin", icon: Shield, adminOnly: true },
]

export function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading } = useUserContext()

  const isAdmin = user?.role === "admin" || (user as any)?.role === "superadmin"
  const navItems = useMemo(
    () => SETTINGS_NAV.filter((i) => (i.adminOnly ? isAdmin : true)),
    [isAdmin],
  )

  const activeHref = useMemo(() => {
    const match = navItems.find((item) => pathname === item.href || pathname?.startsWith(item.href + "/"))
    return match?.href ?? navItems[0]?.href ?? "/settings/profile"
  }, [navItems, pathname])

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account, preferences, and workspace defaults.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <aside className="space-y-3">
          <div className="md:hidden">
            <Select value={activeHref} onValueChange={(href) => router.push(href)}>
              <SelectTrigger aria-label="Select settings section">
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {navItems.map((item) => (
                  <SelectItem key={item.key} value={item.href}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <nav className="hidden md:block space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeHref === item.href
              return (
                <Link key={item.key} href={item.href} className="block">
                  <Button
                    type="button"
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2",
                      isActive && "bg-muted hover:bg-muted",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </aside>

        <section className="min-w-0 rounded-lg border bg-card p-4 md:p-6">
          {isLoading ? <SettingsContentSkeleton /> : children}
        </section>
      </div>
    </div>
  )
}

