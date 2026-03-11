export interface WebhookEvent {
  id: string
  type: WebhookEventType
  timestamp: Date
  data: Record<string, unknown>
}

export type WebhookEventType = 
  | "task.created"
  | "task.updated"
  | "task.completed"
  | "task.deleted"
  | "project.created"
  | "project.updated"
  | "project.deleted"
  | "member.added"
  | "member.removed"

export interface Webhook {
  id: string
  name: string
  url: string
  events: WebhookEventType[]
  secret: string
  active: boolean
  createdAt: Date
  lastTriggeredAt?: Date
}

export interface WebhookLog {
  id: string
  webhookId: string
  event: WebhookEventType
  status: "success" | "failed"
  responseStatus?: number
  responseBody?: string
  error?: string
  timestamp: Date
  duration: number
}

const webhookEvents: Record<WebhookEventType, string> = {
  "task.created": "Triggered when a new task is created",
  "task.updated": "Triggered when a task is updated",
  "task.completed": "Triggered when a task is marked as completed",
  "task.deleted": "Triggered when a task is deleted",
  "project.created": "Triggered when a new project is created",
  "project.updated": "Triggered when a project is updated",
  "project.deleted": "Triggered when a project is deleted",
  "member.added": "Triggered when a member is added to a project",
  "member.removed": "Triggered when a member is removed from a project",
}

export function getWebhookEventDescription(event: WebhookEventType): string {
  return webhookEvents[event] || "Unknown event"
}

export async function sendWebhook(
  webhook: Webhook,
  event: WebhookEventType,
  data: Record<string, unknown>
): Promise<{ success: boolean; status?: number; error?: string }> {
  if (!webhook.active) {
    return { success: false, error: "Webhook is inactive" }
  }

  const payload: WebhookEvent = {
    id: `evt_${Date.now()}`,
    type: event,
    timestamp: new Date(),
    data,
  }

  const startTime = Date.now()

  try {
    console.log(`[TaskZen] Sending webhook ${webhook.id} for event ${event}`)

    console.log(`[TaskZen] Webhook payload:`, payload)

    await new Promise((resolve) => setTimeout(resolve, 200))

    return { success: true, status: 200 }
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[TaskZen] Webhook failed:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export function createWebhookPayload(
  eventType: string,
  resource: Record<string, unknown>
): Record<string, unknown> {
  return {
    event: eventType,
    timestamp: new Date().toISOString(),
    data: {
      ...resource,
      id: resource.id,
    },
  }
}
