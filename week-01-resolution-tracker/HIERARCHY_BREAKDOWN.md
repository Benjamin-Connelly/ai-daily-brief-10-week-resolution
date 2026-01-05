# Full Hierarchy Breakdown - 3-Scope Navigation System

> **⚠️ THIS DOCUMENT IS THE SOURCE OF TRUTH FOR THE PROJECT STRUCTURE AND DATA FLOW.**
> 
> When making changes to the codebase, refer to this document first. Update it when architecture changes are made.

## Overview
This application implements a 3-scope navigation system for managing projects, sprints, and tasks:
- **Portfolio** (default): All projects view
- **Project**: Single project with all sprints
- **Sprint**: Mixed work mode (goals + notes + focus + kanban)

---

## Data Model Hierarchy

```
WorkspaceState (v3)
├── version: 3
├── createdAt: ISO string
├── updatedAt: ISO string
├── resolutions: Resolution[]  (Projects)
│   └── activeResolutionId?: string
│
Resolution (Project)
├── id: string
├── title: string
├── description?: string
├── category?: string
├── priority?: "high" | "medium" | "low"
├── imageUrl?: string
├── createdAt: ISO string
├── updatedAt: ISO string
├── programs: Program[]  (Currently 1 program per project)
│   └── activeProgramId?: string
│
Program (Currently used as container for phases)
├── id: string
├── title: string
├── description?: string
├── category?: string
├── status: "not_started" | "in_progress" | "done" | "paused"
├── startDate: ISO string
├── targetDate?: ISO string
├── phases: Phase[]  (Sprints)
│
Phase (Sprint)
├── id: string
├── index: number
├── title: string
├── description?: string
├── status: "not_started" | "in_progress" | "done" | "paused"
├── startDate?: ISO string
├── endDate?: ISO string
├── goals: string[]
├── deliverables: Deliverable[]  (Tasks)
├── notes: string
├── createdAt: ISO string
└── updatedAt: ISO string
│
Deliverable (Task)
├── label: string
├── kind: "link" | "text" | "file"
├── value?: string  (evidence: URL or text)
├── required?: boolean
├── completed: boolean
├── onHold?: boolean  (task-level pause, not persisted in status enum)
└── updatedAt: ISO string
```

### Key Mappings
- **Project** = `Resolution`
- **Sprint** = `Phase`
- **Task** = `Deliverable`

---

## Component Hierarchy

