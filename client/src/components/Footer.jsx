import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="lane-divider" style={{ marginBottom: '40px' }}></div>
      <div className="footer-top">
        <div>
          <div className="footer-logo">
            Drive<span>Learn</span> India
          </div>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <h5>Platform</h5>
            <Link to="/for-learners">For Learners</Link>
            <Link to="/for-schools">For Schools</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="footer-col">
            <h5>Account</h5>
            <Link to="/login">Log In</Link>
            <Link to="/signup">Sign Up</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        © 2026 DriveLearn India — A Unit of BTOW Pvt. Ltd.
      </div>
    </footer>
  );
};

export default Footer;
