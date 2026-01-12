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

          {/* Shrike Illustration - The Shrike's Larder */}
          <div style={{
            width: '100%',
            minHeight: '500px',
            border: '4px solid #000',
            backgroundColor: '#f5f5f5',
            position: 'relative',
            marginBottom: '2rem',
            boxShadow: '8px 8px 0px 0px rgba(0,0,0,0.2)',
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 20px)',
            overflow: 'hidden'
          }}>
            <svg 
              width="100%" 
              height="100%" 
              viewBox="0 0 800 600" 
              style={{ 
                display: 'block',
                position: 'absolute',
                top: 0,
                left: 0
              }}
            >
              {/* Thorny Branches - Main branch system */}
              <g id="branches">
                {/* Main horizontal branch */}
                <path
                  d="M 100 350 Q 200 340 300 350 Q 400 360 500 350 Q 600 340 700 350"
                  fill="none"
                  stroke="#000"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Secondary branches */}
                <path
                  d="M 200 350 Q 180 320 160 300"
                  fill="none"
                  stroke="#000"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M 400 350 Q 420 320 440 300"
                  fill="none"
                  stroke="#000"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M 600 350 Q 620 330 640 310"
                  fill="none"
                  stroke="#000"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                
                {/* Thorns along branches */}
                {[
                  { x: 150, y: 345, angle: -45 },
                  { x: 180, y: 343, angle: 45 },
                  { x: 250, y: 348, angle: -30 },
                  { x: 320, y: 352, angle: 60 },
                  { x: 380, y: 348, angle: -50 },
                  { x: 450, y: 352, angle: 40 },
                  { x: 520, y: 347, angle: -35 },
                  { x: 580, y: 351, angle: 50 },
                  { x: 650, y: 346, angle: -40 },
                  { x: 680, y: 349, angle: 45 },
                  // Thorns on secondary branches
                  { x: 170, y: 315, angle: -60 },
                  { x: 190, y: 305, angle: 30 },
                  { x: 430, y: 315, angle: -30 },
                  { x: 450, y: 305, angle: 60 },
                  { x: 630, y: 325, angle: -45 },
                  { x: 650, y: 315, angle: 45 }
                ].map((thorn, i) => (
                  <line
                    key={i}
                    x1={thorn.x}
                    y1={thorn.y}
                    x2={thorn.x + Math.cos(thorn.angle * Math.PI / 180) * 12}
                    y2={thorn.y + Math.sin(thorn.angle * Math.PI / 180) * 12}
                    stroke="#000"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                ))}
              </g>

              {/* Impaled Mouse 1 - Top left area */}
              <g id="mouse1" transform="translate(180, 280)">
                {/* Mouse body */}
                <ellipse cx="0" cy="0" rx="18" ry="12" fill="#2a2a2a" stroke="#000" strokeWidth="2" />
                {/* Mouse head */}
                <ellipse cx="-8" cy="-5" rx="8" ry="6" fill="#2a2a2a" stroke="#000" strokeWidth="2" />
                {/* Ears */}
                <ellipse cx="-12" cy="-8" rx="3" ry="4" fill="#2a2a2a" stroke="#000" strokeWidth="1.5" />
                <ellipse cx="-4" cy="-8" rx="3" ry="4" fill="#2a2a2a" stroke="#000" strokeWidth="1.5" />
                {/* Tail */}
                <path
                  d="M 10 0 Q 18 -5 25 -8"
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Impaling thorn through body */}
                <line x1="0" y1="-15" x2="0" y2="15" stroke="#000" strokeWidth="2.5" />
                {/* Blood marks - red streaks */}
                <path
                  d="M -5 -8 L -8 -12 M 5 -6 L 8 -10 M -3 5 L -6 9 M 4 7 L 7 11"
                  stroke="#ff0000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.8"
                />
                <circle cx="-6" cy="-10" r="2" fill="#ff0000" opacity="0.7" />
                <circle cx="6" cy="8" r="1.5" fill="#ff0000" opacity="0.7" />
              </g>

              {/* Impaled Mouse 2 - Lower left area */}
              <g id="mouse2" transform="translate(420, 420)">
                {/* Mouse body */}
                <ellipse cx="0" cy="0" rx="16" ry="10" fill="#2a2a2a" stroke="#000" strokeWidth="2" />
                {/* Mouse head */}
                <ellipse cx="-7" cy="-4" rx="7" ry="5" fill="#2a2a2a" stroke="#000" strokeWidth="2" />
                {/* Ears */}
                <ellipse cx="-10" cy="-7" rx="2.5" ry="3.5" fill="#2a2a2a" stroke="#000" strokeWidth="1.5" />
                <ellipse cx="-4" cy="-7" rx="2.5" ry="3.5" fill="#2a2a2a" stroke="#000" strokeWidth="1.5" />
                {/* Tail */}
                <path
                  d="M 9 0 Q 16 -4 22 -7"
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Impaling thorn through body */}
                <line x1="0" y1="-12" x2="0" y2="12" stroke="#000" strokeWidth="2.5" />
                {/* Blood marks */}
                <path
                  d="M -4 -6 L -7 -9 M 4 -5 L 7 -8 M -2 4 L -5 7 M 3 5 L 6 8"
                  stroke="#ff0000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.8"
                />
                <circle cx="-5" cy="-8" r="2" fill="#ff0000" opacity="0.7" />
                <circle cx="5" cy="6" r="1.5" fill="#ff0000" opacity="0.7" />
                {/* Blood on branch below */}
                <circle cx="0" cy="15" r="3" fill="#ff0000" opacity="0.6" />
              </g>

              {/* Impaled Mouse 3 - Lower right area */}
              <g id="mouse3" transform="translate(620, 400)">
                {/* Mouse body */}
                <ellipse cx="0" cy="0" rx="17" ry="11" fill="#2a2a2a" stroke="#000" strokeWidth="2" />
                {/* Mouse head */}
                <ellipse cx="-8" cy="-5" rx="8" ry="6" fill="#2a2a2a" stroke="#000" strokeWidth="2" />
                {/* Ears */}
                <ellipse cx="-11" cy="-8" rx="3" ry="4" fill="#2a2a2a" stroke="#000" strokeWidth="1.5" />
                <ellipse cx="-5" cy="-8" rx="3" ry="4" fill="#2a2a2a" stroke="#000" strokeWidth="1.5" />
                {/* Tail */}
                <path
                  d="M 10 0 Q 17 -5 24 -8"
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Impaling thorn through body */}
                <line x1="0" y1="-14" x2="0" y2="14" stroke="#000" strokeWidth="2.5" />
                {/* Blood marks - more prominent */}
                <path
                  d="M -6 -8 L -10 -12 M 6 -7 L 10 -11 M -4 6 L -8 10 M 5 8 L 9 12"
                  stroke="#ff0000"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.9"
                />
                <circle cx="-7" cy="-11" r="2.5" fill="#ff0000" opacity="0.8" />
                <circle cx="7" cy="9" r="2" fill="#ff0000" opacity="0.8" />
                {/* Blood dripping down */}
                <path
                  d="M 0 14 L 0 20 L -2 22 L 2 22 Z"
                  fill="#ff0000"
                  opacity="0.7"
                />
              </g>

              {/* Shrike Bird - Upper right, perched on branch */}
              <g id="shrike" transform="translate(550, 200)">
                {/* Perch branch */}
                <path
                  d="M -20 40 Q 0 35 20 40"
                  fill="none"
                  stroke="#000"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {/* Thorns on perch */}
                <line x1="-10" y1="38" x2="-8" y2="30" stroke="#000" strokeWidth="2" strokeLinecap="round" />
                <line x1="10" y1="39" x2="12" y2="31" stroke="#000" strokeWidth="2" strokeLinecap="round" />
                
                {/* Bird body */}
                <ellipse cx="0" cy="20" rx="25" ry="18" fill="#1a1a1a" stroke="#000" strokeWidth="2.5" />
                {/* Bird chest/belly */}
                <ellipse cx="0" cy="22" rx="18" ry="14" fill="#2a2a2a" stroke="#000" strokeWidth="2" />
                
                {/* Bird head */}
                <circle cx="-5" cy="5" r="18" fill="#1a1a1a" stroke="#000" strokeWidth="2.5" />
                {/* Eye - large and dark */}
                <circle cx="-5" cy="5" r="8" fill="#000" />
                <circle cx="-3" cy="3" r="2" fill="#fff" />
                
                {/* Beak - sharp and hooked */}
                <path
                  d="M -18 8 L -25 5 L -25 11 Z"
                  fill="#000"
                />
                
                {/* Wing - detailed with feathers */}
                <path
                  d="M 15 15 Q 25 10 30 18 Q 28 25 20 22 Z"
                  fill="#1a1a1a"
                  stroke="#000"
                  strokeWidth="2"
                />
                {/* Wing feathers */}
                <path
                  d="M 20 18 L 25 15 M 22 20 L 27 17 M 18 22 L 23 19"
                  stroke="#000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                
                {/* Tail */}
                <path
                  d="M 20 30 Q 30 35 35 40 Q 32 45 25 38"
                  fill="#1a1a1a"
                  stroke="#000"
                  strokeWidth="2"
                />
                
                {/* Legs/feet gripping branch */}
                <path
                  d="M -8 38 L -8 45 L -12 48 M 8 38 L 8 45 L 12 48"
                  stroke="#000"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Claws */}
                <path
                  d="M -12 48 L -14 50 L -10 50 Z M 12 48 L 14 50 L 10 50 Z"
                  fill="#000"
                />
              </g>

              {/* Blood splatters on branches */}
              {[
                { x: 185, y: 285 },
                { x: 425, y: 425 },
                { x: 625, y: 405 },
                { x: 320, y: 355 },
                { x: 480, y: 352 }
              ].map((splat, i) => (
                <g key={i}>
                  <circle cx={splat.x} cy={splat.y} r="2" fill="#ff0000" opacity="0.6" />
                  <circle cx={splat.x + 3} cy={splat.y - 2} r="1.5" fill="#ff0000" opacity="0.5" />
                  <circle cx={splat.x - 2} cy={splat.y + 3} r="1" fill="#ff0000" opacity="0.5" />
                </g>
              ))}
            </svg>
            
            {/* Title overlay - "THE SHRIKE'S LARDER" */}
            <div style={{
              position: 'absolute',
              bottom: '2rem',
              right: '2rem',
              fontSize: '1.5rem',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '4px',
              color: '#000',
              textShadow: '2px 2px 0px rgba(255,0,0,0.3)'
            }}>
              THE SHRIKE'S LARDER
            </div>
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
