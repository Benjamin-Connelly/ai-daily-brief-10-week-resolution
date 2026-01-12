import { createDefaultWorkspaceState, createDefaultProgram, createDefaultPhase, derivePhaseStatus, createDefaultResolution } from "./model";
import type { WorkspaceState } from "./model";
import { migrateV1ToV2, migrateV2ToV3, WEEK_DEFINITIONS } from "./migrate";
import type { ResolutionState } from "./schema";
import { createAIDailyBrief10WeekProgram } from "./templates";
import { isDemoMode, createDemoWorkspaceState } from "./demo";

const KEY_V1 = "ai_resolution_state_v1";
const KEY_V2 = "ai_workspace_state_v2";
const KEY_V3 = "ai_workspace_state_v3";

export function loadWorkspaceState(): WorkspaceState {
  // In demo mode, return demo data instead of localStorage
  if (isDemoMode()) {
    return createDemoWorkspaceState();
  }

  try {
    // Try v3 first
    const v3Raw = localStorage.getItem(KEY_V3);
    if (v3Raw) {
      const parsed = JSON.parse(v3Raw) as WorkspaceState;
      if (parsed && parsed.version === 3 && Array.isArray(parsed.resolutions)) {
        // If resolutions array is empty, create default resolution
        if (parsed.resolutions.length === 0) {
          const defaultState = createDefaultAIResolution();
          saveWorkspaceState(defaultState);
          return defaultState;
        }
        return parsed;
      }
    }

    // Try v2 migration
    const v2Raw = localStorage.getItem(KEY_V2);
    if (v2Raw) {
      try {
        const parsed = JSON.parse(v2Raw) as any;
        if (parsed && parsed.version === 2 && Array.isArray(parsed.programs)) {
          const v3State = migrateV2ToV3(parsed);
          saveWorkspaceState(v3State);
          return v3State;
        }
      } catch {
        // Migration failed, fall through to v1
      }
    }

    // Try v1 migration
    const v1Raw = localStorage.getItem(KEY_V1);
    if (v1Raw) {
      try {
        const v1State = JSON.parse(v1Raw) as ResolutionState;
        if (v1State && v1State.version === 1 && Array.isArray(v1State.weeks)) {
          const v2State = migrateV1ToV2(v1State);
          const v3State = migrateV2ToV3(v2State);
          saveWorkspaceState(v3State);
          return v3State;
        }
      } catch {
        // Migration failed, fall through to default
      }
    }

    // Default empty state - create default AI 10-week resolution
    return createDefaultAIResolution();
  } catch {
    return createDefaultAIResolution();
  }
}

function createDefaultAIResolution(): WorkspaceState {
  const now = new Date().toISOString();
  const program = createAIDailyBrief10WeekProgram();
  const resolution = createDefaultResolution(
    "AI Daily Brief – 10 Week Sprint",
    "10-week AI learning and shipping challenge",
    undefined,
    [program]
  );
  resolution.activeProgramId = program.id;

  return {
    version: 3,
    createdAt: now,
    updatedAt: now,
    resolutions: [resolution],
    activeResolutionId: resolution.id,
  };
}

export function saveWorkspaceState(state: WorkspaceState) {
  // Don't save to localStorage in demo mode
  if (isDemoMode()) {
    return;
  }
  const next = { ...state, updatedAt: new Date().toISOString() };
  localStorage.setItem(KEY_V3, JSON.stringify(next));
  // Keep v1 and v2 as fallback (do not delete)
}

// Export/Import helpers
export function exportWorkspaceState(): string {
  const state = loadWorkspaceState();
  return JSON.stringify(state, null, 2);
}

export function importWorkspaceState(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as WorkspaceState;
    // Accept v3 or migrate v2/v1 on import
    if (parsed && parsed.version === 3 && Array.isArray(parsed.resolutions)) {
      saveWorkspaceState(parsed);
      return true;
    } else if (parsed && parsed.version === 2 && Array.isArray((parsed as any).programs)) {
      // Migrate v2 to v3 on import
      const v3State = migrateV2ToV3(parsed as any);
      saveWorkspaceState(v3State);
      return true;
    } else if (parsed && parsed.version === 1 && Array.isArray((parsed as any).weeks)) {
      // Migrate v1 -> v2 -> v3 on import
      const v2State = migrateV1ToV2(parsed as any);
      const v3State = migrateV2ToV3(v2State);
      saveWorkspaceState(v3State);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
