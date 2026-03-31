# TaskZen — Project Context

## Overview

**TaskZen** is a client-side collaborative task management web application built with Next.js 15 (App Router). All data is persisted in the browser's `localStorage` — there is no live backend or database. The project is scaffolded for future Firebase/Firestore integration (stubs exist in `lib/firestore-service.ts`) but this is not active.

The codebase follows a React Context + localStorage pattern for all state management. Every major domain (tasks, projects, users, notifications, billing, feature flags, admin) has its own context provider and is composed in the root layout.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.0 (App Router) |
| UI Library | React 19.2 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + OKLCH design tokens |
| Component Primitives | Radix UI (Dialog, Select, Tabs, Avatar, Badge, Progress, Calendar, etc.) |
| Icons | Lucide React |
| Charts | Recharts |
| Theme | next-themes (light / dark / system) |
| Animation | tw-animate-css |
| Analytics | Vercel Analytics |
| Persistence | localStorage only |
| Payment (mocked) | Razorpay (planned, not integrated) |
| Auth (mocked) | Custom UserContext (no real auth provider) |
| Real-time (stubbed) | Firestore listener stubs (never initialised) |

---

## Project Structure

```
/
├── app/
│   ├── layout.tsx              # Root layout — mounts all 9 providers
│   ├── globals.css             # OKLCH design tokens (light + dark)
│   ├── page.tsx                # Dashboard (KPIs, charts, My Tasks, Project Progress)
│   ├── admin/page.tsx          # Admin panel (users, audit logs, metrics)
│   ├── billing/page.tsx        # Billing page (current plan, plan comparison, history)
│   └── projects/[id]/page.tsx  # Project detail (List / Kanban / Calendar / Team / Activity tabs)
│
├── components/
│   ├── layout/
│   │   ├── main-layout.tsx     # Shell: header + sidebar + content + mobile FAB
│   │   ├── header.tsx          # Top bar: search, theme toggle, notifications, user menu
│   │   ├── sidebar.tsx         # Left nav: active (non-archived) projects, quick-add, footer links
│   │   └── notification-dropdown.tsx
│   ├── tasks/
│   │   ├── task-list.tsx       # Full list view: search, filter, sort, inline edit, subtask expand
│   │   ├── kanban-view.tsx     # Drag-and-drop kanban (HTML5) with status icons per column
│   │   ├── calendar-view.tsx   # Month calendar with task-count display and date task list
│   │   ├── task-modal.tsx      # Task creation dialog (all fields)
│   │   └── task-detail-modal.tsx # Full task view/edit + comments + subtask toggle
│   ├── dashboard/
│   │   ├── kpi-cards.tsx       # 6 KPI cards (My Tasks, Due Today, Overdue, Completed, Rate, Streak)
│   │   ├── task-chart.tsx      # Weekly bar chart + completion trend line chart (Recharts)
│   │   ├── workload-chart.tsx  # Tasks by project + tasks by priority (pie/donut Recharts)
│   │   ├── my-tasks.tsx        # Grouped task list: Overdue / Today / Upcoming / No Due Date
│   │   ├── project-progress.tsx # Per-project progress bars (excludes soft-deleted tasks)
│   │   └── team-activity.tsx   # Recent task activity feed with real user display names
│   ├── modals/
│   │   ├── quick-add-task-modal.tsx  # NLP-powered quick task creation with debounced analysis
│   │   ├── quick-add-project-modal.tsx
│   │   ├── invite-member-modal.tsx   # Email invite + shareable link (SSR-safe)
│   │   └── user-profile-modal.tsx    # Profile / Appearance (theme+accent) / Notifications tabs
│   ├── billing/
│   │   ├── pricing-plans.tsx   # 3-column plan cards with upgrade buttons
│   │   └── billing-history.tsx # Payment history + cancel/resume subscription
│   ├── ui/                     # Radix-based primitives (Button, Card, Badge, Input, etc.)
│   │   └── alert-dialog.tsx    # Custom AlertDialog + ConfirmDialog helper
│   └── theme-provider.tsx      # Unused wrapper (layout uses next-themes directly)
│
└── lib/
    ├── types.ts                # All TypeScript interfaces (see Data Models section)
    ├── utils.ts                # cn() helper (clsx + tailwind-merge)
    ├── task-context.tsx        # Task state + all task operations
    ├── project-context.tsx     # Project state + member management
    ├── user-context.tsx        # User state + profile/settings/logout
    ├── notification-context.tsx
    ├── billing-context.tsx     # Subscription plans + mocked upgrade/cancel/resume
    ├── feature-flags-context.tsx # Plan-based feature gating
    ├── admin-context.tsx       # Mock admin users, audit logs, metrics
    ├── accent-theme.tsx        # Injects OKLCH CSS vars for accent color + dark-mode observer
    ├── toast-context.tsx       # Custom toast system (success/error/info/warning)
    ├── connection-context.tsx  # Online/offline detection with status banner
    ├── ai-service.ts           # Regex NLP parser: priority, due date, labels from text
    ├── automation.ts           # Automation rule types + condition evaluator (no UI yet)
    ├── firestore-service.ts    # Dead stub — Firebase never initialised (config = null)
    ├── rbac.ts                 # Permission matrix for user / admin / superadmin roles
    └── webhooks.ts             # Webhook types + mock send function (no real HTTP)
```

