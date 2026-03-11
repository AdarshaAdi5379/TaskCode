"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { FeatureFlag, FeatureFlagsContextType, SubscriptionPlan } from "./types"
import { useBilling } from "./billing-context"

const DEFAULT_FLAGS: FeatureFlag[] = [
  { key: "advanced_analytics", enabled: true, plans: ["pro", "enterprise"], overrideUsers: [], developerWhitelist: [] },
  { key: "calendar_sync", enabled: true, plans: ["pro", "enterprise"], overrideUsers: [], developerWhitelist: [] },
  { key: "custom_branding", enabled: true, plans: ["enterprise"], overrideUsers: [], developerWhitelist: [] },
  { key: "sso", enabled: true, plans: ["enterprise"], overrideUsers: [], developerWhitelist: [] },
  { key: "api_access", enabled: true, plans: ["pro", "enterprise"], overrideUsers: [], developerWhitelist: [] },
  { key: "priority_support", enabled: true, plans: ["pro", "enterprise"], overrideUsers: [], developerWhitelist: [] },
  { key: "unlimited_projects", enabled: true, plans: ["pro", "enterprise"], overrideUsers: [], developerWhitelist: [] },
  { key: "unlimited_team_members", enabled: true, plans: ["pro", "enterprise"], overrideUsers: [], developerWhitelist: [] },
]

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined)

export function FeatureFlagsProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlag[]>(DEFAULT_FLAGS)
  const { currentPlan } = useBilling()

  useEffect(() => {
    const stored = localStorage.getItem("taskzen-feature-flags")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setFlags(parsed)
      } catch (e) {
        console.error("[TaskZen] Failed to load feature flags:", e)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("taskzen-feature-flags", JSON.stringify(flags))
  }, [flags])

  const isFeatureEnabled = useCallback((key: string) => {
    const flag = flags.find((f) => f.key === key)
    return flag?.enabled ?? false
  }, [flags])

  const canAccessFeature = useCallback((key: string, userId: string): boolean => {
    const flag = flags.find((f) => f.key === key)
    if (!flag) return false

    if (flag.developerWhitelist.includes(userId)) return true
    if (flag.overrideUsers.includes(userId)) return true
    if (!flag.enabled) return false
    if (!currentPlan || !flag.plans.includes(currentPlan.id as SubscriptionPlan)) return false

    return true
  }, [flags, currentPlan])

  const updateFlag = useCallback((key: string, updates: Partial<FeatureFlag>) => {
    setFlags((prev) =>
      prev.map((f) => (f.key === key ? { ...f, ...updates } : f))
    )
  }, [])

  return (
    <FeatureFlagsContext.Provider value={{
      flags,
      isFeatureEnabled,
      canAccessFeature,
      updateFlag,
    }}>
      {children}
    </FeatureFlagsContext.Provider>
  )
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext)
  if (!context) {
    throw new Error("useFeatureFlags must be used within FeatureFlagsProvider")
  }
  return context
}
