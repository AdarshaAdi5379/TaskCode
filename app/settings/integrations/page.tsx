"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/lib/toast-context"
import { useUserContext } from "@/lib/user-context"

export default function IntegrationsSettingsPage() {
  return <IntegrationsSettings />
}

type IntegrationKey = "googleCalendar" | "slack" | "github" | "jira"

const INTEGRATIONS: { key: IntegrationKey; name: string; description: string }[] = [
  { key: "googleCalendar", name: "Google Calendar", description: "Sync tasks and due dates to your calendar." },
  { key: "slack", name: "Slack", description: "Send task and mention notifications to Slack." },
  { key: "github", name: "GitHub", description: "Link tasks to PRs/issues and sync status." },
  { key: "jira", name: "Jira", description: "Import projects and keep issues in sync." },
]

function IntegrationsSettings() {
  const { user, updateSettings } = useUserContext()
  const { addToast } = useToast()

  if (!user) return null

  const connected = useMemo(() => user.settings.integrations ?? {}, [user.settings.integrations])

  const setConnected = (key: IntegrationKey, next: boolean) => {
    updateSettings({
      integrations: {
        ...(user.settings.integrations ?? {}),
        [key]: next
          ? { connected: true, connectedAt: new Date().toISOString() }
          : { connected: false, connectedAt: undefined },
      },
    })
    addToast("success", next ? "Connected." : "Disconnected.")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Integrations</h2>
        <p className="text-sm text-muted-foreground">
          Connect external tools like Google Calendar, Slack, GitHub, and Jira.
        </p>
      </div>

      <div className="grid gap-4">
        {INTEGRATIONS.map((i) => {
          const state = (connected as any)?.[i.key] as { connected?: boolean; connectedAt?: string } | undefined
          const isConnected = !!state?.connected
          return (
            <Card key={i.key}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <CardTitle className="text-base flex items-center gap-2">
                    {i.name}
                    <Badge variant={isConnected ? "default" : "secondary"}>
                      {isConnected ? "Connected" : "Not connected"}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{i.description}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {isConnected ? (
                    <Button type="button" variant="outline" onClick={() => setConnected(i.key, false)}>
                      Disconnect
                    </Button>
                  ) : (
                    <Button type="button" onClick={() => setConnected(i.key, true)}>
                      Connect
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Sync status:{" "}
                {isConnected ? (
                  <span>
                    Connected{state?.connectedAt ? ` • ${new Date(state.connectedAt).toLocaleString()}` : ""}
                  </span>
                ) : (
                  <span>Not connected</span>
                )}
                <div className="pt-2">
                  OAuth + real syncing is implemented later; this state is stored now for UI scaffolding.
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
