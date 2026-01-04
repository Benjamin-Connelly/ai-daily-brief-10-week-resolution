export type WeekStatus = 'not_started' | 'in_progress' | 'done';

export interface Artifact {
  label: string;
  url?: string;
  path?: string;
  notes?: string;
}

export interface WeekEntry {
  week: number;
  title: string;
  status: WeekStatus;
  notes: string;
  goals?: string;
  artifacts?: Artifact[];
  score?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResolutionState {
  version: 1;
  createdAt: string;
  updatedAt: string;
  weeks: WeekEntry[];
}

export const STORAGE_KEY = 'ai_resolution_state_v1';

export const createDefaultWeeks = (): WeekEntry[] => {
  const now = new Date().toISOString();
  return Array.from({ length: 10 }, (_, i) => ({
    week: i + 1,
    title: `Week ${i + 1}`,
    status: 'not_started' as WeekStatus,
    notes: '',
    createdAt: now,
    updatedAt: now,
  }));
};

export const createDefaultState = (): ResolutionState => {
  const now = new Date().toISOString();
  return {
    version: 1,
    createdAt: now,
    updatedAt: now,
    weeks: createDefaultWeeks(),
  };
};
