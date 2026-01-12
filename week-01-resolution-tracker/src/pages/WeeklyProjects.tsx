import { Link } from 'react-router-dom';
import { WEEK_DEFINITIONS } from '../lib/migrate';

export default function WeeklyProjects() {
  return (
    <div className="weekly-projects-page">
      <div className="page-header">
        <h1>Weekly Projects</h1>
        <p className="page-subtitle">
          A 10-week journey to master AI-powered development through hands-on projects
        </p>
      </div>

      <div className="weeks-grid">
        {WEEK_DEFINITIONS.map((week, idx) => {
          const weekNum = String(idx + 1).padStart(2, '0');
          const weekPath = `/weekly-projects/week-${weekNum}`;
          const isWeek01 = idx === 0;

          return (
            <div key={idx} className="week-card-overview">
              <div className="week-card-header">
                <span className="week-number">Week {weekNum}</span>
                <h2>{week.title.replace(`Week ${idx + 1}: `, '')}</h2>
              </div>

              <div className="week-card-body">
                <div className="goals-preview">
                  <h3>Goals</h3>
                  <ul>
                    {week.goals.map((goal, gIdx) => (
                      <li key={gIdx}>{goal}</li>
                    ))}
                  </ul>
                </div>

                <div className="deliverables-preview">
                  <h3>Deliverables</h3>
                  <ul>
                    {week.deliverables.map((d, dIdx) => (
                      <li key={dIdx}>
                        {d.label}
                        {d.required && <span className="required-badge">Required</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="week-card-footer">
                <Link to={weekPath} className="btn btn-secondary">
                  View Details
                </Link>
                {isWeek01 && (
                  <Link to="/week-01/" className="btn btn-primary">
                    Enter Tracker →
                  </Link>
                )}
                {!isWeek01 && (
                  <span className="coming-soon">Coming Soon</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
