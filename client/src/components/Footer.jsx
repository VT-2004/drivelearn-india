import { Link } from 'react-router-dom';
import { IconSteeringWheel } from './Icons';

const Footer = () => {
  return (
    <footer
      style={{
        background: 'linear-gradient(180deg, #0F172A 0%, #090D16 100%)',
        color: '#FFFFFF',
        borderTop: '1px solid #1E293B',
        padding: '56px 24px 32px',
        marginTop: 'auto',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: '1180px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '48px',
        }}
      >
        {/* Column 1: Brand & Mission */}
        <div style={{ maxWidth: '340px' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              marginBottom: '14px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #B3182F 0%, #E1712E 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(179, 24, 47, 0.3)',
              }}
            >
              <IconSteeringWheel size={20} color="#FFFFFF" strokeWidth={2.2} />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              Drive<span style={{ color: '#E1712E' }}>Learn</span> India
            </div>
          </Link>

          <p style={{ color: '#94A3B8', fontSize: '13px', lineHeight: 1.6, margin: '0 0 16px' }}>
            India's premier digital driving school network. Compare RTO-verified academies, track student milestones in real-time, and prepare for license tests with confidence.
          </p>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '11px',
                color: '#CBD5E1',
                fontWeight: 600,
              }}
            >
              🇮🇳 Built for Indian Roads
            </span>
            <span
              style={{
                background: 'rgba(34, 197, 94, 0.12)',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '11px',
                color: '#86EFAC',
                fontWeight: 600,
              }}
            >
              ✓ Verified RTO Partners
            </span>
          </div>
        </div>

        {/* Column 2: Learners & Courses */}
        <div>
          <h4
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: '#F97316',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              margin: '0 0 18px',
            }}
          >
            Learners & Training
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>
              <Link to="/learner" style={{ color: '#CBD5E1', textDecoration: 'none', fontSize: '13.5px', transition: 'color 0.2s' }}>
                🔍 Find Driving Schools Near You
              </Link>
            </li>
            <li>
              <Link to="/for-learners" style={{ color: '#CBD5E1', textDecoration: 'none', fontSize: '13.5px', transition: 'color 0.2s' }}>
                📚 28-Day RTO Courses & Pricing
              </Link>
            </li>
            <li>
              <Link to="/aptitude-test" style={{ color: '#CBD5E1', textDecoration: 'none', fontSize: '13.5px', transition: 'color 0.2s' }}>
                ⏱️ Free Driving Aptitude Mock Quiz
              </Link>
            </li>
            <li>
              <Link to="/learner" style={{ color: '#CBD5E1', textDecoration: 'none', fontSize: '13.5px', transition: 'color 0.2s' }}>
                🎁 ₹15 Signup Wallet Bonus
              </Link>
            </li>
            <li>
              <Link to="/login" style={{ color: '#CBD5E1', textDecoration: 'none', fontSize: '13.5px', transition: 'color 0.2s' }}>
                👨‍🎓 Learner Portal Login
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Driving Schools & Instructors */}
        <div>
          <h4
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: '#F97316',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              margin: '0 0 18px',
            }}
          >
            Academies & Instructors
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>
              <Link to="/for-schools" style={{ color: '#CBD5E1', textDecoration: 'none', fontSize: '13.5px', transition: 'color 0.2s' }}>
                🏫 List & Verify Your School
              </Link>
            </li>
            <li>
              <Link to="/school" style={{ color: '#CBD5E1', textDecoration: 'none', fontSize: '13.5px', transition: 'color 0.2s' }}>
                🏢 School Owner Operating Portal
              </Link>
            </li>
            <li>
              <Link to="/instructor" style={{ color: '#CBD5E1', textDecoration: 'none', fontSize: '13.5px', transition: 'color 0.2s' }}>
                👨‍🏫 Instructor Evaluation Hub
              </Link>
            </li>
            <li>
              <Link to="/admin" style={{ color: '#CBD5E1', textDecoration: 'none', fontSize: '13.5px', transition: 'color 0.2s' }}>
                🛡️ Super Admin Compliance Console
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Support & Contact */}
        <div>
          <h4
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: '#F97316',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              margin: '0 0 18px',
            }}
          >
            Help & National Desk
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>
              <Link to="/contact" style={{ color: '#CBD5E1', textDecoration: 'none', fontSize: '13.5px', transition: 'color 0.2s' }}>
                💬 24/7 Help & Support Desk
              </Link>
            </li>
            <li style={{ color: '#94A3B8', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📧</span>
              <span style={{ color: '#CBD5E1', fontFamily: 'var(--font-mono)' }}>support@drivelearn.in</span>
            </li>
            <li style={{ color: '#94A3B8', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📞</span>
              <span style={{ color: '#CBD5E1', fontFamily: 'var(--font-mono)' }}>+91 80 4123 4567</span>
            </li>
            <li style={{ color: '#94A3B8', fontSize: '12.5px', lineHeight: 1.4, marginTop: '4px' }}>
              📍 4th Floor, Tech Innovation Hub, Koramangala 5th Block, Bengaluru 560095
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Compliance */}
      <div
        style={{
          maxWidth: '1180px',
          margin: '0 auto',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          color: '#64748B',
          fontSize: '12px',
        }}
      >
        <div>
          © 2026 DriveLearn India Pvt. Ltd. · Bengaluru, Karnataka · CIN U74999KA2019PTC123456
        </div>

        <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
          <span style={{ color: '#94A3B8' }}>Motor Vehicles Act 2019 Compliant</span>
          <span>·</span>
          <span style={{ color: '#22C55E' }}>🟢 All Systems Operational</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
