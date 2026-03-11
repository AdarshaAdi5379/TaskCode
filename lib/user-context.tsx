"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { User, UserContextType, UserSettings } from "./types"

const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: "system",
  accentColor: "blue",
  notifications: {
    email: true,
    push: true,
    taskAssigned: true,
    taskCompleted: true,
    mentions: true,
  },
}

const DEFAULT_USER_ID = "current-user"
const DEFAULT_USER_EMAIL = "user@example.com"

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("taskzen-user")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setUser({
          ...parsed,
          createdAt: new Date(parsed.createdAt),
        })
      } catch (e) {
        console.error("[TaskZen] Failed to load user from localStorage:", e)
      }
    } else {
      const defaultUser: User = {
        id: DEFAULT_USER_ID,
        email: DEFAULT_USER_EMAIL,
        displayName: "You",
        role: "user",
        createdAt: new Date(),
        settings: DEFAULT_USER_SETTINGS,
      }
      setUser(defaultUser)
      localStorage.setItem("taskzen-user", JSON.stringify(defaultUser))
    }
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated && user) {
      localStorage.setItem("taskzen-user", JSON.stringify(user))
    }
  }, [user, isHydrated])

  const login = useCallback((email: string, name: string) => {
    const newUser: User = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      email,
      displayName: name,
      role: "user",
      createdAt: new Date(),
      settings: DEFAULT_USER_SETTINGS,
    }
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem("taskzen-user")
  }, [])

  const updateProfile = useCallback((updates: Partial<Pick<User, "displayName" | "photoURL">>) => {
    setUser((prev) => prev ? { ...prev, ...updates } : null)
  }, [])

  const updateSettings = useCallback((settings: Partial<UserSettings>) => {
    setUser((prev) => prev ? { ...prev, settings: { ...prev.settings, ...settings } } : null)
  }, [])

  return (
    <UserContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      updateProfile,
      updateSettings,
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUserContext() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUserContext must be used within UserProvider")
  }
  return context
}