---

## Provider Tree (root layout order)

```
ThemeProvider (next-themes)
  └── UserProvider
        └── BillingProvider
              └── FeatureFlagsProvider
                    └── AdminProvider
                          └── ConnectionProvider
                                └── ToastProvider
                                      └── AccentThemeProvider
                                            └── NotificationProvider
                                                  └── ProjectProvider
                                                        └── TaskProvider
                                                              └── {children}
                                                              └── <ConnectionStatus />
```

Consuming any context hook outside its provider throws with a descriptive error.

---

## Data Models

### Task
```ts
interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high" | "critical"
  dueDate?: string          // ISO date string "YYYY-MM-DD"
  assignees: string[]       // array of user IDs
  labels: string[]
  tags?: string[]
  projectId: string
  createdAt: Date
  updatedAt?: Date
  parentId?: string         // for future sub-task nesting
  subtasks: SubTask[]
  isSoftDeleted: boolean
  deletedAt?: Date
  snoozedUntil?: string     // ISO date string
  isCompleted: boolean
  completedAt?: Date
  completedBy?: string
  assignedBy?: string
  comments: Comment[]
  reminder?: string
}
```

### SubTask
```ts
interface SubTask {
  id: string
  title: string
  isCompleted: boolean
  completedAt?: Date
}
```

### Comment
```ts
interface Comment {
  id: string
  userId: string
  userName: string
  content: string
  createdAt: Date
  mentions: string[]
}
```

### Project
```ts
interface Project {
  id: string
  name: string
  color: string             // Tailwind class e.g. "bg-blue-500"
  description: string
  createdAt: Date
  updatedAt?: Date
  isArchived: boolean
  ownerId: string
  members: ProjectMember[]
  settings: ProjectSettings
}
```

### ProjectMember
```ts
interface ProjectMember {
  userId: string
  email: string
  name: string
  role: "owner" | "admin" | "member"
  joinedAt: Date
}
```

### ProjectSettings
```ts
interface ProjectSettings {
  defaultPriority: Task["priority"]
  defaultStatus: Task["status"]
  autoCompleteSubtasks: boolean   // auto-complete parent when all subtasks done
}
```

### User
```ts
interface User {
  id: string
  email: string
  displayName: string
  photoURL?: string
  role: "user" | "admin"
  createdAt: Date
  settings: UserSettings
}

interface UserSettings {
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
```

### Notification
```ts
interface Notification {
  id: string
  type: "task_assigned" | "task_completed" | "mention" | "comment" | "project_invite"
  title: string
  message: string
  projectId?: string
  taskId?: string
  isRead: boolean
  createdAt: Date
}
```

