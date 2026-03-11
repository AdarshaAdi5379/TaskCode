import type { Task } from "./types"

export type AutomationTrigger = 
  | "task_created"
  | "task_completed"
  | "task_assigned"
  | "due_date_approaching"
  | "task_overdue"

export type AutomationAction = 
  | "add_label"
  | "remove_label"
  | "change_priority"
  | "send_notification"
  | "assign_to"
  | "move_to_project"

export interface AutomationRule {
  id: string
  name: string
  description: string
  enabled: boolean
  trigger: AutomationTrigger
  conditions: AutomationCondition[]
  actions: AutomationAction[]
  actionConfig: Record<string, string>
  projectId?: string
  createdAt: Date
}

export interface AutomationCondition {
  field: "priority" | "status" | "assignee" | "labels" | "due_date"
  operator: "equals" | "not_equals" | "contains" | "not_contains" | "before" | "after"
  value: string
}

export interface AutomationLog {
  id: string
  ruleId: string
  ruleName: string
  trigger: AutomationTrigger
  taskId?: string
  taskTitle?: string
  action: AutomationAction
  status: "success" | "failed"
  error?: string
  createdAt: Date
}

export function evaluateConditions(conditions: AutomationCondition[], task: Task): boolean {
  if (conditions.length === 0) return true

  return conditions.every((condition) => {
    const taskValue = getTaskFieldValue(condition.field, task)

    switch (condition.operator) {
      case "equals":
        return taskValue === condition.value
      case "not_equals":
        return taskValue !== condition.value
      case "contains":
        return String(taskValue).toLowerCase().includes(condition.value.toLowerCase())
      case "not_contains":
        return !String(taskValue).toLowerCase().includes(condition.value.toLowerCase())
      case "before":
        if (!taskValue) return false
        return new Date(taskValue) < new Date(condition.value)
      case "after":
        if (!taskValue) return false
        return new Date(taskValue) > new Date(condition.value)
      default:
        return false
    }
  })
}

function getTaskFieldValue(field: AutomationCondition["field"], task: Task): string | undefined {
  switch (field) {
    case "priority":
      return task.priority
    case "status":
      return task.status
    case "assignee":
      return task.assignees.join(", ")
    case "labels":
      return task.labels.join(", ")
    case "due_date":
      return task.dueDate
    default:
      return undefined
  }
}

export function executeActions(
  actions: AutomationAction[],
  actionConfig: Record<string, string>,
  task: Task,
  onAction: (action: AutomationAction, config: Record<string, string>, task: Task) => Task
): Task {
  let updatedTask = { ...task }

  for (const action of actions) {
    updatedTask = onAction(action, actionConfig, updatedTask)
  }

  return updatedTask
}

export function getTriggerDescription(trigger: AutomationTrigger): string {
  switch (trigger) {
    case "task_created":
      return "When a task is created"
    case "task_completed":
      return "When a task is marked as completed"
    case "task_assigned":
      return "When a task is assigned to someone"
    case "due_date_approaching":
      return "When a task's due date is approaching (within 24 hours)"
    case "task_overdue":
      return "When a task becomes overdue"
  }
}

export function getActionDescription(action: AutomationAction): string {
  switch (action) {
    case "add_label":
      return "Add a label to the task"
    case "remove_label":
      return "Remove a label from the task"
    case "change_priority":
      return "Change the task priority"
    case "send_notification":
      return "Send a notification"
    case "assign_to":
      return "Assign the task to someone"
    case "move_to_project":
      return "Move the task to another project"
  }
}
