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

const accentColorMap: Record<AccentColor, string> = {
  blue: "210 100% 50%",
  purple: "270 100% 50%",
  red: "0 100% 50%",
  green: "140 100% 30%",
  teal: "170 100% 35%",
}

export function AccentThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, updateSettings } = useUserContext()
  const [mounted, setMounted] = useState(false)

  const accentColor = user?.settings.accentColor || "blue"

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !accentColor) return

    const root = document.documentElement
    const hsl = accentColorMap[accentColor]
    
    root.style.setProperty("--color-primary-hsl", hsl)
    
    root.classList.remove("accent-blue", "accent-purple", "accent-red", "accent-green", "accent-teal")
    root.classList.add(`accent-${accentColor}`)
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
