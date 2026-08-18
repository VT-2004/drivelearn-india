import { useLocation, Link } from 'react-router-dom';

const DemoSwitcher = () => {
  const location = useLocation();
  const path = location.pathname;

  const isPublic = path === '/' || path.startsWith('/for-') || path === '/contact' || path === '/aptitude-test';
  const isLearner = path.startsWith('/learner');
  const isSchool = path.startsWith('/school');
  const isInstructor = path.startsWith('/instructor');
  const isAdmin = path.startsWith('/admin');

  return (
    <div className="demo-switcher">
      <span className="ds-label">Demo:</span>
      <Link to="/" className={`ds-btn ${isPublic ? 'active' : ''}`}>
        Public Website
      </Link>
      <Link to="/learner" className={`ds-btn ${isLearner ? 'active' : ''}`}>
        Learner Portal
      </Link>
      <Link to="/school" className={`ds-btn ${isSchool ? 'active' : ''}`}>
        School Owner Portal
      </Link>
      <Link to="/instructor" className={`ds-btn ${isInstructor ? 'active' : ''}`}>
        Instructor Portal
      </Link>
      <Link to="/admin" className={`ds-btn ${isAdmin ? 'active' : ''}`}>
        Super Admin Portal
      </Link>
    </div>
  );
};

export default DemoSwitcher;
