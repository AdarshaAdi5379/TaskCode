"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useBilling } from "@/lib/billing-context"
import { CheckCircle2, XCircle, Clock, Receipt, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

export function BillingHistory() {
  const { billingHistory, subscription, cancelSubscription, resumeSubscription, isLoading } = useBilling()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "succeeded":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "succeeded":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>View your payment history and invoices</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {billingHistory.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No billing history yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {billingHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(item.status)}
                  <div>
                    <p className="font-medium">{item.description}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(item.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">${item.amount.toFixed(2)}</span>
                  <Badge className={getStatusBadge(item.status)}>
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {subscription?.status === "cancelled" && (
          <div className="mt-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Your subscription will end on {formatDate(subscription.currentPeriodEnd)}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={resumeSubscription}
              disabled={isLoading}
            >
              Resume Subscription
            </Button>
          </div>
        )}

        {subscription?.status === "active" && subscription.plan !== "free" && (
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={cancelSubscription}
              disabled={isLoading || subscription.cancelAtPeriodEnd}
              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              Cancel Subscription
            </Button>
            {subscription.cancelAtPeriodEnd && (
              <p className="text-xs text-muted-foreground mt-2">
                Your subscription will be cancelled at the end of the billing period
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
