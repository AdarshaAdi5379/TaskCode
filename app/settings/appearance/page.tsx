"use client"

import { useMemo } from "react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/lib/toast-context"
import { useUserContext } from "@/lib/user-context"

export default function AppearanceSettingsPage() {
  return <AppearanceSettings />
}

const accentColors = [
  { name: "Zen Blue", value: "blue", color: "bg-blue-500" },
  { name: "Twilight Purple", value: "purple", color: "bg-purple-500" },
  { name: "Crimson Red", value: "red", color: "bg-red-500" },
  { name: "Forest Green", value: "green", color: "bg-green-500" },
  { name: "Ocean Teal", value: "teal", color: "bg-teal-500" },
] as const

function AppearanceSettings() {
  const { user, updateSettings } = useUserContext()
  const { setTheme } = useTheme()
  const { addToast } = useToast()

  const theme = user?.settings.theme ?? "system"
  const accentColor = user?.settings.accentColor ?? "blue"
  const fontSize = user?.settings.fontSize ?? "medium"
  const density = user?.settings.density ?? "comfortable"
  const sidebarCollapseBehavior = user?.settings.sidebar?.collapseBehavior ?? "remember"
  const sidebarDefaultState = user?.settings.sidebar?.defaultState ?? "expanded"

  const currentAccentName = useMemo(
    () => accentColors.find((a) => a.value === accentColor)?.name ?? "Accent",
    [accentColor],
  )

  if (!user) return null

  const handleThemeChange = (next: "light" | "dark" | "system") => {
    setTheme(next)
    updateSettings({ theme: next })
    addToast("success", "Theme updated.")
  }

  const handleAccentChange = (next: typeof accentColors[number]["value"]) => {
    updateSettings({ accentColor: next })
    addToast("success", "Accent updated.")
  }

  const handleFontSizeChange = (next: "small" | "medium" | "large") => {
    updateSettings({ fontSize: next })
    addToast("success", "Font size updated.")
  }

  const handleDensityChange = (next: "compact" | "comfortable") => {
    updateSettings({ density: next })
    addToast("success", "Density updated.")
  }

  const handleSidebarCollapseBehaviorChange = (next: "remember" | "alwaysCollapsed" | "alwaysExpanded") => {
    updateSettings({ sidebar: { ...(user.settings.sidebar ?? {}), collapseBehavior: next } })
    addToast("success", "Sidebar preference updated.")
  }

  const handleSidebarDefaultStateChange = (next: "collapsed" | "expanded") => {
    updateSettings({ sidebar: { ...(user.settings.sidebar ?? {}), defaultState: next } })
    addToast("success", "Sidebar preference updated.")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Appearance</h2>
        <p className="text-sm text-muted-foreground">Theme, accent color, font size, and layout density.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(["light", "dark", "system"] as const).map((t) => (
              <Button
                key={t}
                type="button"
                variant={theme === t ? "default" : "outline"}
                size="sm"
                onClick={() => handleThemeChange(t)}
                className="capitalize"
              >
                {t}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Applies immediately and persists across reloads.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accent color</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {accentColors.map((accent) => (
              <button
                key={accent.value}
                type="button"
                onClick={() => handleAccentChange(accent.value)}
                className={`h-9 w-9 rounded-full ${accent.color} transition-transform hover:scale-110 ${
                  accentColor === accent.value ? "ring-2 ring-offset-2 ring-primary" : ""
                }`}
                title={accent.name}
                aria-label={accent.name}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Current: {currentAccentName}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>UI preferences</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Font size</Label>
            <Select value={fontSize} onValueChange={(v: "small" | "medium" | "large") => handleFontSizeChange(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Density</Label>
            <Select value={density} onValueChange={(v: "compact" | "comfortable") => handleDensityChange(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="comfortable">Comfortable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sidebar collapse behavior</Label>
            <Select
              value={sidebarCollapseBehavior}
              onValueChange={(v: "remember" | "alwaysCollapsed" | "alwaysExpanded") => handleSidebarCollapseBehaviorChange(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remember">Remember last state</SelectItem>
                <SelectItem value="alwaysExpanded">Always expanded</SelectItem>
                <SelectItem value="alwaysCollapsed">Always collapsed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sidebar default state</Label>
            <Select value={sidebarDefaultState} onValueChange={(v: "collapsed" | "expanded") => handleSidebarDefaultStateChange(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expanded">Expanded</SelectItem>
                <SelectItem value="collapsed">Collapsed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
