import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        Drive<span>Learn</span> India
      </Link>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/for-schools">For Schools</Link></li>
        <li><Link to="/for-learners">For Learners</Link></li>
        <li><Link to="/contact">Contact</Link></li>
      </ul>
      <div className="navbar-actions">
        <Link to="/login" className="btn btn-outline">Log In</Link>
        <Link to="/signup" className="btn btn-primary">Sign Up</Link>
      </div>
    </nav>
  );
};

export default Navbar;
