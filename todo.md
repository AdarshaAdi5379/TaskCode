# TaskZen Implementation Roadmap

## Phase 1: Core Foundation (Week 1-2) ✅ COMPLETED

### 1.1 Project & Task Data Models
- [x] Update Project interface to include: `createdAt`, `updatedAt`, `isArchived`, `memberIds`, `ownerId`, `settings`
- [x] Update Task interface to include: `parentId` (for sub-tasks), `subtasks[]`, `isSoftDeleted`, `deletedAt`, `snoozedUntil`, `reminder`, `isCompleted`, `completedAt`, `completedBy`, `assignedBy`, `comments[]`, `attachments[]`, `tags[]`
- [x] Create SubTask interface with: `id`, `title`, `isCompleted`, `completedAt`
- [x] Create Comment interface with: `id`, `userId`, `content`, `createdAt`, `mentions[]`
- [x] Create ActivityLog interface for tracking changes

### 1.2 Enhanced Task Context
- [x] Add `createSubTask(parentTaskId, subtask)` function
- [x] Add `updateSubTask(parentTaskId, subtaskId, updates)` function
- [x] Add `deleteSubTask(parentTaskId, subtaskId)` function
- [x] Add `softDeleteTask(taskId)` function
- [x] Add `restoreTask(taskId)` function
- [x] Add `permanentDeleteTask(taskId)` function
- [x] Add `snoozeTask(taskId, untilDate)` function
- [x] Add `assignTask(taskId, userIds)` function
- [x] Add `addComment(taskId, comment)` function
- [x] Implement parent-child status sync logic (when all subtasks complete → parent done, when parent reopened → children can be uncompleted)
- [x] Implement soft-delete cleanup job (mark tasks older than 30 days for permanent deletion)

### 1.3 Enhanced Project Context
- [x] Add `getProjectsByMember(userId)` function
- [x] Add `inviteMember(projectId, email)` function
- [x] Add `removeMember(projectId, userId)` function
- [x] Add `updateProjectSettings(projectId, settings)` function
- [x] Add project-level permissions (owner, admin, member)

---

## Phase 2: Task Views Enhancement (Week 2-3)

### 2.1 List View Improvements
- [ ] Add collapsible subtasks display
- [ ] Add inline editing for task title/description
- [ ] Add quick actions (complete, delete, assign) on hover
- [ ] Add sorting options (by priority, due date, created date, status)
- [ ] Add filtering (by assignee, priority, due date, status)
- [ ] Add search within project tasks

### 2.2 Kanban View Improvements  
- [ ] Add drag-and-drop between columns with visual feedback
- [ ] Add task count badges per column
- [ ] Add "Add task" button in each column
- [ ] Add quick status change on task card click
- [ ] Add filter/search within kanban board

### 2.3 Calendar View Improvements
- [ ] Add month/week/day toggle views
- [ ] Add drag-and-drop to reschedule tasks
- [ ] Add task preview on date hover
- [ ] Add color-coding by project/priority
- [ ] Add today indicator and navigation

### 2.4 Dashboard/Analytics View
- [ ] Add workload distribution chart (tasks per assignee)
- [ ] Add completion trend chart (tasks completed over time)
- [ ] Add overdue tasks summary
- [ ] Add "My Tasks" section (assigned to current user)
- [ ] Add productivity streaks (consecutive days with completed tasks)
- [ ] Add project progress overview

---

## Phase 3: User & Collaboration (Week 3-4)

### 3.1 User Management
- [ ] Create User interface: `id`, `email`, `displayName`, `photoURL`, `role`, `createdAt`, `settings`
- [ ] Implement Firebase Authentication (Google Sign-In)
- [ ] Create user context with profile management
- [ ] Add user avatar and profile settings

### 3.2 Project Collaboration
- [ ] Add "Invite Member" modal with email input
- [ ] Add member list with role badges (owner, admin, member)
- [ ] Add remove member functionality
- [ ] Add project sharing via link
- [ ] Add role-based UI (admins see manage options)

### 3.3 Comments & Mentions
- [ ] Add comments section in task detail view
- [ ] Implement @mention parsing with autocomplete
- [ ] Add mention notifications
- [ ] Add comment editing/deletion

### 3.4 Activity Feed
- [ ] Add activity log per project
- [ ] Track: task created, updated, completed, assigned, commented
- [ ] Display recent activities on project page

---

## Phase 4: Notifications & Real-Time (Week 4)

### 4.1 Unified Inbox
- [ ] Create Inbox context and storage
- [ ] Add notification types: assignment, mention, completion, comment, project_invite
- [ ] Add mark as read/unread
- [ ] Add notification filtering (by type, project)
- [ ] Add clear all functionality

