"use client"

import { useEffect } from "react"
import { useUserContext } from "@/lib/user-context"

export function UIPreferencesApplier() {
  const { user } = useUserContext()

  useEffect(() => {
    const root = document.documentElement

    const fontSize = user?.settings.fontSize ?? "medium"
    const density = user?.settings.density ?? "comfortable"

    root.dataset.fontSize = fontSize
    root.dataset.density = density
  }, [user?.settings.fontSize, user?.settings.density])

  return null
}

