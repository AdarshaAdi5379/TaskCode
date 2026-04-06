# TaskCode — Settings Feature TODO (Detailed)

This file tracks ONLY the Settings feature (sidebar + schema + loader + all sections), in the exact implementation order you specified.

## Current decisions (important)
- Single workspace for now (no workspace entity). Workspace settings apply to `workspaceId = "default"` and are stored locally.
- Settings are stored locally (localStorage) with safe default fallbacks and deep-merge updates to prevent accidental overwrites.
- User settings keys:
  - `taskzen-user-settings:<userId>` (per-user settings payload)
  - `taskzen-workspace-settings:default` (single workspace settings payload)

## Recommended implementation order (follow this)
1. Settings layout (sidebar + routing)
2. Profile settings
3. Appearance settings
4. Notification settings
5. Workspace settings
6. Project settings
7. Security settings
8. Data settings
9. Productivity settings
10. Integration settings
11. Admin settings
12. UX polish
13. Performance optimization
14. Testing

---

# Phase 1 — Settings Foundation ✅ COMPLETED

## 1) Create Settings navigation structure ✅
- [x] Create main Settings page (`/settings`) with redirect to first section.
  - Details: `/settings` redirects to `/settings/profile`.
- [x] Add left sidebar navigation (desktop) with the required sections.
  - Details: Profile, Appearance, Notifications, Workspace, Projects, Security, Data, Productivity, Integrations, Admin (admin only).
  - Details: Admin is hidden unless the user is admin.
- [x] Add right-side content panel.
  - Details: fixed shell with content area.
- [x] Add routing for each settings category.
  - Details: `/settings/<section>` pages exist for all sections.
- [x] Highlight active settings tab.
  - Details: active state based on current pathname.
- [x] Make settings responsive for mobile.
  - Details: sidebar turns into a section Select dropdown on mobile.
- [x] Add loading skeleton while settings load/hydrate.
  - Details: skeleton appears in the content panel while user state is loading.
- [x] Add main app sidebar entry to open Settings.

## 2) Define settings data structure ✅
- [x] Decide where settings live (scoped storage model).
  - User-level settings:
    - Appearance: theme, accent color, font size, density
    - Notifications: toggles + reminder/digest times + quiet hours
    - Defaults: default project + default view
  - Workspace-level settings:
    - Single workspace `"default"` for now
    - Workspace info + permissions stored locally (future: real workspace table)
  - Project-level settings:
    - Already exists via `Project.settings` (default priority/status + auto-complete subtasks)
- [x] Define default values.
  - Details: centralized defaults live in `lib/settings/defaults.ts`.
- [x] Add fallback behavior if settings are missing.
  - Details: any partial/missing stored settings are deep-merged into defaults.

## 3) Implement settings loader system ✅
- [x] Load user settings on login/hydration.
  - Details: `UserProvider` merges persisted settings into defaults.
- [x] Cache settings locally.
  - Details: user settings stored under `taskzen-user-settings:<userId>`.
- [x] Update UI when settings change.
  - Details: context updates trigger re-render; accent + theme apply immediately.
- [x] Prevent overwriting existing settings accidentally.
  - Details: deep-merge is used for updates (nested patches do not wipe sibling keys).

---

# Phase 2 — Profile Settings ✅ COMPLETED

## Profile information ✅
- [x] Show user name.
- [x] Show email.
- [x] Show profile picture.
  - Details: supports a URL and local upload preview (stored as Data URL in local mode).
- [x] Allow updating name.
- [x] Allow updating profile picture.
- [x] Allow updating email.
  - Details:
    - Local mode: updates immediately.
    - Supabase mode: uses `supabase.auth.updateUser({ email })` (may require email confirmation).
- [x] Validate inputs before saving.
  - Details:
    - Name required (non-empty).
    - Email required + basic email format validation.
- [x] UX feedback for save.
  - Details: toast success/error messages.

## Account controls ✅
- [x] Add password change feature.
  - Details:
    - Supabase mode: uses `supabase.auth.updateUser({ password })`.
    - Local mode: no-op (still available in UI but will succeed trivially).
- [x] Add logout from all devices.
  - Details:
    - Supabase mode: attempts `signOut({ scope: "global" })`, falls back to normal sign-out.
    - Local mode: clears local user.
- [x] Add account deletion option.
  - Details:
    - Local mode: clears local user + stored settings.
    - Supabase mode: blocked with a clear error message (requires server-side admin flow).
- [x] Add confirmation dialogs.

## Default preferences ✅
- [x] Select default workspace.
  - Details: single workspace only (read-only “My Workspace” field).
- [x] Select default project.
  - Details: uses current project list, stores in `user.settings.defaults.projectId`.
- [x] Select default view (List/Kanban/Calendar).
  - Details: stores in `user.settings.defaults.view`.

---

# Phase 3 — Appearance Settings ✅ COMPLETED

## Theme controls ✅
- [x] Add Light mode.
- [x] Add Dark mode.
- [x] Add System mode.

## UI customization ✅
- [x] Add accent color selector (same style as old modal).
- [x] Add font size options (Small/Medium/Large).
  - Details: applied globally via `html[data-font-size]` so the entire UI scales.

## Layout options ✅
- [x] Density mode (Compact/Comfortable).
  - Details: stored + applied (currently minimal visible cue; full spacing compaction can be expanded later).
- [x] Sidebar collapse behavior (Remember/Always collapsed/Always expanded).
  - Details: stored (wiring behavior into main sidebar comes later when we add actual collapse UI).
