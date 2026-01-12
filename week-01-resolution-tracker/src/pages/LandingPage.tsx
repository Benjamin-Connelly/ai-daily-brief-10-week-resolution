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
            <img 
              src="/assets/images/ai-resolution-main.jpeg" 
              alt="The Shrike's Larder - AI Resolution Project"
              style={{ 
                width: '100%',
                height: 'auto',
                display: 'block',
                objectFit: 'contain'
              }}
            />
            
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
