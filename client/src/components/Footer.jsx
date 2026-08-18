import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-pub">
      <div className="footer-inner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '20px' }}>🚗</span>
            <h4 style={{ color: '#FFFFFF', margin: 0, fontWeight: 700 }}>
              DriveLearn India
            </h4>
          </div>
          <p style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '12.5px', maxWidth: '420px' }}>
            India's premier digital driving school network. Compare RTO-verified academies, track student milestones, and prepare for license tests with confidence.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', fontSize: '13.5px' }}>
          <Link to="/" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Home</Link>
          <Link to="/learner" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Learner Portal</Link>
          <Link to="/school" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>School Owner</Link>
          <Link to="/instructor" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Instructor</Link>
          <Link to="/admin" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Super Admin</Link>
          <Link to="/contact" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Contact & Support</Link>
        </div>
      </div>

      <div style={{
        maxWidth: '1180px',
        margin: '28px auto 0',
        paddingTop: '20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '12px',
      }}>
        <div>© 2026 DriveLearn India Pvt. Ltd. · Bengaluru, Karnataka · CIN U74999KA2019PTC123456</div>
        <div>Made with ❤️ for Indian Road Safety & 2-Wheeler Riders</div>
      </div>
    </footer>
  );
};

export default Footer;
