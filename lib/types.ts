export interface SubTask {
  id: string
  title: string
  isCompleted: boolean
  completedAt?: Date
}

export interface Comment {
  id: string
  userId: string
  userName: string
  content: string
  createdAt: Date
  mentions: string[]
}

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
  updatedAt?: Date
  
  // Sub-task hierarchy
  parentId?: string
  subtasks: SubTask[]
  
  // Soft delete & snooze
  isSoftDeleted: boolean
  deletedAt?: Date
  snoozedUntil?: string
  
  // Completion tracking
  isCompleted: boolean
  completedAt?: Date
  completedBy?: string
  assignedBy?: string
  
  // Comments & collaboration
  comments: Comment[]
  tags?: string[]
   
  // Reminder
  reminder?: string
}

export interface ProjectSettings {
  defaultPriority: Task["priority"]
  defaultStatus: Task["status"]
  autoCompleteSubtasks: boolean
}

export interface ProjectMember {
  userId: string
  email: string
  name: string
  role: "owner" | "admin" | "member"
  joinedAt: Date
}

export interface Project {
  id: string
  name: string
  color: string
  description: string
  createdAt: Date
  updatedAt?: Date
  isArchived: boolean
  ownerId: string
  members: ProjectMember[]
  settings: ProjectSettings
}

export interface ActivityLog {
  id: string
  projectId: string
  taskId?: string
  taskTitle?: string
  userId: string
  userName: string
  action: "created" | "updated" | "deleted" | "completed" | "assigned" | "commented" | "restored" | "member_added" | "member_removed" | "role_changed"
  details: string
  createdAt: Date
}

export interface UserSettings {
  theme: "light" | "dark" | "system"
  accentColor: "blue" | "purple" | "red" | "green" | "teal"
  notifications: {
    email: boolean
    push: boolean
    taskAssigned: boolean
    taskCompleted: boolean
    mentions: boolean
  }
}

export interface User {
  id: string
  email: string
  displayName: string
  photoURL?: string
  role: "user" | "admin"
  createdAt: Date
  settings: UserSettings
}

export interface Notification {
  id: string
  type: "task_assigned" | "task_completed" | "mention" | "comment" | "project_invite"
  title: string
  message: string
  projectId?: string
  taskId?: string
  isRead: boolean
  createdAt: Date
}

export type NotificationFilter = {
  type?: Notification["type"]
  projectId?: string
}

export interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  filter: NotificationFilter
  setFilter: (filter: NotificationFilter) => void
  filteredNotifications: Notification[]
  addNotification: (notification: Omit<Notification, "id" | "isRead" | "createdAt">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAll: () => void
}

export interface UserContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, name: string) => void
  logout: () => void
  updateProfile: (updates: Partial<Pick<User, "displayName" | "photoURL">>) => void
  updateSettings: (settings: Partial<UserSettings>) => void
}

export type TaskSortBy = "priority" | "dueDate" | "createdAt" | "status" | "title"
export type TaskFilter = {
  status?: Task["status"]
  priority?: Task["priority"]
  assignee?: string
  dueDate?: "overdue" | "today" | "upcoming" | "none"
}

export interface TaskContextType {
  tasks: Task[]
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "isSoftDeleted" | "deletedAt" | "subtasks" | "isCompleted" | "completedAt" | "comments">) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  softDeleteTask: (id: string) => void
  restoreTask: (id: string) => void
  permanentDeleteTask: (id: string) => void
  snoozeTask: (id: string, until: string) => void
  getTasksByProject: (projectId: string) => Task[]
  getTasksByStatus: (status: Task["status"]) => Task[]
  getActiveTasks: () => Task[]
  getTrashedTasks: () => Task[]
  getSnoozedTasks: () => Task[]
  getOverdueTasks: () => Task[]
  getTodaysTasks: () => Task[]
  getMyTasks: (userId: string) => Task[]
  createSubTask: (parentTaskId: string, title: string) => void
  updateSubTask: (parentTaskId: string, subtaskId: string, updates: Partial<SubTask>) => void
  deleteSubTask: (parentTaskId: string, subtaskId: string) => void
  toggleSubTask: (parentTaskId: string, subtaskId: string) => void
  addComment: (taskId: string, comment: Omit<Comment, "id" | "createdAt">) => void
  deleteComment: (taskId: string, commentId: string) => void
  sortTasks: (tasks: Task[], sortBy: TaskSortBy, direction?: "asc" | "desc") => Task[]
  filterTasks: (tasks: Task[], filter: TaskFilter) => Task[]
  searchTasks: (tasks: Task[], query: string) => Task[]
}

export interface ProjectContextType {
  projects: Project[]
  addProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt" | "isArchived" | "members" | "settings">) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  getProject: (id: string) => Project | undefined
  getActiveProjects: () => Project[]
  archiveProject: (id: string) => void
  restoreProject: (id: string) => void
  inviteMember: (projectId: string, email: string, name: string, role: ProjectMember["role"]) => void
  removeMember: (projectId: string, userId: string) => void
  updateMemberRole: (projectId: string, userId: string, role: ProjectMember["role"]) => void
  isMember: (projectId: string, userId: string) => boolean
  isOwner: (projectId: string, userId: string) => boolean
}
