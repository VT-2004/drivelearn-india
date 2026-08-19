import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const getDashboardRoute = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'school_owner') return '/school';
    if (user.role === 'instructor') return '/instructor';
    return '/learner';
  };

  return (
    <header className="pub-header" style={{ top: 0, position: 'sticky', zIndex: 999 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '1240px', margin: '0 auto' }}>
        <Link to="/" className="pub-logo" style={{ textDecoration: 'none' }}>
          <div className="pub-logo-badge">🚗</div>
          <div>Drive<span>Learn</span> India</div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="pub-nav desktop-only">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/learner" className={location.pathname.startsWith('/learner') ? 'active' : ''}>Find Driving School</Link>
          <Link to="/aptitude-test" className={location.pathname.startsWith('/aptitude-test') ? 'active' : ''}>Driving Quiz</Link>
          <Link to="/for-learners" className={location.pathname.startsWith('/for-learners') ? 'active' : ''}>Courses</Link>
          <Link to="/for-schools" className={location.pathname.startsWith('/for-schools') ? 'active' : ''}>For Schools</Link>
          <Link to="/contact" className={location.pathname.startsWith('/contact') ? 'active' : ''}>Help & Contact</Link>
        </nav>

        {/* Desktop Actions */}
        <div className="pub-actions desktop-only">
          <Link to="/learner" className="wallet-chip" title="₹15 Welcome bonus credited on signup!">
            <span>🎁</span> ₹15 Wallet
          </Link>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to={getDashboardRoute()} className="btn btn-navy btn-sm">
                Dashboard ({user.name?.split(' ')[0]})
              </Link>
              <button onClick={logout} className="btn btn-outline btn-sm">
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/for-schools" className="btn btn-outline btn-sm">
                List Your School
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="mobile-only" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/learner" className="wallet-chip" style={{ fontSize: '11.5px', padding: '4px 10px' }}>
            <span>🎁</span> ₹15
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            style={{
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#0F172A',
            }}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Menu Drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-nav-drawer"
          style={{
            width: '100%',
            background: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
            padding: '16px 20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          }}
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/" style={{ padding: '8px 0', fontSize: '15px', fontWeight: 600, color: location.pathname === '/' ? '#B3182F' : '#334155', textDecoration: 'none', borderBottom: '1px solid #F1F5F9' }}>
              🏠 Home
            </Link>
            <Link to="/learner" style={{ padding: '8px 0', fontSize: '15px', fontWeight: 600, color: location.pathname.startsWith('/learner') ? '#B3182F' : '#334155', textDecoration: 'none', borderBottom: '1px solid #F1F5F9' }}>
              🔍 Find Driving School
            </Link>
            <Link to="/aptitude-test" style={{ padding: '8px 0', fontSize: '15px', fontWeight: 600, color: location.pathname.startsWith('/aptitude-test') ? '#B3182F' : '#334155', textDecoration: 'none', borderBottom: '1px solid #F1F5F9' }}>
              ⏱️ Free Driving Quiz
            </Link>
            <Link to="/for-learners" style={{ padding: '8px 0', fontSize: '15px', fontWeight: 600, color: location.pathname.startsWith('/for-learners') ? '#B3182F' : '#334155', textDecoration: 'none', borderBottom: '1px solid #F1F5F9' }}>
              📚 Courses & Pricing
            </Link>
            <Link to="/for-schools" style={{ padding: '8px 0', fontSize: '15px', fontWeight: 600, color: location.pathname.startsWith('/for-schools') ? '#B3182F' : '#334155', textDecoration: 'none', borderBottom: '1px solid #F1F5F9' }}>
              🏫 For Schools (SaaS)
            </Link>
            <Link to="/contact" style={{ padding: '8px 0', fontSize: '15px', fontWeight: 600, color: location.pathname.startsWith('/contact') ? '#B3182F' : '#334155', textDecoration: 'none', borderBottom: '1px solid #F1F5F9' }}>
              💬 Help & Contact
            </Link>
          </nav>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px' }}>
            {user ? (
              <>
                <Link to={getDashboardRoute()} className="btn btn-navy" style={{ width: '100%', textAlign: 'center', textDecoration: 'none' }}>
                  Open Dashboard ({user.name?.split(' ')[0]})
                </Link>
                <button onClick={logout} className="btn btn-outline" style={{ width: '100%', textAlign: 'center' }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <Link to="/login" className="btn btn-outline" style={{ textAlign: 'center', textDecoration: 'none' }}>
                    Login
                  </Link>
                  <Link to="/signup" className="btn btn-primary" style={{ textAlign: 'center', textDecoration: 'none' }}>
                    Register
                  </Link>
                </div>
                <Link to="/for-schools" className="btn btn-outline" style={{ textAlign: 'center', textDecoration: 'none', fontSize: '13px' }}>
                  List Your School
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

