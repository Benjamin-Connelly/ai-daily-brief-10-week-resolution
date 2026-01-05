export type Status = "not_started" | "in_progress" | "done" | "paused";

export type DeliverableKind = "link" | "text" | "file";

export type Deliverable = {
  label: string;
  kind: DeliverableKind;
  value?: string;
  required?: boolean;
  completed: boolean;
  onHold?: boolean;
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

export type Priority = "high" | "medium" | "low";

export type Resolution = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  priority?: Priority;
  imageUrl?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  programs: Program[];
  activeProgramId?: string;
};

export type WorkspaceState = {
  version: 3;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  resolutions: Resolution[];
  activeResolutionId?: string;
};

export function createDefaultWorkspaceState(): WorkspaceState {
  const now = new Date().toISOString();
  return {
    version: 3,
    createdAt: now,
    updatedAt: now,
    resolutions: [],
  };
}

export function createDefaultResolution(
  title: string,
  description?: string,
  category?: string,
  priority?: Priority,
  imageUrl?: string,
  programs: Program[] = []
): Resolution {
  const now = new Date().toISOString();
  return {
    id: `resolution-${Date.now()}`,
    title,
    description,
    category,
    priority: priority || "medium",
    imageUrl,
    createdAt: now,
    updatedAt: now,
    programs,
    activeProgramId: programs.length > 0 ? programs[0].id : undefined,
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
 * - "in_progress" if any deliverable has completed=true, non-empty value, or onHold=true
 *   (paused tasks count as progress made)
 * - "not_started" otherwise
 */
export function derivePhaseStatus(phase: Phase): Status {
  const requiredDeliverables = phase.deliverables.filter(d => d.required);
  const allRequiredCompleted = requiredDeliverables.length > 0 && 
    requiredDeliverables.every(d => d.completed);
  
  if (allRequiredCompleted) {
    return "done";
  }
  
  // Progress includes: completed, evidence, or paused tasks
  const hasProgress = phase.deliverables.some(d => 
    d.completed || (d.value && d.value.trim().length > 0) || d.onHold === true
  );
  
  if (hasProgress) {
    return "in_progress";
  }
  
  return "not_started";
}

/**
 * Derives program progress and status from its phases
 * program.status takes precedence - if it's set, use it directly
 * Otherwise derive from phases
 */
export function deriveProgramProgress(program: Program): { status: Status; progress: number } {
  // Calculate progress from phases
  let progress = 0
  if (program.phases.length > 0) {
    const donePhases = program.phases.filter(p => p.status === "done").length
    progress = (donePhases / program.phases.length) * 100
  }

  // Always use program.status if it's set (allows manual status overrides)
  // Only derive from phases if program.status is not meaningful
  // Since program.status is always set (has default), we use it directly
  const status = program.status || "not_started"

  return { status, progress: Math.round(progress) }
}

/**
 * Derives resolution status and progress from active program (or first program)
 */
export function deriveResolutionProgress(resolution: Resolution): { status: Status; progress: number } {
  if (resolution.programs.length === 0) {
    return { status: "not_started", progress: 0 };
  }

  const activeProgram = resolution.programs.find(p => p.id === resolution.activeProgramId) || resolution.programs[0];
  return deriveProgramProgress(activeProgram);
}

/**
 * Derives deliverable status for kanban columns with proper precedence:
 * 1. "done" if completed=true (highest priority - completed always wins)
 * 2. "paused" if onHold=true (but not completed)
 * 3. "in_progress" if evidence value is non-empty (but not completed or on hold)
 * 4. "not_started" otherwise
 */
export function deriveDeliverableStatus(deliverable: Deliverable): Status {
  // Completed always wins - never show completed tasks in On Hold
  if (deliverable.completed) {
    return "done";
  }
  
  // On Hold takes precedence over evidence
  if (deliverable.onHold === true) {
    return "paused";
  }
  
  // Evidence indicates in progress
  if (deliverable.value && deliverable.value.trim().length > 0) {
    return "in_progress";
  }
  
  return "not_started";
}

