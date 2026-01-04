export type WeekStatus = "not_started" | "in_progress" | "done";

export type WeekArtifact = {
  label: string;              // e.g. "Live App", "Deck", "Research Brief"
  url?: string;               // deployment link, doc link, etc.
  path?: string;              // repo path like "artifacts/week-03/brief.md"
  notes?: string;
};

export type WeekEntry = {
  week: number;               // 1..10
  title: string;
  status: WeekStatus;
  notes: string;

  // Future-proofing (safe to ignore in Week 1 UI)
  goals?: string[];           // "Ship PWA", "Deploy URL", etc.
  artifacts?: WeekArtifact[]; // links and outputs
  score?: number;             // 0..10 self rating
  createdAt: string;          // ISO
  updatedAt: string;          // ISO
};

export type ResolutionState = {
  version: 1;
  owner?: string;
  createdAt: string;
  updatedAt: string;
  weeks: WeekEntry[];
};

export const DEFAULT_STATE: ResolutionState = {
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  weeks: Array.from({ length: 10 }, (_, i) => {
    const w = i + 1;
    const now = new Date().toISOString();
    return {
      week: w,
      title: `Week ${w}`,
      status: "not_started",
      notes: "",
      goals: [],
      artifacts: [],
      score: 0,
      createdAt: now,
      updatedAt: now,
    };
  }),
};


