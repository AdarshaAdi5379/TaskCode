"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useUserContext } from "./user-context"

type AccentColor = "blue" | "purple" | "red" | "green" | "teal"

interface ThemeContextType {
  accentColor: AccentColor
  setAccentColor: (color: AccentColor) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// OKLCH values: light-mode primary, dark-mode primary, ring/sidebar-primary (same as primary)
const accentColorMap: Record<AccentColor, { light: string; dark: string }> = {
  blue:   { light: "oklch(0.52 0.22 262)", dark: "oklch(0.7 0.18 262)" },
  purple: { light: "oklch(0.52 0.22 290)", dark: "oklch(0.7 0.18 290)" },
  red:    { light: "oklch(0.52 0.22 15)",  dark: "oklch(0.7 0.18 15)"  },
  green:  { light: "oklch(0.52 0.18 145)", dark: "oklch(0.7 0.15 145)" },
  teal:   { light: "oklch(0.52 0.18 190)", dark: "oklch(0.7 0.15 190)" },
}

export function AccentThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, updateSettings } = useUserContext()
  const [mounted, setMounted] = useState(false)

  const accentColor = (user?.settings.accentColor || "blue") as AccentColor

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !accentColor) return

    const root = document.documentElement
    const colors = accentColorMap[accentColor]
    const isDark = root.classList.contains("dark")
    const value = isDark ? colors.dark : colors.light

    // Update the CSS custom properties used throughout the design system
    root.style.setProperty("--primary", value)
    root.style.setProperty("--ring", value)
    root.style.setProperty("--sidebar-primary", value)
    root.style.setProperty("--sidebar-ring", value)

    root.classList.remove("accent-blue", "accent-purple", "accent-red", "accent-green", "accent-teal")
    root.classList.add(`accent-${accentColor}`)
  }, [accentColor, mounted])

  // Re-apply when dark mode changes
  useEffect(() => {
    if (!mounted) return
    const colors = accentColorMap[accentColor]

    const observer = new MutationObserver(() => {
      const root = document.documentElement
      const isDark = root.classList.contains("dark")
      const value = isDark ? colors.dark : colors.light
      root.style.setProperty("--primary", value)
      root.style.setProperty("--ring", value)
      root.style.setProperty("--sidebar-primary", value)
      root.style.setProperty("--sidebar-ring", value)
    })

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [accentColor, mounted])

  const setAccentColor = (color: AccentColor) => {
    updateSettings({ accentColor: color })
  }

  return (
    <ThemeContext.Provider value={{ accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useAccentTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useAccentTheme must be used within AccentThemeProvider")
  }
  return context
}
