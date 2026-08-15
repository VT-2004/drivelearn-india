import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-eyebrow">India's Driving School Network</div>
      <div className="hero-content">
        <h1>Find your <em>road</em> to a license</h1>
        <p className="subhead">
          Compare verified driving schools near you, book lessons online,
          and track your progress — all in one place. No calls, no confusion,
          just a straight path from learner to licensed driver.
        </p>
        <div className="hero-ctas" style={{ flexWrap: 'wrap' }}>
          <Link to="/for-learners" className="btn btn-primary btn-lg">
            Find a Driving School
          </Link>
          <Link to="/for-schools" className="btn btn-outline btn-lg">
            Register Your School
          </Link>
          <Link to="/aptitude-test" className="btn btn-outline btn-lg">
            📝 Take Aptitude Test
          </Link>
          <a
            href="https://parivahan.gov.in/parivahan/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-lg"
          >
            🪪 Get Your Driving License
          </a>
        </div>
        <div className="hero-stats">
          <div>
            <div className="hero-stat-value">500+</div>
            <div className="hero-stat-label">Verified Schools</div>
          </div>
          <div>
            <div className="hero-stat-value">50+</div>
            <div className="hero-stat-label">Cities Covered</div>
          </div>
          <div>
            <div className="hero-stat-value">10K+</div>
            <div className="hero-stat-label">Learners Enrolled</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;