```
App (Root)
├── State Management
│   ├── workspace: WorkspaceState | null
│   ├── scope: "portfolio" | "project" | "sprint"
│   ├── selectedProjectId: string | null
│   ├── selectedSprintId: string | null
│   └── selectedResolutionId: string | null (legacy, for sidebar)
│
├── Handlers
│   ├── updateWorkspace(ws) - saves to localStorage
│   ├── applyDerivedStatuses(ws) - auto-derives phase statuses
│   ├── handleCreateResolution(...) - creates new project
│   ├── handleStatusChange(id, status) - updates project status
│   ├── handleSelectProject(id) - navigates to project scope
│   ├── handleSelectSprint(projectId, sprintId) - navigates to sprint scope
│   ├── handleExport() - exports workspace JSON
│   └── handleImport() - imports workspace JSON
│
└── Render Logic (scope-based)
    ├── scope === "portfolio" → PortfolioView
    ├── scope === "project" → ProjectView
    └── scope === "sprint" → SprintView

PortfolioView (Default Home)
├── State
│   ├── showCreateModal: boolean
│   ├── explodeSprints: boolean
│   ├── filterCategory: string
│   ├── filterPriority: string
│   └── sortBy: "newest" | "oldest"
│
├── Summary Cards
│   ├── Total projects
│   ├── In Progress count
│   ├── Completed count
│   └── High Priority count
│
├── Filter/Sort Controls
│   ├── Category filter
│   ├── Priority filter
│   ├── Sort (newest/oldest)
│   └── "Explode sprints" toggle
│
├── Kanban Board (4 columns)
│   ├── Not Started
│   ├── In Progress
│   ├── On Hold
│   └── Completed
│
└── Project Cards
    ├── Icon (based on category)
    ├── Title
    ├── Description
    ├── Priority tag
    ├── Category tag
    ├── Exploded sprints (if toggle ON)
    │   └── Compact sprint rows (clickable → SprintView)
    └── "Open Project" button → ProjectView

ProjectView
├── Back Button → PortfolioView
├── Project Header
│   ├── Title
│   ├── Description
│   ├── Progress bar + %
│   └── Status badge
│
└── Sprint Cards Grid
    ├── Sprint title
    ├── Progress bar
    ├── Remaining required tasks count
    ├── Status badge
    └── "Work on this sprint" button → SprintView

SprintView (Mixed Work Mode)
├── Header
│   ├── "← Back to Project" button → ProjectView
│   ├── Sprint title
│   ├── Status badge + progress %
│   ├── "Project: {name}" subtitle
│   └── "+ New Task" button
│
├── Focus Strip (SprintFocus component)
│   ├── "Next Required Task" label
│   ├── Task name
│   ├── Remaining required count
│   └── "Jump to task" button (scrolls to task in kanban)
│
├── Goals + Notes Section
│   ├── Sprint goals (bullet list)
│   └── Notes textarea (editable, persists)
│
└── Kanban Board (Tasks for this sprint only)
    ├── Not Started column
    ├── In Progress column
    ├── On Hold column
    └── Completed column
    │
    └── Task Cards (Deliverables)
        ├── Checkbox (completion toggle)
        ├── Label
        ├── Required badge (if required)
        └── Evidence input
            ├── URL input (if kind="link")
            ├── Textarea (if kind="text")
            └── Placeholder (if kind="file")

CreateResolutionModal (Create Project)
├── Template Selection
│   ├── "Blank Program (1 sprint)" - creates 1 phase named "Sprint 1"
│   └── "AI Daily Brief – 10 Week Sprint" - uses template
│
├── Project Fields
│   ├── Project Name *
│   ├── Description
│   ├── Image URL
│   ├── Priority (high/medium/low)
│   ├── Category (with emojis)
│   └── Status
│
└── Submit → Creates project, stays on PortfolioView

CreateTaskModal (Create Task in Sprint)
├── Task Label *
├── Type (link/text/file)
├── Required checkbox
└── Submit → Creates deliverable in current sprint, appears in Not Started

ResolutionSidebar (Legacy - may not be used in new scope system)
└── Detailed resolution view (opened from portfolio cards)
```

---

## Navigation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Portfolio (Default)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Not Started  │  │ In Progress │  │  Completed   │      │
│  │   Projects    │  │   Projects   │  │   Projects   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  [Explode Sprints Toggle]                                    │
│  └─> Shows compact sprint rows under each project            │
│      └─> Click sprint row → SprintView                       │
│                                                               │
│  [Open Project Button] → ProjectView                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Project View                            │
│  [← Back to Projects] → PortfolioView                      │
│                                                               │
│  Project: {title}                                            │
│  Progress: {progress}% | Status: {status}                   │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Sprint 1 │  │ Sprint 2 │  │ Sprint 3 │                  │
│  │ Progress │  │ Progress │  │ Progress │                  │
│  │ [Work]   │  │ [Work]   │  │ [Work]   │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
│                                                               │
│  [Work on this sprint] → SprintView                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Sprint View                              │
│  [← Back to Project] → ProjectView                          │
│                                                               │
│  Sprint: {title} | Status: {status} | Progress: {progress}% │
│  Project: {projectName}                                      │
│                                                               │
│  ┌─────────────────────────────────────────┐                 │
│  │ Focus Strip                            │                 │
│  │ Next Required Task: {taskName}         │                 │
│  │ {count} required tasks remaining       │                 │
│  │ [Jump to task]                         │                 │
│  └─────────────────────────────────────────┘                 │
│                                                               │
│  Sprint Goals:                                               │
│  • Goal 1                                                    │
│  • Goal 2                                                    │
│                                                               │
│  Notes: [editable textarea]                                  │
│                                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │Not Started│ │In Progress│ │ On Hold  │ │Completed │      │
│  │  Tasks    │ │  Tasks    │ │  Tasks   │ │  Tasks   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                               │
│  [+ New Task] → CreateTaskModal                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Status Derivation Logic