### Subscription / Billing
```ts
interface Subscription {
  id: string
  userId: string
  plan: "free" | "pro" | "enterprise"
  status: "active" | "cancelled" | "past_due" | "trialing"
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean    // true = scheduled to cancel; status stays "active" until period ends
}

interface BillingHistoryItem {
  id: string
  userId: string
  amount: number
  currency: string
  status: "succeeded" | "failed" | "pending"
  description: string
  createdAt: Date
  invoiceUrl?: string           // exists in type but not yet rendered in UI
}
```

### Subscription Plans (hard-coded)
| Plan | Price | Max Projects | Max Members | Calendar Sync | Advanced Analytics | Custom Branding | SSO | API Access |
|---|---|---|---|---|---|---|---|---|
| Free | $0 | 3 | 2 | No | No | No | No | No |
| Pro | $9.99/mo | Unlimited | Unlimited | Yes | Yes | No | No | Yes |
| Enterprise | Custom | Unlimited | Unlimited | Yes | Yes | Yes | Yes | Yes |

### ActivityLog
```ts
interface ActivityLog {
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
```

---

## Context APIs

### TaskContext (`lib/task-context.tsx`)
All task state lives here. Persisted to `localStorage` key `taskzen-tasks`.

| Function | Signature | Notes |
|---|---|---|
| `addTask` | `(task: Omit<Task, "id" \| "createdAt" \| ...>) => void` | Auto-sets id, createdAt, isSoftDeleted=false |
| `updateTask` | `(id, updates) => void` | Auto-sets updatedAt; auto-sets isCompleted/completedAt on status change |
| `deleteTask` | `(id) => void` | Hard/permanent delete |
| `softDeleteTask` | `(id) => void` | Sets isSoftDeleted=true, deletedAt=now |
| `restoreTask` | `(id) => void` | Clears isSoftDeleted and deletedAt |
| `permanentDeleteTask` | `(id) => void` | Hard delete (same as deleteTask, semantic distinction) |
| `snoozeTask` | `(id, until: string) => void` | Sets snoozedUntil ISO string |
| `getTasksByProject` | `(projectId) => Task[]` | Excludes soft-deleted |
| `getActiveTasks` | `() => Task[]` | Excludes soft-deleted and currently snoozed |
| `getTrashedTasks` | `() => Task[]` | Only soft-deleted tasks |
| `getSnoozedTasks` | `() => Task[]` | Only tasks with snoozedUntil > now |
| `getOverdueTasks` | `() => Task[]` | Past due, not done, not soft-deleted, **not snoozed** |
| `getTodaysTasks` | `() => Task[]` | Due today (midnight to midnight), not done |
| `getMyTasks` | `(userId) => Task[]` | Assigned to userId, not soft-deleted, not done |
| `createSubTask` | `(parentId, title) => void` | Appends to parent's subtasks[] |
| `updateSubTask` | `(parentId, subtaskId, updates) => void` | |
| `deleteSubTask` | `(parentId, subtaskId) => void` | |
| `toggleSubTask` | `(parentId, subtaskId) => void` | Auto-completes parent when all subtasks done |
| `addComment` | `(taskId, comment) => void` | Appends to task.comments[] |
| `deleteComment` | `(taskId, commentId) => void` | |
| `sortTasks` | `(tasks, sortBy, direction) => Task[]` | Sorts by priority/dueDate/createdAt/status/title |
| `filterTasks` | `(tasks, filter) => Task[]` | Filters by status/priority/assignee/dueDate range |
| `searchTasks` | `(tasks, query) => Task[]` | Case-insensitive match on title, description, labels, tags |

**Key behaviours:**
- When `updateTask` sets `status: "done"` → `isCompleted = true`, `completedAt = now`
- When `updateTask` sets status back from `"done"` → `isCompleted = false`, `completedAt = undefined`
- `toggleSubTask`: when all subtasks become completed → parent status set to `"done"`
- `getOverdueTasks` excludes snoozed tasks (snoozed tasks appear only in `getSnoozedTasks`)
- `filterTasks` for `"today"` uses strict midnight boundaries (no overlap with overdue)

