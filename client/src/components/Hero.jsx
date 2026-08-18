import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const MAHARASHTRA_CITIES = [
  'Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Navi Mumbai', 'Chhatrapati Sambhaji Nagar', 'Kolhapur', 'Solapur'
];

const Hero = () => {
  const [cityInput, setCityInput] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (cityInput.trim()) {
      navigate(`/learner?city=${encodeURIComponent(cityInput.trim())}`);
    } else {
      navigate('/learner');
    }
  };

  const handleCityClick = (city) => {
    navigate(`/learner?city=${encodeURIComponent(city)}`);
  };

  return (
    <section className="hero" style={{ background: '#121314', color: '#FFFFFF', padding: '60px 48px 70px' }}>
      {/* Promotional Top Bar */}
      <div style={{
        background: '#D32F2F',
        color: '#FFFFFF',
        padding: '10px 20px',
        borderRadius: '8px',
        marginBottom: '28px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        fontWeight: 700,
        fontSize: '14px',
        boxShadow: '0 4px 14px rgba(211, 47, 47, 0.4)',
      }}>
        <span>🎁 Launch Special:</span>
        <span>Get ₹15 Instant Welcome Bonus in Your Wallet on Signup! 2-Wheeler Training starting at ₹499/₹999.</span>
      </div>

      <div className="hero-eyebrow" style={{ color: '#FF5252', fontWeight: 700, letterSpacing: '2px', fontSize: '13px' }}>
        🏍️ MAHARASHTRA'S #1 TWO-WHEELER & DRIVING TRAINING PLATFORM
      </div>

      <div className="hero-content" style={{ maxWidth: '820px' }}>
        <h1 style={{ color: '#FFFFFF', fontSize: '64px', lineHeight: 1.05, textTransform: 'uppercase', margin: '0 0 20px', fontWeight: 800 }}>
          Master <em>2-Wheeler Riding</em> & Driving With Top Academies
        </h1>

        <p className="subhead" style={{ color: '#E0E0E0', fontSize: '18px', lineHeight: 1.6, maxWidth: '680px', marginBottom: '32px' }}>
          Affordable, step-by-step training for middle-class riders and drivers across Maharashtra. Learn scooter balance, motorcycle gear shifting, RTO 8-track maneuvers, and road safety with certified instructors.
        </p>

        {/* Quick City Search Box */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', maxWidth: '560px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search your city in Maharashtra (e.g. Pune, Mumbai, Nagpur)..."
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            style={{
              flex: 1,
              minWidth: '260px',
              padding: '14px 18px',
              borderRadius: '6px',
              border: '2px solid #D32F2F',
              fontSize: '15px',
              background: '#FFFFFF',
              color: '#1C1F22',
            }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '15px', fontWeight: 700 }}>
            Find Training Schools →
          </button>
        </form>

        {/* Quick City Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
          <span style={{ fontSize: '13px', color: '#BDBDBD', fontWeight: 600 }}>📍 Popular Maharashtra Cities:</span>
          {MAHARASHTRA_CITIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => handleCityClick(c)}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#FFFFFF',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#D32F2F'; e.currentTarget.style.borderColor = '#D32F2F'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'; }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Quick CTAs */}
        <div className="hero-ctas" style={{ flexWrap: 'wrap', gap: '14px', marginBottom: '44px' }}>
          <Link to="/learner" className="btn btn-primary btn-lg" style={{ background: '#D32F2F', color: '#FFFFFF', fontWeight: 700 }}>
            🏍️ Explore 2-Wheeler Courses
          </Link>
          <Link to="/aptitude-test" className="btn btn-outline btn-lg" style={{ borderColor: '#FFFFFF', color: '#FFFFFF' }}>
            📝 Free RTO Mock Test
          </Link>
          <a
            href="https://parivahan.gov.in/parivahan/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-lg"
            style={{ borderColor: 'rgba(255,255,255,0.6)', color: '#FFFFFF' }}
          >
            🪪 Parivahan RTO Portal
          </a>
        </div>

        {/* Stats */}
        <div className="hero-stats" style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '24px' }}>
          <div>
            <div className="hero-stat-value" style={{ color: '#FF5252', fontWeight: 800 }}>500+</div>
            <div className="hero-stat-label" style={{ color: '#E0E0E0' }}>Certified Instructors</div>
          </div>
          <div>
            <div className="hero-stat-value" style={{ color: '#FF5252', fontWeight: 800 }}>98%</div>
            <div className="hero-stat-label" style={{ color: '#E0E0E0' }}>RTO First-Attempt Pass</div>
          </div>
          <div>
            <div className="hero-stat-value" style={{ color: '#FF5252', fontWeight: 800 }}>₹499*</div>
            <div className="hero-stat-label" style={{ color: '#E0E0E0' }}>2-Wheeler Special Starting Fee</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;