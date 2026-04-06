import type { ProjectSettings, UserSettings, WorkspaceSettings } from "@/lib/types"

export const DEFAULT_USER_SETTINGS: UserSettings = {
  // Appearance
  theme: "system",
  accentColor: "blue",
  fontSize: "medium",
  density: "comfortable",
  sidebar: {
    collapseBehavior: "remember",
    defaultState: "expanded",
  },
  security: {
    sessionTimeoutMinutes: 0,
  },
  productivity: {
    autoAssignCreator: true,
    defaultPriority: "medium",
    defaultDueDateOffsetDays: 0,
    enableSubtasks: true,
    enableRecurringTasks: false,
    enableReminders: true,
    calendar: {
      firstDayOfWeek: "mon",
      defaultView: "month",
    },
  },
  integrations: {
    googleCalendar: { connected: false },
    slack: { connected: false },
    github: { connected: false },
    jira: { connected: false },
  },

  // Notifications
  notifications: {
    email: true,
    push: true,
    taskAssigned: true,
    taskCompleted: true,
    mentions: true,
    projectUpdates: true,
    dueDateReminders: true,
    invites: true,
    weeklySummary: true,
    emailMentions: true,
    emailAssignments: true,
    emailInvites: true,
    emailWeeklySummary: true,
    reminderTime: "09:00",
    dailyDigestTime: "18:00",
    quietHours: { start: "22:00", end: "07:00" },
  },

  // Default preferences
  defaults: {
    workspaceId: undefined,
    projectId: undefined,
    view: "list",
  },
}

export const DEFAULT_WORKSPACE_SETTINGS: WorkspaceSettings = {
  name: "My Workspace",
  logoURL: "",
  description: "",
  timezone: "UTC",
  workingDays: ["mon", "tue", "wed", "thu", "fri"],
  trashRetentionDays: 30,
  permissions: {
    canCreateProjects: "editor",
    canInviteUsers: "editor",
    canDeleteProjects: "owner",
  },
}

export const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
  defaultPriority: "medium",
  defaultStatus: "todo",
  autoCompleteSubtasks: true,
}

type PlainObject = Record<string, any>

function isPlainObject(value: unknown): value is PlainObject {
  if (typeof value !== "object" || value === null) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

export function deepMerge<T>(base: T, patch: Partial<T>): T {
  if (!isPlainObject(base) || !isPlainObject(patch)) {
    return { ...(base as any), ...(patch as any) }
  }

  const out: PlainObject = { ...(base as any) }
  for (const [key, patchValue] of Object.entries(patch)) {
    const baseValue = (out as any)[key]
    if (isPlainObject(baseValue) && isPlainObject(patchValue)) {
      out[key] = deepMerge(baseValue, patchValue)
      continue
    }
    out[key] = patchValue
  }
  return out as T
}

export function mergeUserSettings(stored?: Partial<UserSettings> | null): UserSettings {
  return deepMerge(DEFAULT_USER_SETTINGS, (stored ?? {}) as Partial<UserSettings>)
}
