import { createDefaultWorkspaceState, createDefaultProgram, createDefaultPhase, derivePhaseStatus } from "./model";
import type { WorkspaceState } from "./model";
import { migrateV1ToV2, WEEK_DEFINITIONS } from "./migrate";
import type { ResolutionState } from "./schema";

const KEY_V1 = "ai_resolution_state_v1";
const KEY_V2 = "ai_workspace_state_v2";

export function loadWorkspaceState(): WorkspaceState {
  try {
    // Try v2 first
    const v2Raw = localStorage.getItem(KEY_V2);
    if (v2Raw) {
      const parsed = JSON.parse(v2Raw) as WorkspaceState;
      if (parsed && parsed.version === 2 && Array.isArray(parsed.programs)) {
        // If programs array is empty, create default program
        if (parsed.programs.length === 0) {
          const defaultState = createDefaultAIProgram();
          saveWorkspaceState(defaultState);
          return defaultState;
        }
        return parsed;
      }
    }

    // Try v1 migration
    const v1Raw = localStorage.getItem(KEY_V1);
    if (v1Raw) {
      try {
        const v1State = JSON.parse(v1Raw) as ResolutionState;
        if (v1State && v1State.version === 1 && Array.isArray(v1State.weeks)) {
          const v2State = migrateV1ToV2(v1State);
          saveWorkspaceState(v2State);
          return v2State;
        }
      } catch {
        // Migration failed, fall through to default
      }
    }

    // Default empty state - create default AI 10-week program
    return createDefaultAIProgram();
  } catch {
    return createDefaultAIProgram();
  }
}

function createDefaultAIProgram(): WorkspaceState {
  const now = new Date().toISOString();
  const phases = WEEK_DEFINITIONS.map((def, idx) => {
    const phase = createDefaultPhase(
      idx + 1,
      def.title,
      def.goals,
      def.deliverables.map(d => ({
        ...d,
        completed: false,
        updatedAt: now,
      }))
    );
    phase.status = derivePhaseStatus(phase);
    return phase;
  });

  const program = createDefaultProgram("AI Daily Brief – 10 Week Sprint", phases);
  return {
    version: 2,
    createdAt: now,
    updatedAt: now,
    programs: [program],
  };
}

export function saveWorkspaceState(state: WorkspaceState) {
  const next = { ...state, updatedAt: new Date().toISOString() };
  localStorage.setItem(KEY_V2, JSON.stringify(next));
  // Keep v1 as fallback (do not delete)
}

// Export/Import helpers
export function exportWorkspaceState(): string {
  const state = loadWorkspaceState();
  return JSON.stringify(state, null, 2);
}

export function importWorkspaceState(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as WorkspaceState;
    if (parsed && parsed.version === 2 && Array.isArray(parsed.programs)) {
      saveWorkspaceState(parsed);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
