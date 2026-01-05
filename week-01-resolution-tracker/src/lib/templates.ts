import { createDefaultProgram, createDefaultPhase, derivePhaseStatus, createDefaultResolution } from "./model";
import type { Program, Phase, Deliverable, Resolution, Priority } from "./model";
import { WEEK_DEFINITIONS } from "./migrate";

/**
 * Creates the AI Daily Brief 10-week program template
 */
export function createAIDailyBrief10WeekProgram(): Program {
  const now = new Date().toISOString();
  const phases: Phase[] = WEEK_DEFINITIONS.map((def, idx) => {
    const phase = createDefaultPhase(
      idx + 1,
      def.title,
      def.goals,
      def.deliverables.map(d => ({
        ...d,
        completed: false,
        onHold: false,
        updatedAt: now,
      }))
    );
    phase.status = derivePhaseStatus(phase);
    return phase;
  });

  return createDefaultProgram("AI Daily Brief – 10 Week Sprint", phases);
}

/**
 * Creates a blank program with a single empty phase
 */
export function createBlankProgram(title: string): Program {
  const now = new Date().toISOString();
  const phase = createDefaultPhase(1, "Phase 1", [], []);
  phase.status = derivePhaseStatus(phase);
  return createDefaultProgram(title, [phase]);
}

/**
 * Creates a blank resolution with no programs
 */
export function createBlankResolution(
  title: string,
  description?: string,
  category?: string,
  priority?: Priority,
  imageUrl?: string
): Resolution {
  return createDefaultResolution(title, description, category, priority, imageUrl, []);
}

// Export the template program for direct use
export const AI_DAILY_BRIEF_10_WEEK_PROGRAM = createAIDailyBrief10WeekProgram();

