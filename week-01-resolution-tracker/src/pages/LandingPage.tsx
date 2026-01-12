import { Link } from 'react-router-dom';

export default function LandingPage() {
  const weeks = Array.from({ length: 10 }, (_, i) => i + 1);
  const currentWeek = 1; // Week 1 is currently active

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 20px)',
      fontFamily: '"Courier New", monospace',
      color: '#000',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Main Container */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: '3rem',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Left Sidebar - Week Navigation */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          paddingTop: '2rem'
        }}>
          {weeks.map((week) => (
            <Link
              key={week}
              to={week === 1 ? '/week-01/' : `#week-${week.toString().padStart(2, '0')}`}
              style={{
                display: 'block',
                padding: '1rem 1.5rem',
                border: '3px solid #000',
                backgroundColor: week === currentWeek ? '#000' : 'transparent',
                color: week === currentWeek ? '#fff' : '#000',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                transition: 'all 0.2s',
                cursor: week === 1 ? 'pointer' : 'not-allowed',
                opacity: week === 1 ? 1 : 0.5,
                position: 'relative',
                boxShadow: week === currentWeek 
                  ? '4px 4px 0px 0px rgba(255,0,0,0.3)' 
                  : '4px 4px 0px 0px rgba(0,0,0,0.2)'
              }}
              onMouseEnter={(e) => {
                if (week === 1) {
                  e.currentTarget.style.transform = 'translateX(4px) translateY(4px)';
                  e.currentTarget.style.boxShadow = '0px 0px 0px 0px';
                }
              }}
              onMouseLeave={(e) => {
                if (week === 1) {
                  e.currentTarget.style.transform = 'translateX(0) translateY(0)';
                  e.currentTarget.style.boxShadow = week === currentWeek 
                    ? '4px 4px 0px 0px rgba(255,0,0,0.3)' 
                    : '4px 4px 0px 0px rgba(0,0,0,0.2)';
                }
              }}
            >
              WEEK {week.toString().padStart(2, '0')}
              {week === currentWeek && (
                <span style={{
                  marginLeft: '1rem',
                  fontSize: '0.8rem',
                  color: '#ff0000'
                }}>
                  (CURRENT)
                </span>
              )}
            </Link>
          ))}
          
          {/* Enter Button */}
          <Link
            to="/week-01/"
            style={{
              display: 'block',
              marginTop: '2rem',
              padding: '1.5rem 2rem',
              border: '4px solid #000',
              backgroundColor: '#ff0000',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              textTransform: 'uppercase',
              letterSpacing: '3px',
              textAlign: 'center',
              boxShadow: '6px 6px 0px 0px rgba(0,0,0,0.3)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(6px) translateY(6px)';
              e.currentTarget.style.boxShadow = '0px 0px 0px 0px';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0) translateY(0)';
              e.currentTarget.style.boxShadow = '6px 6px 0px 0px rgba(0,0,0,0.3)';
            }}
          >
            ENTER THE LARDER / WEEK 01
          </Link>
        </div>

        {/* Main Content Area */}
        <div style={{
          paddingTop: '2rem'
        }}>
          {/* Title */}
          <h1 style={{
            fontSize: '4rem',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '8px',
            margin: '0 0 1rem 0',
            lineHeight: '1.1',
            textShadow: '4px 4px 0px rgba(255,0,0,0.3)'
          }}>
            AI RESOLUTION<br />PROJECT
          </h1>

          {/* Author */}
          <div style={{
            textAlign: 'right',
            marginBottom: '3rem'
          }}>
            <p style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '4px',
              margin: 0
            }}>
              BENJAMIN CONNELLY
            </p>
          </div>

          {/* Shrike Illustration Placeholder */}
          <div style={{
            width: '100%',
            height: '400px',
            border: '4px solid #000',
            backgroundColor: '#f0f0f0',
            position: 'relative',
            marginBottom: '2rem',
            boxShadow: '8px 8px 0px 0px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: 'repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 10px, #e8e8e8 10px, #e8e8e8 20px)'
          }}>
            {/* Shrike Bird SVG Illustration */}
            <svg width="300" height="300" viewBox="0 0 300 300" style={{ opacity: 0.8 }}>
              {/* Bird Body */}
              <path
                d="M 150 80 Q 120 100 100 130 Q 90 150 100 170 Q 110 190 130 200 Q 150 210 170 200 Q 190 190 200 170 Q 210 150 200 130 Q 180 100 150 80 Z"
                fill="none"
                stroke="#000"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Bird Head */}
              <circle cx="120" cy="120" r="25" fill="none" stroke="#000" strokeWidth="4" />
              {/* Eye */}
              <circle cx="120" cy="120" r="8" fill="#000" />
              {/* Beak */}
              <path
                d="M 95 120 L 85 115 L 85 125 Z"
                fill="#000"
              />
              {/* Thorny Branch */}
              <path
                d="M 50 200 Q 100 180 150 200 Q 200 220 250 200"
                fill="none"
                stroke="#000"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Thorns */}
              {[60, 80, 100, 120, 140, 160, 180, 200, 220, 240].map((x, i) => (
                <line
                  key={i}
                  x1={x}
                  y1={200 - (i % 2 === 0 ? 10 : 5)}
                  x2={x + 5}
                  y2={200 - (i % 2 === 0 ? 15 : 10)}
                  stroke="#000"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ))}
              {/* Impaled Items (abstract) */}
              {[70, 130, 190].map((x, i) => (
                <g key={i}>
                  <circle cx={x} cy={195} r="8" fill="#ff0000" opacity="0.6" />
                  <line
                    x1={x}
                    y1={195}
                    x2={x}
                    y2={200}
                    stroke="#ff0000"
                    strokeWidth="2"
                  />
                </g>
              ))}
            </svg>
          </div>

          {/* Footer Text */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginTop: '3rem'
          }}>
            <p style={{
              fontSize: '0.9rem',
              margin: 0,
              opacity: 0.7
            }}>
              © 2024 BENJAMIN CONNELLY. BRUTALIST AI.
            </p>
            <p style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '3px',
              margin: 0
            }}>
              THE SHRIKE'S LARDER
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
