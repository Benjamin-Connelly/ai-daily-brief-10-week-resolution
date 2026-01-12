import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className="app-layout">
      {!isLandingPage && (
        <header className="sticky-header">
          <div className="header-container">
            <Link to="/" className="header-logo">
              <img src="/assets/images/shrike_main_logo.jpeg" alt="Home" />
            </Link>
            <nav className="header-nav">
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                Home
              </Link>
              <Link
                to="/weekly-projects"
                className={location.pathname.startsWith('/weekly-projects') ? 'active' : ''}
              >
                Weekly Projects
              </Link>
              <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>
                About
              </Link>
              <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>
                Contact
              </Link>
            </nav>
          </div>
        </header>
      )}

      <main className="main-content">{children}</main>

      {!isLandingPage && (
        <footer className="app-footer">
          <p>© 2026 Benjamin Connelly</p>
        </footer>
      )}
    </div>
  );
}
