"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useBilling } from "@/lib/billing-context"
import { Check, X, Crown, Building2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function PricingPlans() {
  const { plans, currentPlan, upgradePlan, isLoading, subscription } = useBilling()

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "free":
        return <Sparkles className="h-5 w-5" />
      case "pro":
        return <Crown className="h-5 w-5" />
      case "enterprise":
        return <Building2 className="h-5 w-5" />
    }
  }

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case "free":
        return "border-gray-200 dark:border-gray-800"
      case "pro":
        return "border-blue-500 ring-1 ring-blue-500"
      case "enterprise":
        return "border-purple-500 ring-1 ring-purple-500"
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => {
        const isCurrentPlan = currentPlan?.id === plan.id

        return (
          <Card
            key={plan.id}
            className={cn(
              "relative",
              getPlanColor(plan.id),
              isCurrentPlan && "shadow-lg"
            )}
          >
            {plan.id === "pro" && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-blue-500 text-white hover:bg-blue-600">
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                {getPlanIcon(plan.id)}
              </div>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="text-center">
                <span className="text-4xl font-bold">
                  {plan.price === 0 ? "Free" : `$${plan.price}`}
                </span>
                {plan.price > 0 && (
                  <span className="text-muted-foreground">/{plan.interval}</span>
                )}
              </div>

              <ul className="space-y-2 text-sm">
                {plan.features[0].maxProjects === -1 ? (
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Unlimited projects
                  </li>
                ) : (
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    {plan.features[0].maxProjects} projects
                  </li>
                )}
                {plan.features[0].maxTeamMembers === -1 ? (
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Unlimited team members
                  </li>
                ) : (
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    {plan.features[0].maxTeamMembers} team members
                  </li>
                )}
                <li className={cn("flex items-center gap-2", !plan.features[0].calendarSync && "text-muted-foreground")}>
                  {plan.features[0].calendarSync ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  Calendar sync
                </li>
                <li className={cn("flex items-center gap-2", !plan.features[0].advancedAnalytics && "text-muted-foreground")}>
                  {plan.features[0].advancedAnalytics ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  Advanced analytics
                </li>
                <li className={cn("flex items-center gap-2", !plan.features[0].prioritySupport && "text-muted-foreground")}>
                  {plan.features[0].prioritySupport ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  Priority support
                </li>
                <li className={cn("flex items-center gap-2", !plan.features[0].customBranding && "text-muted-foreground")}>
                  {plan.features[0].customBranding ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  Custom branding
                </li>
                <li className={cn("flex items-center gap-2", !plan.features[0].sso && "text-muted-foreground")}>
                  {plan.features[0].sso ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  SSO
                </li>
              </ul>

              <Button
                className="w-full"
                variant={isCurrentPlan ? "outline" : "default"}
                disabled={isCurrentPlan || isLoading}
                onClick={() => upgradePlan(plan.id)}
              >
                {isCurrentPlan ? "Current Plan" : plan.price === 0 ? "Get Started" : "Upgrade"}
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