- [x] Sidebar default state (Collapsed/Expanded).
  - Details: stored.

## Persistence ✅
- [x] Save theme preference.
- [x] Apply theme immediately.
- [x] Restore theme on reload.

## Replace old appearance UI ✅
- [x] Remove Appearance tab from the old profile modal and replace with a link/button to `/settings/appearance`.

---

# Phase 4 — Notification Settings ✅ COMPLETED

## In-app notifications ✅
- [x] Toggles UI for:
  - [x] Task assigned to you
  - [x] Mentioned in comment
  - [x] Task completed
  - [x] Project updates
  - [x] Due date reminders
- [x] Ensure disabled notifications are not sent (in-app).
  - Details: `NotificationProvider.addNotification()` checks user prefs and drops notifications when disabled.

## Email notifications (schema + UI only for now) ✅
- [x] Master email switch.
- [x] Toggles UI for:
  - [x] Mentions
  - [x] Assignments
  - [x] Invites
  - [x] Weekly summary
- [ ] Email delivery implementation.
  - Details: later when backend/email service exists.

## Reminder preferences ✅
- [x] Default reminder time.
- [x] Daily digest time.
- [x] Quiet hours start/end.

## Behavior ✅
- [x] Save notification preferences.
- [x] Apply settings immediately.

## Replace old notifications UI ✅
- [x] Keep simple toggles in the profile modal, add “Advanced settings” link to `/settings/notifications`.

---

# Phase 5 — Workspace Settings (single workspace `"default"`) ⏳ NEXT

## Workspace info
- [ ] Workspace name
- [ ] Workspace logo
- [ ] Description
- [ ] Timezone
- [ ] Working days
- [ ] Persistence behavior
  - Details: store under `taskzen-workspace-settings:default`.

## Members management (future; requires a real workspace/team model)
- [ ] Member list view
- [ ] Invite member button
- [ ] Remove member button
- [ ] Role assignment (Owner/Editor/Viewer)

## Permissions (future; requires real roles/enforcement)
- [ ] Who can create projects
- [ ] Who can invite users
- [ ] Who can delete projects

---

# Phase 6 — Project Settings ⏳

## Project info
- [ ] Project name
- [ ] Description
- [ ] Project color
- [ ] Project icon

## Workflow settings
- [ ] Customize task statuses (Todo/In Progress/Review/Done)
  - Details: will require expanding Task.status beyond the current fixed union OR adding per-project workflow mapping.

## Labels management
- [ ] Create label
- [ ] Delete label
- [ ] Assign colors to labels

---

# Phase 7 — Security Settings ⏳

## Login security
- [ ] Show active sessions
- [ ] Logout from other devices
- [ ] Password change

## Privacy controls
- [ ] Data export option
- [ ] Account deletion option
- [ ] Session timeout control

## Device management
- [ ] Device list
- [ ] Revoke device access

---

# Phase 8 — Data Management Settings ⏳

## Export tools
- [ ] Export tasks to CSV
- [ ] Export tasks to JSON
- [ ] Export activity logs

## Import tools
- [ ] Import tasks from CSV
- [ ] Import tasks from Excel

## Trash settings
- [ ] Trash retention period (7 / 30 / 60 days)

---

# Phase 9 — Productivity Settings ⏳

## Default task behavior
- [ ] Auto-assign creator
- [ ] Default priority
- [ ] Default due date offset

## Task settings
- [ ] Enable sub-tasks toggle
- [ ] Enable recurring tasks toggle
- [ ] Enable reminders toggle

## Calendar settings
- [ ] First day of week
- [ ] Default calendar view

---

# Phase 10 — Integration Settings ⏳

## External connections (placeholders)
- [ ] Google Calendar (Connect/Disconnect/Sync status)
- [ ] Slack (Connect/Disconnect/Sync status)
- [ ] GitHub (Connect/Disconnect/Sync status)
- [ ] Jira (Connect/Disconnect/Sync status)

---

# Phase 11 — Admin Settings (Admin only) ⏳

## User management
- [ ] View all users
- [ ] Promote user
- [ ] Demote user
- [ ] Suspend user

## System logs
- [ ] Activity logs viewer
- [ ] User login logs

## Feature controls
- [ ] Enable/disable features globally

---

# Phase 12 — Settings UX improvements ⏳

## Feedback
- [x] Save success message (toast) — Profile/Appearance/Notifications
- [x] Error message display (inline + toast) — Profile
- [ ] Inline validation feedback for all sections

## Safety
- [x] Confirmation dialogs — destructive Profile actions
- [ ] Undo support (optional)

## Navigation
- [ ] Search inside settings
- [ ] Breadcrumb navigation

---

# Phase 13 — Settings performance optimization ⏳
- [ ] Lazy load settings sections (route-level code splitting + per-route `loading.tsx`)
- [ ] Cache settings locally (already done; extend to more scopes)
- [ ] Avoid re-fetching unchanged settings
- [ ] Batch updates where possible
- [ ] Debounce frequent updates (e.g., text inputs)

---

# Phase 14 — Settings testing ⏳
- [ ] Settings save correctly
- [ ] Settings reload correctly
- [ ] Default values apply
- [ ] Permissions enforced
- [ ] Admin restrictions work
- [ ] UI updates immediately
1. Core Data Models & Context (Phase 1)
2. Enhanced Views (Phase 2)  
3. User & Collaboration (Phase 3)
4. Notifications (Phase 4)
5. Theming (Phase 5)
6. Billing (Phase 6)
7. AI/Automation (Phase 7)
8. Admin & Security (Phase 8)