### Deliverable Status (for Kanban columns)
```typescript
deriveDeliverableStatus(deliverable: Deliverable): Status
```
**Precedence order:**
1. `completed === true` → `"done"` (Completed column) - **highest priority, always wins**
2. `onHold === true` (and not completed) → `"paused"` (On Hold column)
3. `value` is non-empty (and not completed or on hold) → `"in_progress"` (In Progress column)
4. Otherwise → `"not_started"` (Not Started column)

**Key rule**: Completed tasks never appear in On Hold, even if `onHold=true`.

### Phase Status (Sprint)
```typescript
derivePhaseStatus(phase: Phase): Status
```
- All required deliverables completed → `"done"`
- Any deliverable has `completed=true`, non-empty `value`, OR `onHold=true` → `"in_progress`
  - **Note**: Paused tasks count as progress (sprint becomes in_progress)
- Otherwise → `"not_started"`
- Manual pause: Can be set via program status

### Program Status
```typescript
deriveProgramProgress(program: Program): { status: Status; progress: number }
```
- Uses `program.status` directly if set (allows manual overrides)
- Otherwise derives from phases:
  - Progress: `(donePhases / totalPhases) * 100`
  - Status: Aggregated from phase statuses

### Resolution Status (Project)
```typescript
deriveResolutionProgress(resolution: Resolution): { status: Status; progress: number }
```
- Uses active program (or first program if none active)
- Delegates to `deriveProgramProgress()`

---

## State Management

### Persistent State (localStorage)
- **Key**: `ai_workspace_state_v3`
- **Storage**: Full `WorkspaceState` object
- **Migration**: Supports v1 → v2 → v3 migration chains

### UI State (React state, not persisted)
- `scope`: Current navigation scope (`"portfolio" | "project" | "sprint"`)
- `selectedProjectId`: Currently selected project ID
- `selectedSprintId`: Currently selected sprint ID
- **Important**: Scope always resets to `"portfolio"` on app load (no auto-navigation)

### State Updates
- All updates go through `updateWorkspace(ws)` which:
  1. Creates new object references (forces React re-render)
  2. Saves to localStorage
  3. Updates React state

---

## Key Functions

### Model Functions (`src/lib/model.ts`)
- `createDefaultWorkspaceState()` - Creates empty v3 workspace
- `createDefaultResolution(...)` - Creates new project
- `createDefaultProgram(...)` - Creates new program
- `createDefaultPhase(...)` - Creates new sprint
- `derivePhaseStatus(phase)` - Derives sprint status from tasks
- `deriveProgramProgress(program)` - Derives program status/progress
- `deriveResolutionProgress(resolution)` - Derives project status/progress
- `deriveDeliverableStatus(deliverable)` - Derives task status for kanban

### Template Functions (`src/lib/templates.ts`)
- `createAIDailyBrief10WeekProgram()` - Creates 10-week AI template
- `createBlankProgram(title)` - Creates blank program with 1 phase
- `createBlankResolution(...)` - Creates blank project

### Storage Functions (`src/lib/storage.ts`)
- `loadWorkspaceState()` - Loads from localStorage, applies migrations
- `saveWorkspaceState(ws)` - Saves to localStorage
- `exportWorkspaceState()` - Returns JSON string
- `importWorkspaceState(json)` - Imports and migrates JSON

### Migration Functions (`src/lib/migrate.ts`)
- `migrateV1ToV2(v1State)` - Migrates week-based to program/phase
- `migrateV2ToV3(v2State)` - Wraps programs into resolution layer

---

## File Structure

