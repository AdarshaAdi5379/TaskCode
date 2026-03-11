"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { Subscription, BillingHistoryItem, SubscriptionPlan, SubscriptionPlanDetails, BillingContextType } from "./types"

const SUBSCRIPTION_PLANS: SubscriptionPlanDetails[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "monthly",
    description: "Perfect for individuals",
    features: [
      { maxProjects: 3, maxTeamMembers: 2, calendarSync: false, advancedAnalytics: false, prioritySupport: false, customBranding: false, sso: false, apiAccess: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 9.99,
    interval: "monthly",
    description: "For growing teams",
    features: [
      { maxProjects: -1, maxTeamMembers: -1, calendarSync: true, advancedAnalytics: true, prioritySupport: true, customBranding: false, sso: false, apiAccess: true },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 0,
    interval: "monthly",
    description: "For large organizations",
    features: [
      { maxProjects: -1, maxTeamMembers: -1, calendarSync: true, advancedAnalytics: true, prioritySupport: true, customBranding: true, sso: true, apiAccess: true },
    ],
  },
]

const BillingContext = createContext<BillingContextType | undefined>(undefined)

export function BillingProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("taskzen-subscription")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setSubscription({
          ...parsed,
          currentPeriodStart: new Date(parsed.currentPeriodStart),
          currentPeriodEnd: new Date(parsed.currentPeriodEnd),
        })
      } catch (e) {
        console.error("[TaskZen] Failed to load subscription:", e)
      }
    } else {
      const defaultSubscription: Subscription = {
        id: "free-" + Date.now(),
        userId: "current-user",
        plan: "free",
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
      }
      setSubscription(defaultSubscription)
      localStorage.setItem("taskzen-subscription", JSON.stringify(defaultSubscription))
    }

    const history = localStorage.getItem("taskzen-billing-history")
    if (history) {
      try {
        const parsed = JSON.parse(history)
        setBillingHistory(parsed.map((h: BillingHistoryItem) => ({
          ...h,
          createdAt: new Date(h.createdAt),
        })))
      } catch (e) {
        console.error("[TaskZen] Failed to load billing history:", e)
      }
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading && subscription) {
      localStorage.setItem("taskzen-subscription", JSON.stringify(subscription))
    }
  }, [subscription, isLoading])

  useEffect(() => {
    if (!isLoading && billingHistory.length > 0) {
      localStorage.setItem("taskzen-billing-history", JSON.stringify(billingHistory))
    }
  }, [billingHistory, isLoading])

  const currentPlan = SUBSCRIPTION_PLANS.find((p) => p.id === subscription?.plan) || SUBSCRIPTION_PLANS[0]

  const upgradePlan = useCallback(async (planId: SubscriptionPlan) => {
    setIsLoading(true)
    
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newSubscription: Subscription = {
      id: "sub-" + Date.now(),
      userId: "current-user",
      plan: planId,
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
    }

    setSubscription(newSubscription)

    if (planId !== "free") {
      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)
      const historyItem: BillingHistoryItem = {
        id: "bill-" + Date.now(),
        userId: "current-user",
        amount: plan?.price || 0,
        currency: "USD",
        status: "succeeded",
        description: `${plan?.name} plan subscription`,
        createdAt: new Date(),
      }
      setBillingHistory((prev) => [historyItem, ...prev])
    }

    setIsLoading(false)
  }, [])

  const cancelSubscription = useCallback(async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    setSubscription((prev) => prev ? {
      ...prev,
      cancelAtPeriodEnd: true,
      status: "cancelled",
    } : null)

    setIsLoading(false)
  }, [])

  const resumeSubscription = useCallback(async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    setSubscription((prev) => prev ? {
      ...prev,
      cancelAtPeriodEnd: false,
      status: "active",
    } : null)

    setIsLoading(false)
  }, [])

  return (
    <BillingContext.Provider value={{
      subscription,
      plans: SUBSCRIPTION_PLANS,
      currentPlan,
      billingHistory,
      isLoading,
      upgradePlan,
      cancelSubscription,
      resumeSubscription,
    }}>
      {children}
    </BillingContext.Provider>
  )
}

export function useBilling() {
  const context = useContext(BillingContext)
  if (!context) {
    throw new Error("useBilling must be used within BillingProvider")
  }
  return context
}
