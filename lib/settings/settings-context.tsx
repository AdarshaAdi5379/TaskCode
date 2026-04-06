"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { UserSettings, WorkspaceSettings } from "@/lib/types"
import { useUserContext } from "@/lib/user-context"
import { DEFAULT_WORKSPACE_SETTINGS, deepMerge } from "@/lib/settings/defaults"
import {
  loadWorkspaceSettingsFromStorage,
  saveWorkspaceSettingsToStorage,
} from "@/lib/settings/storage"

type SettingsContextType = {
  userSettings: UserSettings | null
  updateUserSettings: (patch: Partial<UserSettings>) => void

  workspaceId: string | null
  workspaceSettings: WorkspaceSettings
  updateWorkspaceSettings: (patch: Partial<WorkspaceSettings>) => void

  isLoading: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading, updateSettings } = useUserContext()

  // TaskCode currently has no workspace entity; treat as a single default workspace.
  const workspaceId = "default"
  const [workspaceSettings, setWorkspaceSettings] = useState<WorkspaceSettings>(DEFAULT_WORKSPACE_SETTINGS)

  useEffect(() => {
    if (!user) {
      setWorkspaceSettings(DEFAULT_WORKSPACE_SETTINGS)
      return
    }
    setWorkspaceSettings(loadWorkspaceSettingsFromStorage(workspaceId))
  }, [user?.id, workspaceId])

  const updateUserSettings = useCallback((patch: Partial<UserSettings>) => {
    updateSettings(patch)
  }, [updateSettings])

  const updateWorkspaceSettings = useCallback((patch: Partial<WorkspaceSettings>) => {
    setWorkspaceSettings((prev) => {
      const next = deepMerge(prev, patch)
      saveWorkspaceSettingsToStorage(workspaceId, next)
      return next
    })
  }, [workspaceId])

  const value = useMemo<SettingsContextType>(() => ({
    userSettings: user?.settings ?? null,
    updateUserSettings,
    workspaceId: user ? workspaceId : null,
    workspaceSettings,
    updateWorkspaceSettings,
    isLoading,
  }), [user, workspaceId, workspaceSettings, updateUserSettings, updateWorkspaceSettings, isLoading])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) throw new Error("useSettings must be used within SettingsProvider")
  return context
}
