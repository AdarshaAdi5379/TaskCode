import type { Task, Project, Notification } from "./types"

export interface FirestoreConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

export type FirestoreListener = () => void

export interface FirestoreService {
  initialize: (config: FirestoreConfig) => Promise<void>
  
  onTasksChange: (callback: (tasks: Task[]) => void) => FirestoreListener
  onProjectsChange: (callback: (projects: Project[]) => void) => FirestoreListener
  onNotificationsChange: (callback: (notifications: Notification[]) => void) => FirestoreListener
  
  createTask: (task: Omit<Task, "id">) => Promise<Task>
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  
  createProject: (project: Omit<Project, "id">) => Promise<Project>
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (projectId: string) => Promise<void>
  
  addProjectMember: (projectId: string, member: Project["members"][0]) => Promise<void>
  removeProjectMember: (projectId: string, userId: string) => Promise<void>
  
  addNotification: (notification: Omit<Notification, "id" | "createdAt">) => Promise<Notification>
  markNotificationRead: (notificationId: string) => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
  
  signInWithGoogle: () => Promise<{ uid: string; email: string; displayName: string }>
  signOut: () => Promise<void>
  getCurrentUser: () => Promise<{ uid: string; email: string; displayName: string } | null>
}

let firestoreInstance: FirestoreService | null = null

export function getFirestoreService(): FirestoreService {
  if (!firestoreInstance) {
    firestoreInstance = createMockFirestoreService()
  }
  return firestoreInstance
}

function createMockFirestoreService(): FirestoreService {
  console.log("[TaskZen] Using mock Firestore service. Firebase not configured.")
  
  return {
    initialize: async () => {
      console.log("[TaskZen] Firestore initialized (mock)")
    },
    
    onTasksChange: (callback) => {
      console.log("[TaskZen] Task listener registered (mock)")
      return () => console.log("[TaskZen] Task listener cleanup (mock)")
    },
    
    onProjectsChange: (callback) => {
      console.log("[TaskZen] Project listener registered (mock)")
      return () => console.log("[TaskZen] Project listener cleanup (mock)")
    },
    
    onNotificationsChange: (callback) => {
      console.log("[TaskZen] Notification listener registered (mock)")
      return () => console.log("[TaskZen] Notification listener cleanup (mock)")
    },
    
    createTask: async (task) => {
      console.log("[TaskZen] Creating task (mock):", task)
      return { ...task, id: Date.now().toString() } as Task
    },
    
    updateTask: async (taskId, updates) => {
      console.log("[TaskZen] Updating task (mock):", taskId, updates)
    },
    
    deleteTask: async (taskId) => {
      console.log("[TaskZen] Deleting task (mock):", taskId)
    },
    
    createProject: async (project) => {
      console.log("[TaskZen] Creating project (mock):", project)
      return { ...project, id: Date.now().toString() } as Project
    },
    
    updateProject: async (projectId, updates) => {
      console.log("[TaskZen] Updating project (mock):", projectId, updates)
    },
    
    deleteProject: async (projectId) => {
      console.log("[TaskZen] Deleting project (mock):", projectId)
    },
    
    addProjectMember: async (projectId, member) => {
      console.log("[TaskZen] Adding project member (mock):", projectId, member)
    },
    
    removeProjectMember: async (projectId, userId) => {
      console.log("[TaskZen] Removing project member (mock):", projectId, userId)
    },
    
    addNotification: async (notification) => {
      console.log("[TaskZen] Adding notification (mock):", notification)
      return { 
        ...notification, 
        id: Date.now().toString(),
        isRead: false,
        createdAt: new Date()
      } as Notification
    },
    
    markNotificationRead: async (notificationId) => {
      console.log("[TaskZen] Marking notification read (mock):", notificationId)
    },
    
    deleteNotification: async (notificationId) => {
      console.log("[TaskZen] Deleting notification (mock):", notificationId)
    },
    
    signInWithGoogle: async () => {
      console.log("[TaskZen] Google sign in (mock)")
      return { 
        uid: "mock-user-id", 
        email: "user@example.com", 
        displayName: "Mock User" 
      }
    },
    
    signOut: async () => {
      console.log("[TaskZen] Sign out (mock)")
    },
    
    getCurrentUser: async () => {
      console.log("[TaskZen] Get current user (mock)")
      return { 
        uid: "mock-user-id", 
        email: "user@example.com", 
        displayName: "Mock User" 
      }
    },
  }
}

export async function initializeFirestore(): Promise<void> {
  const config: FirestoreConfig | null = null

  if (!config) {
    console.log("[TaskZen] Firebase not configured. Using local storage.")
    return
  }

  const service = getFirestoreService()
  await service.initialize(config)
}