```
week-01-resolution-tracker/
├── src/
│   ├── App.tsx                    # Main component, scope routing
│   ├── App.css                    # All styles
│   ├── index.tsx                   # Entry point
│   ├── index.css                  # Global styles
│   └── lib/
│       ├── model.ts               # Data types + derivation functions
│       ├── storage.ts             # localStorage + migration
│       ├── migrate.ts             # Migration logic
│       └── templates.ts           # Template factories
├── public/
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## Component Responsibilities

### App Component
- Manages workspace state
- Handles scope navigation
- Provides update handlers to child views
- Applies derived statuses on load

### PortfolioView
- Displays all projects in kanban layout
- Handles filtering/sorting
- Manages "explode sprints" toggle
- Creates new projects

### ProjectView
- Displays single project with all sprints
- Shows project progress and status
- Navigates to sprint view

### SprintView
- Primary work mode (mixed view)
- Displays focus strip, goals, notes, kanban
- Handles task creation and updates
- Manages deliverable completion and evidence

### CreateResolutionModal
- Creates new projects
- Supports template selection (Blank vs AI 10-Week)
- Collects project metadata

### CreateTaskModal
- Creates new tasks (deliverables) in sprint
- Sets task type (link/text/file) and required flag

---

## Data Flow

### Creating a Project
1. User clicks "+ New Project" in PortfolioView
2. Modal opens → user fills form, selects template
3. `handleCreateResolution()` called
4. Creates `Resolution` with `Program` (template or blank)
5. Adds to `workspace.resolutions`
6. Saves to localStorage
7. Stays on PortfolioView, new project appears

### Creating a Task
1. User clicks "+ New Task" in SprintView
2. Modal opens → user enters label, type, required
3. `handleCreateTask()` called
4. Creates `Deliverable` with `completed=false`
5. Adds to current `phase.deliverables`
6. Saves to localStorage
7. Task appears in "Not Started" column

### Completing a Task
1. User checks checkbox in task card
2. `handleDeliverableComplete()` called
3. Updates `deliverable.completed = true`
4. Re-derives `phase.status` (may become "done")
5. Saves to localStorage
6. Task moves to "Completed" column

### Status Changes
- All status changes create new object references
- React re-renders affected components
- Kanban columns update automatically
- Status derivation happens on save

---

## Key Design Decisions

1. **Scope is UI-only**: Never persisted, always starts on Portfolio
2. **Single Program per Project**: Each Resolution has 1 active Program (can be extended later)
3. **Status Derivation**: Phases auto-derive status from deliverables (can be manually overridden)
4. **Kanban Columns**: Based on deliverable status, not phase status
5. **Mixed Sprint View**: Combines focus, goals, notes, and kanban in one view
6. **Explode Sprints**: Optional toggle in PortfolioView to show sprint rows
7. **Templates**: Support for blank projects vs pre-filled AI 10-week template
8. **On Hold Semantics**: Tasks use `onHold` boolean (not status enum) - completed always wins over onHold
9. **UI-only State**: Evidence input expansion, scope navigation, and focus strip selection are UI-only (not persisted)

---

## Future Enhancements (Not Implemented)

- Drag-and-drop between kanban columns
- Multiple programs per project
- Sprint-level pause mechanism
- File upload for deliverables
- Comments/document counts on project cards
- Sidebar detail view integration with new scope system

---

## Testing Checklist

- [ ] Portfolio → Project → Sprint navigation
- [ ] Back buttons work correctly
- [ ] Exploded sprints click-through
- [ ] Create project (blank and template)
- [ ] Create task in sprint
- [ ] Complete task, add evidence
- [ ] Tasks move between kanban columns
- [ ] Status derivation works correctly
- [ ] Export/Import preserves all data
- [ ] Refresh always returns to Portfolio
- [ ] Progress bars update correctly
- [ ] Focus strip "Jump to task" works

---

## Notes for ChatGPT

When working with this codebase:
1. **Always start on Portfolio** - scope resets on load
2. **Status is derived** - don't manually set phase status unless needed
3. **New object references** - state updates must create new objects for React
4. **localStorage key**: `ai_workspace_state_v3`
5. **Migrations**: v1 → v2 → v3 chain is automatic
6. **Templates**: Use `createAIDailyBrief10WeekProgram()` for 10-week template
7. **Deliverable status**: Use `deriveDeliverableStatus()` for kanban columns (respects precedence: completed > onHold > evidence)
8. **Phase status**: Use `derivePhaseStatus()` for sprint status (paused tasks count as progress)
9. **On Hold**: Use `onHold` boolean on Deliverable, not a status enum
10. **Program is legacy**: Program is a container, not a primary UI concept (Project → Sprint → Task is the mental model)

