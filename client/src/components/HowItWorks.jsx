import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { searchSchools } from '../services/api';

const HowItWorks = () => {
  const [dbSchools, setDbSchools] = useState([]);

  useEffect(() => {
    searchSchools({ limit: 6 })
      .then((res) => {
        if (res.data?.schools && res.data.schools.length > 0) {
          setDbSchools(res.data.schools);
        }
      })
      .catch(() => {});
  }, []);

  const maharashtraSchools = [
    {
      name: 'Sunrise Driving Institute',
      location: 'Pune, Maharashtra',
      rating: 4.4,
      reviews: 203,
      verified: true,
      price: 4499,
      tags: ['2-Wheeler', '4-Wheeler Basic'],
      image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=70',
    },
    {
      name: 'RoadKing Driving Academy',
      location: 'Mumbai, Maharashtra',
      rating: 4.6,
      reviews: 389,
      verified: true,
      price: 4999,
      tags: ['2-Wheeler', '4-Wheeler Basic', 'Highway Driving'],
      image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=70',
    },
    {
      name: 'Vidarbha Driving Institute',
      location: 'Nagpur, Maharashtra',
      rating: 4.5,
      reviews: 167,
      verified: true,
      price: 3499,
      tags: ['2-Wheeler', '4-Wheeler Basic'],
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=70',
    },
  ];

  return (
    <div>
      {/* 4-Pillar Value Strip */}
      <div className="value-strip">
        <div className="value-item">
          <div className="vi-icon">🛡️</div>
          <div>
            <h4>Verified Schools</h4>
            <p>Every listed school is RTO-registered and document-checked.</p>
          </div>
        </div>

        <div className="value-item">
          <div className="vi-icon">👤</div>
          <div>
            <h4>Experienced Instructors</h4>
            <p>Background-checked instructors with 4+ years average experience.</p>
          </div>
        </div>

        <div className="value-item">
          <div className="vi-icon">📅</div>
          <div>
            <h4>Easy Online Booking</h4>
            <p>Pick your course, date and instructor in under 3 minutes.</p>
          </div>
        </div>

        <div className="value-item">
          <div className="vi-icon">💳</div>
          <div>
            <h4>Secure Payments</h4>
            <p>UPI, cards and net banking with ₹15 welcome bonus applied.</p>
          </div>
        </div>
      </div>

      {/* Road Safety & Driving Aptitude Test Section */}
      <section className="section" style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid var(--line)', marginTop: '48px', padding: '40px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'center' }}>
          <div>
            <span className="kicker">ASSESS YOUR READINESS</span>
            <h2 style={{ fontSize: '30px', fontWeight: 800, marginBottom: '12px' }}>
              Free Online Driving Aptitude & Road Safety Test
            </h2>
            <p style={{ color: 'var(--ink-soft)', fontSize: '15px', lineHeight: 1.6, marginBottom: '20px' }}>
              Evaluate your understanding of Indian traffic rules, right-of-way signs, hazard perception, and 2-wheeler balance fundamentals with our timed quiz module.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/aptitude-test" className="btn btn-primary">
                Take the Free Quiz Now ⏱️
              </Link>
              <Link to="/for-learners" className="btn btn-outline">
                Explore Beginner Courses →
              </Link>
            </div>
          </div>

          <div style={{ background: 'var(--paper)', borderRadius: '14px', padding: '24px', border: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span className="badge badge-orange">Quiz Question Preview</span>
              <span style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>Time: 10 Mins</span>
            </div>
            <p style={{ fontWeight: 700, fontSize: '14.5px', marginBottom: '14px' }}>
              What does a flashing yellow traffic signal indicate at a junction?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ background: '#FFFFFF', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', border: '1px solid var(--line)' }}>
                A. Stop immediately and wait for green
              </div>
              <div style={{ background: 'var(--teal-tint)', color: 'var(--teal)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', border: '1px solid var(--teal)', fontWeight: 600 }}>
                ✓ B. Slow down and proceed with caution
              </div>
              <div style={{ background: '#FFFFFF', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', border: '1px solid var(--line)' }}>
                C. Accelerate to clear the intersection quickly
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular in Maharashtra Spotlight Section */}
      <section className="section">
        <div className="section-head">
          <div>
            <span className="kicker">PRIMARY TARGET REGION</span>
            <h2>Popular in Maharashtra</h2>
            <p>
              Top verified academies across Mumbai, Pune, Nagpur, and Nashik with 2-Wheeler & 4-Wheeler courses.
            </p>
          </div>
          <Link to="/learner?city=Mumbai" className="btn btn-outline">
            View all Maharashtra schools →
          </Link>
        </div>

        <div className="school-grid">
          {maharashtraSchools.map((s) => (
            <div className="school-card" key={s.name}>
              <div
                className="school-cover"
                style={{ backgroundImage: `url(${s.image})` }}
              >
                {s.verified && (
                  <span className="badge badge-verified">
                    ✓ Verified RTO
                  </span>
                )}
              </div>

              <div className="school-body">
                <div className="sname">{s.name}</div>
                <div className="school-meta">📍 {s.location}</div>

                <div className="rating-row">
                  <span className="rating-pill">⭐ {s.rating}</span>
                  <span style={{ color: 'var(--muted)', fontSize: '12px' }}>
                    ({s.reviews} reviews)
                  </span>
                </div>

                <div className="course-chips">
                  {s.tags.map((t) => (
                    <span className="chip" key={t}>{t}</span>
                  ))}
                </div>

                <div className="school-foot">
                  <div className="price-tag">
                    ₹{s.price.toLocaleString('en-IN')} <span>onwards</span>
                  </div>
                  <Link to="/learner" className="btn btn-primary btn-sm">
                    Book Lesson
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