---

### ProjectContext (`lib/project-context.tsx`)
Persisted to `localStorage` key `taskzen-projects`.

Default owner ID: `"current-user"` (hardcoded; matches the default User ID).

| Function | Notes |
|---|---|
| `addProject(data)` | Auto-sets id, createdAt, ownerId="current-user", default member, settings |
| `updateProject(id, updates)` | Auto-sets updatedAt |
| `deleteProject(id)` | Does NOT cascade-delete tasks — caller is responsible |
| `archiveProject(id)` | Sets isArchived=true |
| `restoreProject(id)` | Sets isArchived=false |
| `getActiveProjects()` | Returns non-archived projects |
| `inviteMember(projectId, email, name, role)` | Generates a random userId for the member |
| `removeMember(projectId, userId)` | Cannot remove the owner |
| `updateMemberRole(projectId, userId, role)` | |
| `isMember(projectId, userId)` | |
| `isOwner(projectId, userId)` | |

**Sidebar note:** Only non-archived projects are shown in the sidebar. Archived projects are accessible via project management but not listed in navigation.

---

### UserContext (`lib/user-context.tsx`)
Persisted to `localStorage` key `taskzen-user`.

- A default user is always created on first mount → `isAuthenticated` is always `true`
- Default user ID: `"current-user"`
- `login(email, name)` creates a new user object with a new ID (no deduplication)
- `logout()` clears localStorage — a new default user is created on the next mount
- `updateSettings(settings)` performs a shallow merge at the top level, deep merge for the `notifications` sub-object (caller must spread it explicitly)

---

### NotificationContext (`lib/notification-context.tsx`)
Persisted to `localStorage` key `taskzen-notifications`.

- Notifications are currently only generated in `task-detail-modal.tsx` for `@mention` events
- Assignment, completion, and project invite notifications are typed but never automatically triggered
- `filteredNotifications` is a memoized subset based on `filter` (by type and/or projectId)
- `unreadCount` is recomputed on every render (no useMemo — acceptable for current scale)

---

### BillingContext (`lib/billing-context.tsx`)
Persisted to `localStorage` keys `taskzen-subscription` and `taskzen-billing-history`.

- All operations are mocked with `setTimeout` delays (500ms–1s)
- `cancelSubscription()` sets `cancelAtPeriodEnd: true` while keeping `status: "active"` — subscription remains active until `currentPeriodEnd`
- `resumeSubscription()` sets `cancelAtPeriodEnd: false`, `status: "active"`
- `upgradePlan("free")` is not blocked by context (only by UI disabling the button)
- Enterprise plan price is `$0` in data — should display "Contact Sales" in future

---

### FeatureFlagsContext (`lib/feature-flags-context.tsx`)
Persisted to `localStorage` key `taskzen-feature-flags`.

Two access-check functions with different semantics:
- `isFeatureEnabled(key)` — checks only if the flag's `enabled` boolean is true. **Does not check the user's plan.** Used for admin-side flag toggling only.
- `canAccessFeature(key, userId)` — checks flag enabled + current plan + developer/override lists. **Use this for gating features in UI components.**

Feature keys: `advanced_analytics`, `calendar_sync`, `custom_branding`, `sso`, `api_access`, `priority_support`, `unlimited_projects`, `unlimited_team_members`

---

### AccentThemeProvider (`lib/accent-theme.tsx`)
Injects OKLCH CSS custom properties into `document.documentElement` to override the primary colour in the design system.

- Sets `--primary`, `--ring`, `--sidebar-primary`, `--sidebar-ring`
- Uses a `MutationObserver` on `document.documentElement` to re-apply when dark mode class changes
- Accent colour is stored in `UserSettings.accentColor` via `UserContext`
- Available colours and their OKLCH values:

| Name | Light mode | Dark mode |
|---|---|---|
| Zen Blue | `oklch(0.52 0.22 262)` | `oklch(0.7 0.18 262)` |
| Twilight Purple | `oklch(0.52 0.22 290)` | `oklch(0.7 0.18 290)` |
| Crimson Red | `oklch(0.52 0.22 15)` | `oklch(0.7 0.18 15)` |
| Forest Green | `oklch(0.52 0.18 145)` | `oklch(0.7 0.15 145)` |
| Ocean Teal | `oklch(0.52 0.18 190)` | `oklch(0.7 0.15 190)` |

---

### ToastContext (`lib/toast-context.tsx`)
In-memory only (no persistence). Auto-dismisses after 4000ms by default.

Types: `success`, `error`, `info`, `warning`

Positioned at `bottom-16 right-4` (offset from bottom to avoid overlap with `ConnectionStatus` banner at `bottom-4 right-4`).

```ts
const { addToast } = useToast()
addToast("success", "Task moved to trash")
addToast("error", "Something went wrong", 6000)  // custom duration in ms
```

---

### ConnectionContext (`lib/connection-context.tsx`)
Listens to browser `online`/`offline` events. Initial state reads `navigator.onLine`.

- `status: "connected"` → no UI shown
- `status: "disconnected"` → red banner at `bottom-4 right-4`
- `status: "connecting"` → blue spinner banner (only on first mount before online check resolves)

`<ConnectionStatus />` is rendered inside the root layout, outside all page content.

---

### AdminContext (`lib/admin-context.tsx`)
- `isAdmin` is determined by reading `localStorage.getItem("taskzen-user")` directly (not reactive to `UserContext` changes — stale until page refresh)
- `metrics` are entirely hardcoded mock values (not derived from real data)
- Admin panel at `/admin` is protected only by `isAdmin` check (easily bypassed via localStorage)

---

### RBAC (`lib/rbac.ts`)

Three roles: `user`, `admin`, `superadmin`

| Permission | user | admin | superadmin |
|---|---|---|---|
| view:dashboard | ✓ | ✓ | ✓ |
| create/edit/delete projects & tasks | ✓ | ✓ | ✓ |
| invite:team | ✓ | ✓ | ✓ |
| remove:team | — | ✓ | ✓ |
| manage:billing | — | ✓ | ✓ |
| view:admin | — | ✓ | ✓ |
| manage:users | — | ✓ | ✓ |
| manage:roles | — | — | ✓ |
| view:audit | — | ✓ | ✓ |
| manage:settings | — | ✓ | ✓ |
| use:ai | ✓ | ✓ | ✓ |
| manage:automations / webhooks | — | ✓ | ✓ |

Note: `User.role` is typed as `"user" | "admin"` — `superadmin` only exists in `UserRole` and in the RBAC matrix. No superadmin UI exists.

---

## Key Workflows

### Task Creation
1. User opens Quick Add Task modal (sidebar button, mobile FAB, or "New Task" in project page)
2. As the user types, NLP analysis runs (debounced 350ms) via `parseNaturalLanguage()`
3. Detected priority, due date, labels are shown as hint badges
4. On submit → `addTask()` in `TaskContext` → saved to `localStorage`
5. Task appears immediately in all views (list, kanban, calendar)

### Task Completion
- Single-clicking the circle status button in list/dashboard → cycles `todo → in-progress → done`
- In kanban, drag card to "Done" column OR click the status icon on the card
- When `status` → `"done"`: `isCompleted = true`, `completedAt = now`
- When all subtasks are toggled complete → parent task automatically set to `"done"`

### Task Detail
- **Single-click** on a task title in the list view → opens `TaskDetailModal` (200ms debounce)
- **Double-click** on a task title → activates inline title editing
- Detail modal has two tabs: Details (description, status, priority, due date, subtasks) and Comments (@mention support)

