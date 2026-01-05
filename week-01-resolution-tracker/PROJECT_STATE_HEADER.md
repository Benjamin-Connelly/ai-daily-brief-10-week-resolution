# Project State Header - Context for AI Assistants

**Paste this at the top of prompts when working on this codebase.**

---

This is a React + TypeScript project management app (week-01-resolution-tracker) with a 3-scope navigation system. The app manages Projects (Resolutions), Sprints (Phases), and Tasks (Deliverables) using a Kanban-style interface.

**Mental Model**: Project → Sprint → Task (not Resolution → Program → Phase - those are internal type names)

**Navigation Scopes**:
- Portfolio (default): All projects grouped by status
- Project: Single project showing all sprints
- Sprint: Mixed work mode (focus strip + goals + notes + kanban board)

**Status Derivation Rules** (single source of truth):
- Task status: `completed` > `onHold` > `evidence` > `not_started`
- Sprint status: Derived from tasks (paused tasks count as progress)
- Project status: Derived from active sprint/program

**Persistence**: `ai_workspace_state_v3` in localStorage. Supports v1→v2→v3 migration chains.

**Important**: Program is a legacy internal container (not exposed in UI). Do not redesign the data model unless explicitly asked. Scope navigation is UI-only state (always starts on Portfolio).

**Source of Truth**: See `HIERARCHY_BREAKDOWN.md` for complete architecture documentation.

