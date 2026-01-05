export type Status = "not_started" | "in_progress" | "done" | "paused";

export type DeliverableKind = "link" | "text" | "file";

export type Deliverable = {
  label: string;
  kind: DeliverableKind;
  value?: string;
  required?: boolean;
  completed: boolean;
  updatedAt: string; // ISO
};

export type Phase = {
  id: string;
  index: number;
  title: string;
  description?: string;
  status: Status;
  startDate?: string; // ISO
  endDate?: string; // ISO
  goals: string[];
  deliverables: Deliverable[];
  notes: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export type Program = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status: Status;
  startDate: string; // ISO
  targetDate?: string; // ISO
  phases: Phase[];
};

export type WorkspaceState = {
  version: 2;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  programs: Program[];
};

export function createDefaultWorkspaceState(): WorkspaceState {
  const now = new Date().toISOString();
  return {
    version: 2,
    createdAt: now,
    updatedAt: now,
    programs: [],
  };
}

export function createDefaultProgram(title: string, phases: Phase[]): Program {
  const now = new Date().toISOString();
  return {
    id: `program-${Date.now()}`,
    title,
    status: "not_started",
    startDate: now,
    phases,
  };
}

export function createDefaultPhase(
  index: number,
  title: string,
  goals: string[] = [],
  deliverables: Deliverable[] = []
): Phase {
  const now = new Date().toISOString();
  return {
    id: `phase-${index}-${Date.now()}`,
    index,
    title,
    status: "not_started",
    goals,
    deliverables,
    notes: "",
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Derives phase status from deliverables:
 * - "done" if all required deliverables are completed
 * - "in_progress" if any deliverable has completed=true or non-empty value
 * - "not_started" otherwise
 */
export function derivePhaseStatus(phase: Phase): Status {
  const requiredDeliverables = phase.deliverables.filter(d => d.required);
  const allRequiredCompleted = requiredDeliverables.length > 0 && 
    requiredDeliverables.every(d => d.completed);
  
  if (allRequiredCompleted) {
    return "done";
  }
  
  const hasProgress = phase.deliverables.some(d => 
    d.completed || (d.value && d.value.trim().length > 0)
  );
  
  if (hasProgress) {
    return "in_progress";
  }
  
  return "not_started";
}

