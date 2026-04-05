import type { Comment, Project, ProjectMember, Task, SubTask } from "@/lib/types"

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }

export type JsonProject = Omit<Project, "createdAt" | "updatedAt" | "members"> & {
  createdAt: string
  updatedAt?: string
  members: (Omit<ProjectMember, "joinedAt"> & { joinedAt: string })[]
}

export type JsonTask = Omit<
  Task,
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "completedAt"
  | "subtasks"
  | "comments"
> & {
  createdAt: string
  updatedAt?: string
  deletedAt?: string
  completedAt?: string
  subtasks: (Omit<SubTask, "completedAt"> & { completedAt?: string })[]
  comments: (Omit<Comment, "createdAt"> & { createdAt: string })[]
}

export function serializeProject(project: Project): JsonProject {
  return {
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt ? project.updatedAt.toISOString() : undefined,
    members: (project.members ?? []).map((m) => ({
      ...m,
      joinedAt: m.joinedAt.toISOString(),
    })),
  }
}

export function deserializeProject(data: any): Project {
  const project = data as JsonProject
  return {
    ...project,
    createdAt: new Date(project.createdAt),
    updatedAt: project.updatedAt ? new Date(project.updatedAt) : undefined,
    members: (project.members ?? []).map((m) => ({
      ...m,
      joinedAt: new Date(m.joinedAt),
    })),
  }
}

export function serializeTask(task: Task): JsonTask {
  return {
    ...task,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt ? task.updatedAt.toISOString() : undefined,
    deletedAt: task.deletedAt ? task.deletedAt.toISOString() : undefined,
    completedAt: task.completedAt ? task.completedAt.toISOString() : undefined,
    subtasks: (task.subtasks ?? []).map((st) => ({
      ...st,
      completedAt: st.completedAt ? st.completedAt.toISOString() : undefined,
    })),
    comments: (task.comments ?? []).map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })),
  }
}

export function deserializeTask(data: any): Task {
  const task = data as JsonTask
  return {
    ...task,
    createdAt: new Date(task.createdAt),
    updatedAt: task.updatedAt ? new Date(task.updatedAt) : undefined,
    deletedAt: task.deletedAt ? new Date(task.deletedAt) : undefined,
    completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
    subtasks: (task.subtasks ?? []).map((st) => ({
      ...st,
      completedAt: st.completedAt ? new Date(st.completedAt) : undefined,
    })),
    comments: (task.comments ?? []).map((c) => ({
      ...c,
      createdAt: new Date(c.createdAt),
    })),
  }
}

export function safeJson(value: unknown): JsonValue {
  return value as JsonValue
}