### Soft Delete / Trash Flow
- "Delete" button on a task → `ConfirmDialog` → `softDeleteTask()` → `isSoftDeleted = true`
- Soft-deleted tasks are hidden from all views (list, kanban, calendar, search, overdue, progress)
- Trash page (button in sidebar footer) is **not yet implemented** — the button is a dead UI element
- `permanentDeleteTask()` exists in context but has no UI entry point yet

### Project Deletion
- Done from sidebar (hover trash icon on project)
- Uses `window.confirm()` dialog (not the custom `ConfirmDialog`)
- Manually deletes all tasks in the project first (`getTasksByProject` → `deleteTask` loop), then `deleteProject`
- Does NOT cascade soft-delete — uses hard delete for tasks

### Subscription Cancellation
1. User clicks "Cancel Subscription" in Billing History
2. `cancelSubscription()` sets `cancelAtPeriodEnd: true`, keeps `status: "active"`
3. A yellow warning banner appears with the end date and "Resume Subscription" button
4. Cancel button becomes disabled while `cancelAtPeriodEnd` is true
5. `resumeSubscription()` sets `cancelAtPeriodEnd: false`, `status: "active"`

---

## Design System

All design tokens are defined as OKLCH CSS custom properties in `app/globals.css`.

```css
/* Light mode */
--primary: oklch(0.52 0.22 262)   /* Default blue */
--background: oklch(0.98 0.001 207.4)
--card: oklch(1 0 0)
--muted: oklch(0.93 0.02 207.4)
--border: oklch(0.92 0.02 207.4)
--radius: 0.625rem

/* Dark mode (.dark class) */
--primary: oklch(0.7 0.18 262)
--background: oklch(0.12 0.01 207.4)
--card: oklch(0.18 0.02 207.4)
```

Tailwind uses `@theme inline` to map these tokens to utility classes (`bg-primary`, `text-muted-foreground`, etc.).

**Accent colour overrides** are injected at runtime by `AccentThemeProvider` by rewriting `--primary`, `--ring`, `--sidebar-primary`, `--sidebar-ring` with OKLCH values for the selected colour.

**Font:** `Geist` / `Geist Mono` declared in `@theme inline` but not loaded via `next/font` — falls back to system sans-serif.

---

## localStorage Keys

| Key | Content |
|---|---|
| `taskzen-tasks` | `Task[]` serialised as JSON |
| `taskzen-projects` | `Project[]` serialised as JSON |
| `taskzen-user` | `User` serialised as JSON |
| `taskzen-notifications` | `Notification[]` serialised as JSON |
| `taskzen-subscription` | `Subscription` serialised as JSON |
| `taskzen-billing-history` | `BillingHistoryItem[]` serialised as JSON |
| `taskzen-feature-flags` | `FeatureFlag[]` serialised as JSON |

`Date` fields are serialised as ISO strings and re-hydrated to `Date` objects on each context load.

---

## NLP Task Parser (`lib/ai-service.ts`)

`parseNaturalLanguage(input: string): ParsedTask` — pure regex, no external API.

**Priority detection** (first match wins):
- `urgent | asap | right now | immediately | critical` → `critical`
- `high priority | important | soon | very important` → `high`
- `medium priority | normal | regular` → `medium`
- `low priority | whenever | not urgent | eventually` → `low`

**Date detection** (first match wins):
- `today` → today's date
- `tomorrow` → tomorrow's date
- `next week` → 7 days from now
- `next monday` → next Monday (if today is Monday, returns next Monday = +7 days)
- `next friday` → next Friday (same rule)
- `in N days` → now + N days
- `in N weeks` → now + N×7 days

**Label extraction:**
- `#word` patterns → label from hashtag
- `bug | feature | enhancement | task | todo | fix` keywords → label

**Title cleanup:** Removes detected hashtags and recognised keywords (today/tomorrow/next week/urgent/important/asap) from the title.

`calculatePriorityScore(task)` returns a 0–100 score based on: importance (30%), deadline proximity (40%), urgency labels (20%), description complexity keywords (10%).

---

## Known Limitations & Stubs

