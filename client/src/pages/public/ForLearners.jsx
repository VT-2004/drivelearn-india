import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/landing.css';

const benefits = [
  { mark: '01', title: 'Only Verified Schools', desc: 'Every school on the platform is checked before going live, so you never risk booking with an unverified operator.' },
  { mark: '02', title: 'Compare Before You Choose', desc: 'See pricing, course details, and instructor experience side by side instead of calling around town.' },
  { mark: '03', title: 'Honest Reviews', desc: 'Ratings only come from learners who actually completed a course — no fake or paid reviews.' },
  { mark: '04', title: 'Track Your Progress', desc: 'See your attendance and lesson progress update after every session, right from your learner portal.' },
];

const ForLearners = () => {
  return (
    <div>
      <Navbar />

      <section className="split-hero">
        <div>
          <h1>Learn to drive with <em>confidence</em></h1>
          <p className="subhead">
            Search verified driving schools near you, compare pricing and reviews,
            and book your first lesson online — all without a single confusing phone call.
          </p>
          <Link to="/signup" className="btn btn-primary btn-lg">Find a School Near You</Link>
        </div>
        <div className="split-hero-visual">
          <div className="split-hero-visual-label">Sample Search Result</div>
          <div className="split-hero-visual-row">
            <span>Elite Driving Academy</span>
            <strong>4.8 ★</strong>
          </div>
          <div className="split-hero-visual-row">
            <span>Course Price</span>
            <strong>₹4,500</strong>
          </div>
          <div className="split-hero-visual-row">
            <span>Duration</span>
            <strong>14 Days</strong>
          </div>
          <div className="split-hero-visual-row">
            <span>Status</span>
            <strong>Verified ✓</strong>
          </div>
        </div>
      </section>

      <section className="benefits">
        <div className="section-eyebrow">Why Learners Choose Us</div>
        <h2 className="section-title">A Simpler Way to Learn</h2>
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

      <section className="cta-band">
        <h2>Ready to hit the road?</h2>
        <Link to="/signup" className="btn btn-lg" style={{ background: 'var(--color-asphalt)', color: 'var(--color-white)' }}>
          Create Your Free Account
        </Link>
      </section>

      <Footer />
    </div>
  );
};

export default ForLearners;
