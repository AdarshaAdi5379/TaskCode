import type { UserRole } from "./types"

type Permission =
  | "view:dashboard"
  | "view:projects"
  | "create:projects"
  | "edit:projects"
  | "delete:projects"
  | "view:tasks"
  | "create:tasks"
  | "edit:tasks"
  | "delete:tasks"
  | "view:team"
  | "invite:team"
  | "remove:team"
  | "view:billing"
  | "manage:billing"
  | "view:admin"
  | "manage:users"
  | "manage:roles"
  | "view:audit"
  | "manage:settings"
  | "use:ai"
  | "manage:automations"
  | "manage:webhooks"

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  user: [
    "view:dashboard",
    "view:projects",
    "create:projects",
    "edit:projects",
    "delete:projects",
    "view:tasks",
    "create:tasks",
    "edit:tasks",
    "delete:tasks",
    "view:team",
    "invite:team",
    "view:billing",
    "use:ai",
  ],
  admin: [
    "view:dashboard",
    "view:projects",
    "create:projects",
    "edit:projects",
    "delete:projects",
    "view:tasks",
    "create:tasks",
    "edit:tasks",
    "delete:tasks",
    "view:team",
    "invite:team",
    "remove:team",
    "view:billing",
    "manage:billing",
    "view:admin",
    "manage:users",
    "view:audit",
    "manage:settings",
    "use:ai",
    "manage:automations",
    "manage:webhooks",
  ],
  superadmin: [
    "view:dashboard",
    "view:projects",
    "create:projects",
    "edit:projects",
    "delete:projects",
    "view:tasks",
    "create:tasks",
    "edit:tasks",
    "delete:tasks",
    "view:team",
    "invite:team",
    "remove:team",
    "view:billing",
    "manage:billing",
    "view:admin",
    "manage:users",
    "manage:roles",
    "view:audit",
    "manage:settings",
    "use:ai",
    "manage:automations",
    "manage:webhooks",
  ],
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p))
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p))
}

export function canAccessAdmin(role: UserRole): boolean {
  return hasPermission(role, "view:admin")
}

export function canManageUsers(role: UserRole): boolean {
  return hasPermission(role, "manage:users")
}

export function canManageBilling(role: UserRole): boolean {
  return hasPermission(role, "manage:billing")
}

export function canManageAutomations(role: UserRole): boolean {
  return hasPermission(role, "manage:automations")
}

export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? []
}