### 4.2 Real-Time Updates
- [ ] Implement Firestore listeners for tasks
- [ ] Implement Firestore listeners for projects
- [ ] Implement Firestore listeners for notifications
- [ ] Add optimistic UI updates
- [ ] Handle connection status indicator

---

## Phase 5: Theming & UI Polish (Week 5)

### 5.1 Theme System
- [ ] Add accent color options: Zen (blue), Twilight (purple), Crimson (red), Forest (green), Ocean (teal)
- [ ] Store theme preference in user settings
- [ ] Add theme switcher in header
- [ ] Persist theme choice across sessions

### 5.2 Responsive Design
- [ ] Optimize mobile layout (single column, collapsible sidebar)
- [ ] Add mobile "Quick Add" floating button
- [ ] Add touch-friendly interactions
- [ ] Optimize tablet layout (condensed sidebar)

### 5.3 UI Enhancements
- [ ] Add loading states and skeletons
- [ ] Add empty states with helpful CTAs
- [ ] Add toast notifications for actions
- [ ] Add confirmation dialogs for destructive actions
- [ ] Add keyboard shortcuts

---

## Phase 6: Billing & Subscriptions (Week 6)

### 6.1 Subscription Plans
- [ ] Define plans: Free, Pro ($9.99/mo), Enterprise (custom)
- [ ] Pro features: unlimited projects, calendar sync, advanced analytics, priority support
- [ ] Enterprise features: custom branding, SSO, dedicated support

### 6.2 Billing Integration
- [ ] Integrate Razorpay checkout
- [ ] Handle subscription webhooks
- [ ] Add billing history view
- [ ] Add plan upgrade/downgrade flow
- [ ] Add subscription cancellation

### 6.3 Feature Flagging
- [ ] Create feature flags system
- [ ] Implement plan-based access control
- [ ] Add admin override capability
- [ ] Add developer whitelist

---

## Phase 7: AI & Automation (Week 7)

### 7.1 AI Features
- [ ] Implement natural language task creation (e.g., "Finish report by Friday")
- [ ] Parse dates, priorities from text
- [ ] Add AI-powered priority scoring algorithm

### 7.2 Automation
- [ ] Create rules engine scaffold
- [ ] Add scheduled function for priority recalculation
- [ ] Implement webhook triggers structure

### 7.3 Integrations (Scaffold)
- [ ] Google Calendar sync for Pro users (API integration)
- [ ] Slack notification integration
- [ ] GitHub webhook handler
- [ ] Generic webhook API endpoints

---

## Phase 8: Admin & Security (Week 8)

### 8.1 Admin Panel
- [ ] Create admin dashboard
- [ ] User management (view, deactivate, role assignment)
- [ ] Audit log viewer
- [ ] System health metrics

### 8.2 Security
- [ ] Implement RBAC with Firebase custom claims
- [ ] Create Firestore security rules
- [ ] Add rate limiting
- [ ] Implement CSRF protection

### 8.3 Testing
- [ ] Set up Jest testing framework
- [ ] Write unit tests for contexts and utilities
- [ ] Write component tests
- [ ] Set up Firebase Emulator for integration tests

---

## Implementation Notes

### Current Stack
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Radix UI Components
- Firebase (Auth, Firestore) - *to be added*
- Razorpay - *to be added*

### Aesthetic Guidelines (Maintain These!)
- Clean, modern design with ample whitespace
- Consistent use of Card, Button, Badge components from Radix UI
- Smooth transitions and hover effects
- Proper dark/light mode support
- Mobile-first responsive approach
- Lucide React icons throughout

### File Structure to Maintain
```
/app
  /layout.tsx          # Root layout with providers
  /page.tsx            # Dashboard
  /projects/[id]/page.tsx  # Project detail
  
/components
  /layout/             # Header, Sidebar, MainLayout
  /tasks/              # TaskList, KanbanView, CalendarView, TaskModal
  /dashboard/          # KPICards, TaskChart, TeamActivity
  /modals/             # QuickAddProject, QuickAddTask
  
/lib
  /types.ts            # TypeScript interfaces
  /task-context.tsx    # Task state management
  /project-context.tsx # Project state management
  /utils.ts            # Utility functions
```

### Priority Order for Implementation
1. Core Data Models & Context (Phase 1)
2. Enhanced Views (Phase 2)  
3. User & Collaboration (Phase 3)
4. Notifications (Phase 4)
5. Theming (Phase 5)
6. Billing (Phase 6)
7. AI/Automation (Phase 7)
8. Admin & Security (Phase 8)
