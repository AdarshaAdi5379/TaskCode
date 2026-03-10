export interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high" | "critical"
  dueDate?: string
  assignees: string[]
  labels: string[]
  projectId: string
  createdAt: Date
}

export interface Project {
  id: string
  name: string
  color: string
  description: string
  createdAt: Date
}

export interface TaskContextType {
  tasks: Task[]
  addTask: (task: Omit<Task, "id" | "createdAt">) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  getTasksByProject: (projectId: string) => Task[]
  getTasksByStatus: (status: Task["status"]) => Task[]
}

export interface ProjectContextType {
  projects: Project[]
  addProject: (project: Omit<Project, "id" | "createdAt">) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  getProject: (id: string) => Project | undefined
}
