"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { AdminContextType, AdminUser, AuditLog, SystemMetrics, UserRole } from "./types"

const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: "user-1",
    email: "john@example.com",
    displayName: "John Doe",
    role: "admin",
    status: "active",
    createdAt: new Date("2024-01-15"),
    lastLoginAt: new Date(),
    projectsCount: 5,
    tasksCount: 23,
  },
  {
    id: "user-2",
    email: "jane@example.com",
    displayName: "Jane Smith",
    role: "user",
    status: "active",
    createdAt: new Date("2024-02-20"),
    lastLoginAt: new Date("2024-03-10"),
    projectsCount: 3,
    tasksCount: 15,
  },
  {
    id: "user-3",
    email: "bob@example.com",
    displayName: "Bob Wilson",
    role: "user",
    status: "suspended",
    createdAt: new Date("2024-03-01"),
    projectsCount: 1,
    tasksCount: 8,
  },
  {
    id: "user-4",
    email: "alice@example.com",
    displayName: "Alice Brown",
    role: "superadmin",
    status: "active",
    createdAt: new Date("2023-12-01"),
    lastLoginAt: new Date(),
    projectsCount: 12,
    tasksCount: 45,
  },
]

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-1",
    userId: "user-1",
    userName: "John Doe",
    action: "CREATE",
    resource: "Project",
    resourceId: "proj-1",
    details: "Created project 'Website Redesign'",
    ipAddress: "192.168.1.100",
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: "log-2",
    userId: "user-2",
    userName: "Jane Smith",
    action: "UPDATE",
    resource: "Task",
    resourceId: "task-5",
    details: "Marked task 'Fix login bug' as completed",
    ipAddress: "192.168.1.101",
    createdAt: new Date(Date.now() - 7200000),
  },
  {
    id: "log-3",
    userId: "user-4",
    userName: "Alice Brown",
    action: "DELETE",
    resource: "User",
    resourceId: "user-3",
    details: "Suspended user account",
    ipAddress: "192.168.1.102",
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: "log-4",
    userId: "user-1",
    userName: "John Doe",
    action: "UPDATE",
    resource: "Project",
    resourceId: "proj-2",
    details: "Changed project 'Mobile App' visibility to public",
    ipAddress: "192.168.1.100",
    createdAt: new Date(Date.now() - 172800000),
  },
  {
    id: "log-5",
    userId: "user-2",
    userName: "Jane Smith",
    action: "CREATE",
    resource: "Task",
    resourceId: "task-10",
    details: "Created task 'Design new landing page'",
    ipAddress: "192.168.1.101",
    createdAt: new Date(Date.now() - 259200000),
  },
]

const DEFAULT_METRICS: SystemMetrics = {
  totalUsers: 156,
  activeUsers: 89,
  totalProjects: 42,
  totalTasks: 1250,
  completedTasks: 980,
  storageUsed: 2.4,
  apiCalls: 45600,
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [metrics, setMetrics] = useState<SystemMetrics>(DEFAULT_METRICS)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("taskzen-admin-data")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setUsers(parsed.users || MOCK_ADMIN_USERS)
        setAuditLogs(parsed.auditLogs || MOCK_AUDIT_LOGS)
        setMetrics(parsed.metrics || DEFAULT_METRICS)
      } catch (e) {
        console.error("[TaskZen] Failed to load admin data:", e)
        setUsers(MOCK_ADMIN_USERS)
        setAuditLogs(MOCK_AUDIT_LOGS)
        setMetrics(DEFAULT_METRICS)
      }
    } else {
      setUsers(MOCK_ADMIN_USERS)
      setAuditLogs(MOCK_AUDIT_LOGS)
      setMetrics(DEFAULT_METRICS)
    }

    const adminCheck = localStorage.getItem("taskzen-user")
    if (adminCheck) {
      try {
        const user = JSON.parse(adminCheck)
        setIsAdmin(user.role === "admin" || user.role === "superadmin")
      } catch {
        setIsAdmin(false)
      }
    }
  }, [])

  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem(
        "taskzen-admin-data",
        JSON.stringify({ users, auditLogs, metrics })
      )
    }
  }, [users, auditLogs, metrics])

  const addAuditLog = useCallback((log: Omit<AuditLog, "id" | "createdAt">) => {
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}`,
      createdAt: new Date(),
    }
    setAuditLogs((prev) => [newLog, ...prev])
  }, [])

  const updateUserRole = useCallback((userId: string, role: UserRole) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, role } : user
      )
    )
    const targetUser = users.find((u) => u.id === userId)
    if (targetUser) {
      addAuditLog({
        userId: "current-user",
        userName: "Current User",
        action: "UPDATE",
        resource: "User",
        resourceId: userId,
        details: `Changed role from ${targetUser.role} to ${role}`,
      })
    }
  }, [users, addAuditLog])

  const suspendUser = useCallback((userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, status: "suspended" } : user
      )
    )
    const targetUser = users.find((u) => u.id === userId)
    if (targetUser) {
      addAuditLog({
        userId: "current-user",
        userName: "Current User",
        action: "SUSPEND",
        resource: "User",
        resourceId: userId,
        details: `Suspended user: ${targetUser.displayName}`,
      })
    }
  }, [users, addAuditLog])

  const activateUser = useCallback((userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, status: "active" } : user
      )
    )
    const targetUser = users.find((u) => u.id === userId)
    if (targetUser) {
      addAuditLog({
        userId: "current-user",
        userName: "Current User",
        action: "ACTIVATE",
        resource: "User",
        resourceId: userId,
        details: `Activated user: ${targetUser.displayName}`,
      })
    }
  }, [users, addAuditLog])

  return (
    <AdminContext.Provider
      value={{
        users,
        auditLogs,
        metrics,
        isAdmin,
        updateUserRole,
        suspendUser,
        activateUser,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
