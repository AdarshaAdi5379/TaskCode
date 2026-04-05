"use client"

import type React from "react"
import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react"
import type { User, UserContextType, UserSettings } from "./types"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "./supabase/client"

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

const FALLBACK_DEFAULT_USER_ID = "current-user"
const FALLBACK_DEFAULT_USER_EMAIL = "user@example.com"

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const useSupabase = useMemo(() => isSupabaseConfigured(), [])

  useEffect(() => {
    if (!useSupabase) {
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
          id: FALLBACK_DEFAULT_USER_ID,
          email: FALLBACK_DEFAULT_USER_EMAIL,
          displayName: "You",
          role: "admin",
          createdAt: new Date(),
          settings: DEFAULT_USER_SETTINGS,
        }
        setUser(defaultUser)
        localStorage.setItem("taskzen-user", JSON.stringify(defaultUser))
      }
      setIsHydrated(true)
      setIsLoading(false)
      return
    }

    const supabase = getSupabaseBrowserClient()

    let unsub: { data: { subscription: { unsubscribe: () => void } } } | null = null
    const hydrate = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error("[TaskZen] Supabase getSession failed:", error)
          setUser(null)
          return
        }

        const sessionUser = data.session?.user ?? null
        setUser(sessionUser ? mapSupabaseUserToUser(sessionUser) : null)
      } finally {
        setIsHydrated(true)
        setIsLoading(false)
      }
    }

    hydrate()

    unsub = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null
      setUser(sessionUser ? mapSupabaseUserToUser(sessionUser) : null)
    })

    return () => {
      unsub?.data.subscription.unsubscribe()
    }
  }, [useSupabase])

  useEffect(() => {
    if (!useSupabase) {
      if (isHydrated && user) {
        localStorage.setItem("taskzen-user", JSON.stringify(user))
      }
      return
    }

    if (isHydrated && user) {
      localStorage.setItem("taskzen-user", JSON.stringify(user))
    }
  }, [user, isHydrated, useSupabase])

  const login = useCallback((email: string, name: string) => {
    if (useSupabase) return

    const newUser: User = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      email,
      displayName: name,
      role: "user",
      createdAt: new Date(),
      settings: DEFAULT_USER_SETTINGS,
    }
    setUser(newUser)
  }, [useSupabase])

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    if (!useSupabase) return { error: "Supabase not configured" }

    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return {}
  }, [useSupabase])

  const signUpWithPassword = useCallback(async (email: string, password: string, displayName?: string) => {
    if (!useSupabase) return { error: "Supabase not configured" }

    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: displayName ? { data: { full_name: displayName } } : undefined,
    })
    if (error) return { error: error.message }
    return {}
  }, [useSupabase])

  const logout = useCallback(() => {
    if (!useSupabase) {
      setUser(null)
      localStorage.removeItem("taskzen-user")
      return
    }

    const supabase = getSupabaseBrowserClient()
    return supabase.auth.signOut()
  }, [useSupabase])

  const updateProfile = useCallback((updates: Partial<Pick<User, "displayName" | "photoURL">>) => {
    setUser((prev) => prev ? { ...prev, ...updates } : null)
  }, [])

  const updateSettings = useCallback((settings: Partial<UserSettings>) => {
    setUser((prev) => {
      if (!prev) return null
      const next = { ...prev, settings: { ...prev.settings, ...settings } }
      if (useSupabase) {
        try {
          localStorage.setItem(`taskzen-user-settings:${prev.id}`, JSON.stringify(next.settings))
        } catch {
          // ignore
        }
      }
      return next
    })
  }, [useSupabase])

  return (
    <UserContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      signInWithPassword,
      signUpWithPassword,
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

function mapSupabaseUserToUser(supabaseUser: {
  id: string
  email?: string
  created_at?: string
  user_metadata?: Record<string, unknown>
}): User {
  const email = supabaseUser.email ?? ""
  const meta = supabaseUser.user_metadata ?? {}
  const fullName = typeof meta.full_name === "string" ? meta.full_name : undefined
  const avatarUrl = typeof meta.avatar_url === "string" ? meta.avatar_url : undefined
  const role = typeof meta.role === "string" && (meta.role === "admin" || meta.role === "user")
    ? meta.role
    : "user"

  const settingsKey = `taskzen-user-settings:${supabaseUser.id}`
  const storedSettings = typeof window !== "undefined" ? localStorage.getItem(settingsKey) : null
  let settings = DEFAULT_USER_SETTINGS
  if (storedSettings) {
    try {
      settings = { ...DEFAULT_USER_SETTINGS, ...JSON.parse(storedSettings) }
    } catch {
      // ignore
    }
  }

  return {
    id: supabaseUser.id,
    email,
    displayName: fullName || email.split("@")[0] || "User",
    photoURL: avatarUrl,
    role,
    createdAt: supabaseUser.created_at ? new Date(supabaseUser.created_at) : new Date(),
    settings,
  }
}
