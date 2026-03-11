"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { PricingPlans } from "@/components/billing/pricing-plans"
import { BillingHistory } from "@/components/billing/billing-history"
import { useBilling } from "@/lib/billing-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Building2, Calendar, BarChart3, Users, Palette, Shield, Zap } from "lucide-react"

export default function BillingPage() {
  const { currentPlan, subscription } = useBilling()

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "free":
        return <Crown className="h-5 w-5" />
      case "pro":
        return <Building2 className="h-5 w-5" />
      case "enterprise":
        return <Building2 className="h-5 w-5" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "past_due":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "trialing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    }
  }

  return (
    <MainLayout>
      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
            <p className="text-muted-foreground">Manage your subscription and billing</p>
          </div>
        </div>

        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getPlanIcon(currentPlan?.id || "free")}
              Current Plan: {currentPlan?.name}
            </CardTitle>
            <CardDescription>
              {subscription?.cancelAtPeriodEnd 
                ? "Your subscription will end on the current period end date"
                : "You have access to all features included in your plan"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge className={getStatusBadge(subscription?.status || "active")}>
                {subscription?.status || "active"}
              </Badge>
              {subscription?.currentPeriodEnd && (
                <span className="text-sm text-muted-foreground">
                  {subscription.cancelAtPeriodEnd 
                    ? `Cancels on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                    : `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                  }
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Plan Features */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
          <PricingPlans />
        </div>

        {/* Billing History */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Billing History</h2>
          <BillingHistory />
        </div>
      </div>
    </MainLayout>
  )
}
