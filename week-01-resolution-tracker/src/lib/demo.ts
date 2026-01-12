import { createDefaultResolution, createDefaultProgram } from "./model";
import type { WorkspaceState, Phase, Deliverable } from "./model";
import { WEEK_DEFINITIONS } from "./migrate";
import { derivePhaseStatus } from "./model";

/**
 * Creates realistic demo data showing the app in active use
 * Demonstrates various states: completed, in progress, not started
 */
export function createDemoWorkspaceState(): WorkspaceState {
  const now = new Date().toISOString();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

  // Create phases with realistic progress
  const phases: Phase[] = WEEK_DEFINITIONS.map((def, idx) => {
    const phaseId = `phase-${idx + 1}`;
    const deliverables: Deliverable[] = def.deliverables.map((d, dIdx) => {
      const deliverable: Deliverable = {
        ...d,
        completed: false,
        onHold: false,
        updatedAt: now,
        value: undefined,
      };

      // Week 1: Completed with evidence
      if (idx === 0) {
        if (dIdx === 0) {
          // PWA deliverable - completed with link
          deliverable.completed = true;
          deliverable.value = "https://benjaminconnelly.com/10-week-ai-resolution/week-01";
          deliverable.updatedAt = weekAgo;
        } else if (dIdx === 1) {
          // Deployment URL - completed
          deliverable.completed = true;
          deliverable.value = "https://benjaminconnelly.com/10-week-ai-resolution/week-01";
          deliverable.updatedAt = weekAgo;
        }
      }

      // Week 2: In progress with partial completion
      if (idx === 1) {
        if (dIdx === 0) {
          // Comparison Table - in progress with text
          deliverable.value = "Claude 3.5 Sonnet: Best for coding, 200k context\nGPT-4: Strong generalist, 128k context\nGemini Pro: Good for research, 1M context";
          deliverable.updatedAt = twoWeeksAgo;
        } else if (dIdx === 1) {
          // Scoring Rubric - completed
          deliverable.completed = true;
          deliverable.value = "Accuracy: 40%, Speed: 20%, Cost: 20%, Context: 20%";
          deliverable.updatedAt = twoWeeksAgo;
        }
        // Rules of Thumb - not started yet
      }

      // Week 3: In progress, one task on hold
      if (idx === 2) {
        if (dIdx === 0) {
          // Research Brief - in progress
          deliverable.value = "Researching transformer architectures and attention mechanisms...";
          deliverable.updatedAt = weekAgo;
        } else if (dIdx === 1) {
          // Fact Check List - on hold
          deliverable.onHold = true;
          deliverable.updatedAt = weekAgo;
        }
      }

      // Week 4: Not started (future week)
      // All deliverables remain default (not started)

      return deliverable;
    });

    const phase: Phase = {
      id: phaseId,
      index: idx + 1,
      title: def.title,
      status: "not_started",
      goals: def.goals,
      deliverables,
      notes: idx === 0 
        ? "Great progress! PWA is deployed and working well. Need to add demo mode for peer critique."
        : idx === 1
        ? "Working through model comparisons. Claude seems best for this use case."
        : idx === 2
        ? "Deep dive into research. Paused fact-checking to focus on brief first."
        : "",
      createdAt: idx < 3 ? twoWeeksAgo : now,
      updatedAt: idx < 3 ? weekAgo : now,
    };

    // Derive status from deliverables
    phase.status = derivePhaseStatus(phase);
    return phase;
  });

  const program = createDefaultProgram("AI Daily Brief – 10 Week Sprint", phases);
  program.status = "in_progress"; // Overall program is in progress
  program.startDate = twoWeeksAgo;

  const resolution = createDefaultResolution(
    "AI Daily Brief – 10 Week Sprint",
    "10-week AI learning and shipping challenge. Making great progress!",
    "Learning",
    "high",
    undefined,
    [program]
  );
  resolution.activeProgramId = program.id;
  resolution.createdAt = twoWeeksAgo;
  resolution.updatedAt = now;

  return {
    version: 3,
    createdAt: twoWeeksAgo,
    updatedAt: now,
    resolutions: [resolution],
    activeResolutionId: resolution.id,
  };
}

/**
 * Checks if demo mode is active via URL parameter
 */
export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("demo") === "true";
}

/**
 * Gets the demo mode URL (for sharing)
 */
export function getDemoUrl(): string {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);
  url.searchParams.set("demo", "true");
  return url.toString();
}

/**
 * Gets the normal mode URL (exit demo)
 */
export function getNormalUrl(): string {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);
  url.searchParams.delete("demo");
  return url.toString();
}
