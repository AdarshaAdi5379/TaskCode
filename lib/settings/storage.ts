import type { WorkspaceSettings } from "@/lib/types"
import { DEFAULT_WORKSPACE_SETTINGS, deepMerge, mergeUserSettings } from "@/lib/settings/defaults"

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function loadUserSettingsFromStorage(userId: string) {
  const raw = typeof window !== "undefined" ? localStorage.getItem(`taskzen-user-settings:${userId}`) : null
  const parsed = safeJsonParse<any>(raw)
  return mergeUserSettings(parsed)
}

export function saveUserSettingsToStorage(userId: string, settings: unknown) {
  try {
    localStorage.setItem(`taskzen-user-settings:${userId}`, JSON.stringify(settings))
  } catch {
    // ignore
  }
}

export function loadWorkspaceSettingsFromStorage(workspaceId: string): WorkspaceSettings {
  const raw = typeof window !== "undefined"
    ? localStorage.getItem(`taskzen-workspace-settings:${workspaceId}`)
    : null
  const parsed = safeJsonParse<Partial<WorkspaceSettings>>(raw)
  return deepMerge(DEFAULT_WORKSPACE_SETTINGS, parsed ?? {})
}

export function saveWorkspaceSettingsToStorage(workspaceId: string, settings: WorkspaceSettings) {
  try {
    localStorage.setItem(`taskzen-workspace-settings:${workspaceId}`, JSON.stringify(settings))
  } catch {
    // ignore
  }
}

