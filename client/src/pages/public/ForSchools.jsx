import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/landing.css';

const benefits = [
  { mark: '01', title: 'Reach More Students', desc: 'Get discovered by learners actively searching for driving schools in your city — no more relying on word of mouth alone.' },
  { mark: '02', title: 'Manage Everything Online', desc: 'Handle instructors, courses, schedules, and student records from one dashboard instead of scattered notebooks and spreadsheets.' },
  { mark: '03', title: 'Get Paid Securely', desc: 'Accept online payments directly through the platform — no chasing cash payments or maintaining manual ledgers.' },
  { mark: '04', title: 'Build Real Trust', desc: 'Verified badge and genuine learner reviews help new students choose your school with confidence.' },
];

const ForSchools = () => {
  return (
    <div>
      <Navbar />

      <section className="split-hero">
        <div>
          <h1>Grow your driving school, <em>online</em></h1>
          <p className="subhead">
            Join DriveLearn India and turn your driving school into a digital business —
            manage students, instructors, and bookings from one dashboard, and get discovered
            by learners across your city.
          </p>
          <Link to="/signup" className="btn btn-primary btn-lg">Register Your School</Link>
        </div>
        <div className="split-hero-visual">
          <div className="split-hero-visual-label">Your Dashboard Preview</div>
          <div className="split-hero-visual-row">
            <span>Active Students</span>
            <strong>128</strong>
          </div>
          <div className="split-hero-visual-row">
            <span>This Month's Bookings</span>
            <strong>34</strong>
          </div>
          <div className="split-hero-visual-row">
            <span>Instructors</span>
            <strong>6</strong>
          </div>
          <div className="split-hero-visual-row">
            <span>Avg. Rating</span>
            <strong>4.7 ★</strong>
          </div>
        </div>
      </section>

      <section className="benefits">
        <div className="section-eyebrow">Why Join</div>
        <h2 className="section-title">Everything to Run Your School</h2>
        <div className="benefit-list">
          {benefits.map((b) => (
            <div className="benefit-item" key={b.mark}>
              <span className="benefit-mark">{b.mark}</span>
              <div>
                <h4>{b.title}</h4>
                <p>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pricing">
        <div className="section-eyebrow">Simple Pricing</div>
        <h2 className="section-title">Choose Your Plan</h2>
        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-plan-name">Monthly</div>
            <div className="pricing-price">₹999 <span>/ month</span></div>
            <ul className="pricing-features">
              <li>Full dashboard access</li>
              <li>Unlimited instructors</li>
              <li>Online booking & payments</li>
              <li>Basic analytics</li>
            </ul>
            <Link to="/signup" className="btn btn-outline" style={{ color: 'var(--color-asphalt)', border: '1.5px solid var(--color-asphalt)', width: '100%', textAlign: 'center' }}>
              Get Started
            </Link>
          </div>
          <div className="pricing-card featured">
            <span className="pricing-badge">Best Value</span>
            <div className="pricing-plan-name">Yearly</div>
            <div className="pricing-price">₹9,999 <span>/ year</span></div>
            <ul className="pricing-features">
              <li>Everything in Monthly</li>
              <li>2 months free</li>
              <li>Priority support</li>
              <li>Advanced analytics</li>
            </ul>
            <Link to="/signup" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
              Get Started
            </Link>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <h2>Ready to take your school online?</h2>
        <Link to="/signup" className="btn btn-lg" style={{ background: 'var(--color-asphalt)', color: 'var(--color-white)' }}>
          Register Your School Today
        </Link>
      </section>

      <Footer />
    </div>
  );
};

export default ForSchools;
