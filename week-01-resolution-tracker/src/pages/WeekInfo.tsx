import { useParams, Link } from 'react-router-dom';
import { WEEK_DEFINITIONS } from '../lib/migrate';

export default function WeekInfo() {
  const { weekNum } = useParams<{ weekNum: string }>();
  const weekIndex = parseInt(weekNum || '01', 10) - 1;
  const week = WEEK_DEFINITIONS[weekIndex];

  if (!week) {
    return (
      <div className="week-info-page">
        <h1>Week Not Found</h1>
        <Link to="/weekly-projects">← Back to Weekly Projects</Link>
      </div>
    );
  }

  const weekNumPadded = String(weekIndex + 1).padStart(2, '0');
  const isWeek01 = weekIndex === 0;

  // Tech stack for Week 01 (auto-generated from codebase)
  const techStack = isWeek01
    ? [
        'React 18',
        'TypeScript',
        'Vite',
        'shadcn/ui (UI components)',
        'React Router',
        'LocalStorage (persistence)',
        'Cloudflare Pages (hosting)',
        'PWA (Progressive Web App)',
      ]
    : ['Coming Soon'];

  // Project hierarchy for Week 01
  const hierarchy = isWeek01
    ? [
        {
          name: 'Data Model',
          items: [
            'WorkspaceState (v3 schema)',
            'Resolution → Program → Phase → Deliverable',
            'Status tracking (not_started, in_progress, done, paused)',
          ],
        },
        {
          name: 'Components',
          items: [
            'App.tsx (main orchestration)',
            'WeekCard (phase/sprint display)',
            'ImportExport (data portability)',
            'ThemeToggle (dark mode)',
            'EditResolutionModal (project editing)',
          ],
        },
        {
          name: 'State Management',
          items: [
            'localStorage for persistence',
            'Demo mode (URL param ?demo=true)',
            'Migration logic (v1 → v2 → v3)',
          ],
        },
        {
          name: 'Routing',
          items: [
            '/ (Landing page)',
            '/weekly-projects (Overview)',
            '/weekly-projects/week-NN (Info pages)',
            '/week-01/ (Tracker app)',
          ],
        },
      ]
    : [];

  // Prompts used (from /prompts/ folder)
  const prompts = isWeek01
    ? [
        {
          name: 'week-01-ui.prompt.md',
          summary:
            'Build a simple React-based resolution tracker UI with weeks 1–10, status tracking, and notes.',
        },
        {
          name: 'week-01-pwa.prompt.md',
          summary:
            'Add minimal PWA support: manifest.json, service worker, installable, fullscreen mode.',
        },
      ]
    : [];

  // Useful info
  const usefulInfo = isWeek01
    ? [
        {
          title: 'Demo Mode',
          content:
            'Append ?demo=true to the URL to load sample data without affecting localStorage. Great for showcasing features.',
        },
        {
          title: 'Data Portability',
          content:
            'Export/import workspace state as JSON. All data stored in browser localStorage.',
        },
        {
          title: 'Deployment',
          content:
            'Deployed via Cloudflare Pages with GitHub Actions. Custom domain: ai-resolution.benjaminconnelly.com',
        },
        {
          title: 'Brutalist Design',
          content:
            'High contrast, bold typography, geometric shapes. Inspired by shrike bird imagery.',
        },
      ]
    : [];

  return (
    <div className="week-info-page">
      <div className="page-header">
        <Link to="/weekly-projects" className="back-link">
          ← Back to Weekly Projects
        </Link>
        <h1>
          Week {weekNumPadded}: {week.title.replace(`Week ${weekIndex + 1}: `, '')}
        </h1>
      </div>

      <section className="info-section">
        <h2>Goals</h2>
        <ul>
          {week.goals.map((goal, idx) => (
            <li key={idx}>{goal}</li>
          ))}
        </ul>
      </section>

      <section className="info-section">
        <h2>Deliverables</h2>
        <ul>
          {week.deliverables.map((d, idx) => (
            <li key={idx}>
              <strong>{d.label}</strong> ({d.kind})
              {d.required && <span className="required-badge">Required</span>}
            </li>
          ))}
        </ul>
      </section>

      {techStack.length > 0 && techStack[0] !== 'Coming Soon' && (
        <section className="info-section">
          <h2>Tech Stack</h2>
          <ul>
            {techStack.map((tech, idx) => (
              <li key={idx}>{tech}</li>
            ))}
          </ul>
        </section>
      )}

      {hierarchy.length > 0 && (
        <section className="info-section">
          <h2>Project Hierarchy</h2>
          {hierarchy.map((section, idx) => (
            <div key={idx} className="hierarchy-section">
              <h3>{section.name}</h3>
              <ul>
                {section.items.map((item, iIdx) => (
                  <li key={iIdx}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {prompts.length > 0 && (
        <section className="info-section">
          <h2>Prompts Used</h2>
          {prompts.map((prompt, idx) => (
            <div key={idx} className="prompt-card">
              <h3>{prompt.name}</h3>
              <p>{prompt.summary}</p>
            </div>
          ))}
        </section>
      )}

      {usefulInfo.length > 0 && (
        <section className="info-section">
          <h2>Useful Info</h2>
          {usefulInfo.map((info, idx) => (
            <div key={idx} className="info-card">
              <h3>{info.title}</h3>
              <p>{info.content}</p>
            </div>
          ))}
        </section>
      )}

      {isWeek01 && (
        <div className="cta-section">
          <Link to="/week-01/" className="btn btn-primary btn-large">
            Enter Week 01 Tracker →
          </Link>
        </div>
      )}

      {!isWeek01 && (
        <div className="cta-section">
          <p className="coming-soon-message">
            This week's project is coming soon. Check back later!
          </p>
        </div>
      )}
    </div>
  );
}
