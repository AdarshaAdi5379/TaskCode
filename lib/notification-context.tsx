"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import type { Notification, NotificationContextType, NotificationFilter } from "./types"

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const [filter, setFilter] = useState<NotificationFilter>({})

  useEffect(() => {
    const stored = localStorage.getItem("taskzen-notifications")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setNotifications(parsed.map((n: Notification) => ({
          ...n,
          createdAt: new Date(n.createdAt),
        })))
      } catch (e) {
        console.error("[TaskZen] Failed to load notifications from localStorage:", e)
      }
    }
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("taskzen-notifications", JSON.stringify(notifications))
    }
  }, [notifications, isHydrated])

  const filteredNotifications = useMemo(() => {
    let result = notifications
    
    if (filter.type) {
      result = result.filter((n) => n.type === filter.type)
    }
    
    if (filter.projectId) {
      result = result.filter((n) => n.projectId === filter.projectId)
    }
    
    return result
  }, [notifications, filter])

  const addNotification = useCallback((notificationData: Omit<Notification, "id" | "isRead" | "createdAt">) => {
    const notification: Notification = {
      ...notificationData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      isRead: false,
      createdAt: new Date(),
    }
    setNotifications((prev) => [notification, ...prev])
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }, [])

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      filter,
      setFilter,
      filteredNotifications,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotificationContext must be used within NotificationProvider")
  }
  return context
}
