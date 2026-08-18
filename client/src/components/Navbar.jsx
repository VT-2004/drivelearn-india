import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  const getDashboardRoute = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'school_owner') return '/school';
    if (user.role === 'instructor') return '/instructor';
    return '/learner';
  };

  return (
    <header className="pub-header" style={{ top: 0 }}>
      <Link to="/" className="pub-logo">
        <div className="pub-logo-badge">🚗</div>
        <div>Drive<span>Learn</span> India</div>
      </Link>

      <nav className="pub-nav">
        <Link to="/" className="active">Home</Link>
        <Link to="/learner">Find Driving School</Link>
        <Link to="/aptitude-test">Driving Quiz</Link>
        <Link to="/for-learners">Courses</Link>
        <Link to="/for-schools">For Schools</Link>
        <Link to="/contact">Help & Contact</Link>
      </nav>

      <div className="pub-actions">
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
    </header>
  );
};

export default Navbar;
