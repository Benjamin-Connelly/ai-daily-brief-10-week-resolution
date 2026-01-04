import type { ResolutionState } from "./schema";
import { createDefaultWorkspaceState, createDefaultProgram, createDefaultPhase } from "./model";
import type { Phase, Deliverable } from "./model";

// Week definitions from the PDF-like structure (deliverables without completed/updatedAt - added during migration)
const WEEK_DEFINITIONS: Array<{
  title: string;
  goals: string[];
  deliverables: Array<Omit<Deliverable, "completed" | "updatedAt">>;
}> = [
  {
    title: "Week 1: Resolution Tracker",
    goals: ["Ship PWA", "Deploy"],
    deliverables: [
      { label: "PWA", kind: "link", required: true },
      { label: "Deployment URL", kind: "link", required: true },
    ],
  },
  {
    title: "Week 2: Model Topography",
    goals: ["Comparison", "Rubric", "Rules"],
    deliverables: [
      { label: "Comparison Table", kind: "text", required: true },
      { label: "Scoring Rubric", kind: "text", required: true },
      { label: "Rules of Thumb", kind: "text", required: true },
    ],
  },
  {
    title: "Week 3: Deep Research Sprint",
    goals: ["2-page brief", "Fact check list"],
    deliverables: [
      { label: "Research Brief", kind: "text", required: true },
      { label: "Fact Check List", kind: "text", required: true },
    ],
  },
  {
    title: "Week 4: Data Analysis Project",
    goals: ["Dataset", "Memo", "Actions"],
    deliverables: [
      { label: "Dataset", kind: "file", required: true },
      { label: "Analysis Memo", kind: "text", required: true },
      { label: "Action Items", kind: "text", required: true },
    ],
  },
  {
    title: "Week 5: Visual Reasoning Project",
    goals: ["Infographic/diagram"],
    deliverables: [
      { label: "Visual Output", kind: "file", required: true },
    ],
  },
  {
    title: "Week 6: Information Pipeline",
    goals: ["NotebookLM outputs", "Gamma outputs"],
    deliverables: [
      { label: "NotebookLM Output", kind: "text", required: true },
      { label: "Gamma Output", kind: "text", required: true },
    ],
  },
  {
    title: "Week 7: Automation #1",
    goals: ["Working automation", "Documentation"],
    deliverables: [
      { label: "Automation Script", kind: "file", required: true },
      { label: "Documentation", kind: "text", required: true },
    ],
  },
  {
    title: "Week 8: Automation #2",
    goals: ["Productivity automation", "Dashboard"],
    deliverables: [
      { label: "Automation", kind: "file", required: true },
      { label: "Dashboard", kind: "link", required: true },
    ],
  },
  {
    title: "Week 9: Context Engineering",
    goals: ["Context doc", "System"],
    deliverables: [
      { label: "Context Document", kind: "text", required: true },
      { label: "System Documentation", kind: "text", required: true },
    ],
  },
  {
    title: "Week 10: AI-Powered Build",
    goals: ["Deployed AI feature app"],
    deliverables: [
      { label: "Deployed App", kind: "link", required: true },
      { label: "Source Code", kind: "file", required: true },
    ],
  },
];

export function migrateV1ToV2(v1State: ResolutionState) {
  const v2State = createDefaultWorkspaceState();
  v2State.createdAt = v1State.createdAt;
  const now = new Date().toISOString();

  // Create phases from v1 weeks
  const phases: Phase[] = v1State.weeks.map((week, idx) => {
    const def = WEEK_DEFINITIONS[idx] || {
      title: week.title,
      goals: week.goals || [],
      deliverables: [],
    };

    // Map artifacts to deliverables with completed/updatedAt
    const deliverables: Deliverable[] = [
      ...(def.deliverables?.map(d => ({
        ...d,
        completed: false,
        updatedAt: now,
      })) || []),
      ...(week.artifacts?.map((art) => {
        if (art.url) {
          return {
            label: art.label,
            kind: "link" as const,
            value: art.url,
            completed: false,
            updatedAt: now,
          };
        } else if (art.path) {
          return {
            label: art.label,
            kind: "file" as const,
            value: art.path,
            completed: false,
            updatedAt: now,
          };
        } else {
          return {
            label: art.label,
            kind: "text" as const,
            value: art.notes,
            completed: false,
            updatedAt: now,
          };
        }
      }) || []),
    ];

    // Map status: "not_started" | "in_progress" | "done" -> same in v2
    const status = week.status as "not_started" | "in_progress" | "done";

    return createDefaultPhase(
      week.week,
      def.title,
      def.goals.length > 0 ? def.goals : week.goals || [],
      deliverables
    );
  });

  // Apply migrated data from v1 weeks
  phases.forEach((phase, idx) => {
    const week = v1State.weeks[idx];
    if (week) {
      phase.status = week.status as "not_started" | "in_progress" | "done";
      phase.notes = week.notes || "";
      phase.createdAt = week.createdAt;
      phase.updatedAt = week.updatedAt;
    }
  });

  // Create the program
  const program = createDefaultProgram("AI Daily Brief – 10 Week Sprint", phases);

  v2State.programs = [program];
  v2State.updatedAt = new Date().toISOString();

  return v2State;
}

