import { DEFAULT_STATE, ResolutionState } from "./schema";

const KEY = "ai_resolution_state_v1";

export function loadState(): ResolutionState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as ResolutionState;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.weeks)) return DEFAULT_STATE;
    return parsed;
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: ResolutionState) {
  const next = { ...state, updatedAt: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(next));
}