| Area | Status |
|---|---|
| Firebase / Firestore | Stub only — `config = null`, never initialised, no real-time sync |
| Authentication | Mocked — always logged in as "current-user", no OAuth/password |
| Automation rules | Types + evaluator defined; no UI, no context, no event triggers |
| Webhooks | Mock `sendWebhook` — no real HTTP request is made |
| Trash page | Button in sidebar is a dead UI element — no `/trash` route |
| Settings page | Button in sidebar is a dead UI element — no `/settings` route |
| Email invitations | Invite modal sends nothing — stores a random userId for the member |
| Invite link handling | Link is copied but the `?invite=` query param is never processed |
| Invoice download | `invoiceUrl` field exists in type but is not displayed in the billing UI |
| Tests | Zero test coverage — no Jest, Vitest, or Testing Library setup |
| Font loading | Geist font declared but not imported via `next/font` |
| Multi-tab sync | Changes in one tab are not reflected in other tabs |
| AdminContext reactivity | `isAdmin` reads localStorage directly, not reactive to UserContext |
| `superadmin` role | Exists in RBAC matrix but `User.role` only allows `"user" \| "admin"` |
| Notification auto-triggers | Assignment, completion, project invite notifications are never generated |
| `sonner` / `date-fns` | Listed as dependencies, never imported anywhere in the codebase |

---

## Pages

### `/` — Dashboard
Components: `KPICards`, `TaskChart`, `WorkloadChart`, `MyTasks`, `ProjectProgress`

`TeamActivity` is imported in the file but not rendered in the JSX.

KPIs displayed: My Tasks count, Due Today, Overdue, Completed this week, Completion Rate %, Productivity Streak (consecutive days with completed tasks).

### `/projects/[id]` — Project Detail
5-tab layout:
1. **List** — `TaskList` with search, filter (status/priority/due date), sort (5 fields + direction), inline title edit (double-click), detail modal (single-click), subtask expand, soft-delete
2. **Kanban** — `KanbanView` with HTML5 drag-and-drop, status icons (Circle/Loader/CheckCircle2), quick-add per column, search + priority filter
3. **Calendar** — `CalendarView` with month calendar, summary stat cards, task list for selected date, colour-by (priority or status)
4. **Team** — Members list with role badges, invite member button (owner/admin only), remove member
5. **Activity** — Derived activity feed from tasks + comments (sorted newest-first, limited to 20)

### `/billing` — Billing
Components: Current plan card, `PricingPlans` (3-column comparison), `BillingHistory` (payment list + cancel/resume controls)

### `/admin` — Admin Panel
Protected by `isAdmin` from `AdminContext`. Tabs: Overview (metrics), Users (table with role/status management + search), Audit Logs, Settings (placeholder only).

---

## File Naming Conventions

- React components: `PascalCase.tsx`
- Context files: `kebab-case-context.tsx`
- Utility/service files: `kebab-case.ts`
- All files under `components/ui/` are Radix-based primitive wrappers
- Page files follow Next.js App Router convention: `app/<route>/page.tsx`

---

## Important Patterns

**Adding a new context value:**
1. Add the type to the relevant `*ContextType` interface in `lib/types.ts`
2. Implement the function/state in the provider in `lib/*-context.tsx`
3. Add it to the `value` object of the `<Context.Provider>`
4. Consume via the corresponding `use*` hook

**Adding a new feature flag:**
1. Add to `DEFAULT_FLAGS` array in `lib/feature-flags-context.tsx`
2. Gate the feature in UI with `canAccessFeature(key, user.id)` (not `isFeatureEnabled`)

**Adding a toast:**
```ts
const { addToast } = useToast()
addToast("success", "Your message here")
addToast("error", "Something failed", 6000)
```

**Adding a confirm dialog:**
```tsx
<ConfirmDialog
  open={open}
  onOpenChange={setOpen}
  onConfirm={handleConfirm}
  title="Delete Item"
  description="This cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  variant="destructive"
/>
```
