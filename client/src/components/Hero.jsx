import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Hero = () => {
  const [filters, setFilters] = useState({
    state: 'Maharashtra',
    city: 'Mumbai',
    locality: '',
    course: '4-Wheeler Basic',
  });

  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/learner?city=${encodeURIComponent(filters.city)}&category=${filters.course.includes('2-Wheeler') ? '2-wheeler' : '4-wheeler'}`);
  };

  return (
    <div>
      {/* Hero Header */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">
            <span>🛡️</span> 3,200+ RTO-verified driving schools across India
          </div>
          <h1>
            Learn Driving.<br />
            Drive Confidently.
          </h1>
          <p className="sub">
            Find verified driving schools, compare courses, book lessons and track your driving journey — all in one place.
          </p>
        </div>
      </section>

      {/* Floating Overlapping Search Card */}
      <div style={{ padding: '0 24px' }}>
        <div className="search-card">
          <div className="sc-title">WHERE DO YOU WANT TO LEARN DRIVING?</div>
          <form onSubmit={handleSearch} className="search-grid">
            <div className="field">
              <label>State</label>
              <select
                value={filters.state}
                onChange={(e) => setFilters({ ...filters, state: e.target.value })}
              >
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Delhi">Delhi</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Odisha">Odisha</option>
                <option value="Bihar">Bihar</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
              </select>
            </div>

            <div className="field">
              <label>City</label>
              <select
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              >
                <option value="Mumbai">Mumbai</option>
                <option value="Pune">Pune</option>
                <option value="Nagpur">Nagpur</option>
                <option value="Nashik">Nashik</option>
                <option value="Thane">Thane</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="New Delhi">New Delhi</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Bhubaneswar">Bhubaneswar</option>
                <option value="Patna">Patna</option>
              </select>
            </div>

            <div className="field">
              <label>Locality</label>
              <input
                type="text"
                placeholder="e.g. Andheri, Kothrud, Bandra"
                value={filters.locality}
                onChange={(e) => setFilters({ ...filters, locality: e.target.value })}
              />
            </div>

            <div className="field">
              <label>Course</label>
              <select
                value={filters.course}
                onChange={(e) => setFilters({ ...filters, course: e.target.value })}
              >
                <option value="4-Wheeler Basic">4-Wheeler Basic</option>
                <option value="2-Wheeler Course">2-Wheeler (Scooter/Bike)</option>
                <option value="Highway Driving">Highway Driving</option>
                <option value="Commercial License">Commercial Vehicle</option>
                <option value="Refresher Course">Refresher Course</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', height: '45px' }}>
              🔍 Search
            </button>
          </form>
        </div>
      </div>

      {/* 2-Wheeler Course Launch Offer Banner */}
      <div className="promo-banner">
        <div className="promo-banner-inner">
          <div>
            <h3>
              <span>🏍️</span> 2-Wheeler Course Launch Offer
            </h3>
            <p>
              Just <strong>₹999</strong> <span className="promo-strike">₹2,499</span> for the first 2 months — scooter & motorcycle training, 10 lessons in 7 days.
            </p>
          </div>
          <Link
            to="/learner?category=2-wheeler"
            className="btn btn-white"
          >
            Book 2-Wheeler Course →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;