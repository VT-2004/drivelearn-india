import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/landing.css';

const coursesList = [
  {
    id: 'course-28-car',
    category: '4wheeler',
    badge: '⭐ Most Popular · 100% RTO Ready',
    badgeColor: '#166534',
    badgeBg: '#DCFCE7',
    title: '28-Day Comprehensive Car License Course',
    subtitle: 'From zero-experience to confident licensed driver',
    vehicleType: '4-Wheeler Manual (Dual-Control)',
    icon: '🚗',
    duration: '28 Days (28 Practical Sessions)',
    price: '₹6,500',
    perDay: '₹232 / session',
    description: 'The national benchmark driving curriculum designed to build instinctive pedal control, master RTO 8 & H tracks, and prepare for real Indian traffic and steep hill ascents.',
    highlights: [
      'ABC Pedal Control & Clutch Bite Point Balancing',
      'RTO 8-Track & H-Track Precision Bay Reversing',
      'Slope Start & Flyover Hill Ascent (Zero Rollback)',
      'City Bumper-to-Bumper Rush Hour Traffic Drills',
      'Dual-Control Certified Vehicle with Instructor Safety',
      'Final RTO Mock Simulator & Evaluation Pass',
    ],
    recommendedFor: 'First-time learners seeking complete RTO license readiness',
  },
  {
    id: 'course-15-fast',
    category: 'fasttrack',
    badge: '⚡ Intensive · For Working Professionals',
    badgeColor: '#1E40AF',
    badgeBg: '#EFF6FF',
    title: '15-Day Fast-Track Defensive Car Refresher',
    subtitle: 'Rapid confidence building for licensed drivers',
    vehicleType: '4-Wheeler (Manual or Automatic)',
    icon: '⚡',
    duration: '15 Days (15 Practical Sessions)',
    price: '₹4,500',
    perDay: '₹300 / session',
    description: 'Tailored for learners who hold a license or had a learning gap. Focused on eliminating anxiety, mastering tight parallel parking, and navigating chaotic multi-lane flyovers.',
    highlights: [
      'Heavy Traffic Navigation & Aggressive Lane Merging',
      'Tight Spot Parallel Parking & Mall Basement Ramps',
      'Night Driving & High-Beam Glare Management',
      'Highway Cruising & High-Speed Emergency Braking',
      'Defensive Driving Strategies under MV Act 2019',
    ],
    recommendedFor: 'License holders returning to driving or needing city confidence',
  },
  {
    id: 'course-10-bike',
    category: '2wheeler',
    badge: '🏍️ ₹999 Campaign Launch Special',
    badgeColor: '#C2410C',
    badgeBg: '#FFF7ED',
    title: '10-Day Two-Wheeler Motorcycle & Scooter Mastery',
    subtitle: 'Balancing, slalom control, and RTO track clearing',
    vehicleType: '2-Wheeler (Geared Bike / Automatic Activa)',
    icon: '🏍️',
    duration: '10 Days (10 Practical Sessions)',
    price: '₹999',
    perDay: '₹99 / session',
    description: 'Master low-speed motorcycle balancing, clutch-throttle synchronization, narrow plank balancing, and panic braking on wet and gravel roads.',
    highlights: [
      'Clutch Friction Zone & Low-Speed Balance Slalom',
      'RTO Figure-8 Track Cleared Without Footdown',
      'Emergency Braking & Wet Road Skid Avoidance',
      'Pillion Rider Balancing & Heavy Traffic Filtering',
      'Helmet Safety, Blind Spots & Mirror Discipline',
    ],
    recommendedFor: 'Scooter and geared motorcycle learners of all ages',
  },
  {
    id: 'course-21-auto',
    category: 'auto',
    badge: '🏎️ Easy & Stress-Free Navigation',
    badgeColor: '#7E22CE',
    badgeBg: '#F3E8FF',
    title: '21-Day Automatic Transmission (AT) & EV Specialist',
    subtitle: 'No clutch, no stalling — effortless modern driving',
    vehicleType: 'Automatic (CVT / DCT / Torque Converter / EV)',
    icon: '🏎️',
    duration: '21 Days (21 Practical Sessions)',
    price: '₹5,500',
    perDay: '₹262 / session',
    description: 'Learn modern dual-pedal driving on latest automatic hatchbacks, compact SUVs, and EVs. Covers regenerative braking, hill descent assist, and electronic parking brakes.',
    highlights: [
      'Dual-Pedal Acceleration & Safe Creep Function',
      'Electronic Parking Brakes & Hill Hold Assist',
      'EV Regenerative Braking & Smooth Deceleration',
      'Expressway Multi-Lane Cruise Navigation',
      'Automated Sensors & 360° Reverse Camera Bay Parking',
    ],
    recommendedFor: 'Learners driving automatic family cars or electric vehicles',
  },
  {
    id: 'course-30-commercial',
    category: 'commercial',
    badge: '🚛 Commercial & Chauffeur License',
    badgeColor: '#0F766E',
    badgeBg: '#F0FDFA',
    title: '30-Day Commercial Heavy Vehicle & Transport Track',
    subtitle: 'Professional transport certification & logistics skills',
    vehicleType: 'Light Commercial & Heavy Motor Vehicle (HMV)',
    icon: '🚛',
    duration: '30 Days (30 Practical Sessions)',
    price: '₹8,500',
    perDay: '₹283 / session',
    description: 'Rigorous training for commercial drivers and transport operators. Focuses on air-brake management, load equalization, long-haul night driving, and RTO commercial fitness rules.',
    highlights: [
      'Air Brake Systems, Load Balancing & Pre-Trip Checklist',
      'Heavy Vehicle Blind Spot Navigation & Docking Maneuvers',
      'Interstate Highway Protocols & Mountain Ghat Driving',
      'Emergency Hazard Management & Breakdown Protocols',
      'Commercial RTO Badge & Driver Compliance Certification',
    ],
    recommendedFor: 'Commercial vehicle drivers, fleet chauffeurs & logistics operators',
  },
];

const roadmapMilestones = [
  {
    phase: 'Phase 1',
    days: 'Days 1 – 7',
    title: 'Vehicle Controls & Baseline Instincts',
    desc: 'Dual-control orientation, ABC pedal balancing, bite-point clutch control, and smooth starting/stopping without engine stalling.',
    icon: '⚙️',
  },
  {
    phase: 'Phase 2',
    days: 'Days 8 – 14',
    title: 'RTO Track Maneuvers & Precision',
    desc: 'Mastering the official RTO 8-track forward and reverse, H-track bay parking, and tight space steering synchronization.',
    icon: '🎯',
  },
  {
    phase: 'Phase 3',
    days: 'Days 15 – 22',
    title: 'Real-World Traffic & Hill Ascents',
    desc: 'Navigating crowded city intersections, multi-lane flyovers, roundabout right-of-way, and zero-rollback slope hill starts.',
    icon: '🚦',
  },
  {
    phase: 'Phase 4',
    days: 'Days 23 – 28',
    title: 'Highway, Night Driving & RTO Mock Test',
    desc: 'High-speed defensive merging, night headlight glare control, emergency braking drills, and final RTO simulator assessment.',
    icon: '🏆',
  },
];

const ForLearners = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchCity, setSearchCity] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchCity.trim()) {
      navigate(`/learner?search=${encodeURIComponent(searchCity.trim())}`);
    } else {
      navigate('/learner');
    }
  };

  const filteredCourses = coursesList.filter((c) => {
    if (activeCategory === 'all') return true;
    return c.category === activeCategory;
  });

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* HERO SECTION */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: '#FFFFFF',
          padding: '64px 24px 72px',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '860px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(249, 115, 22, 0.15)',
              border: '1px solid rgba(249, 115, 22, 0.35)',
              color: '#FB923C',
              padding: '6px 16px',
              borderRadius: '999px',
              fontSize: '12.5px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '20px',
            }}
          >
            📚 RTO-Accredited Curriculum Standards · Pan India
          </div>

          <h1
            style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 900,
              color: '#FFFFFF',
              lineHeight: 1.15,
              margin: '0 0 16px',
              letterSpacing: '-0.02em',
            }}
          >
            Certified Driving Courses for Every <span style={{ color: '#F97316' }}>Learning Stage</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(15px, 2vw, 18px)',
              color: '#CBD5E1',
              maxWidth: '720px',
              margin: '0 auto 32px',
              lineHeight: 1.6,
            }}
          >
            From zero-experience beginners to working professionals seeking defensive city driving confidence — explore standardized training packages, transparent pricing, and RTO track preparation across verified academies.
          </p>

          {/* Quick Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              maxWidth: '560px',
              margin: '0 auto',
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '6px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            }}
          >
            <input
              type="text"
              placeholder="📍 Enter your city, state, or PIN code..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                padding: '12px 18px',
                fontSize: '14.5px',
                outline: 'none',
                borderRadius: '8px',
                color: '#0F172A',
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '12px 24px', fontSize: '14px', fontWeight: 700, borderRadius: '8px' }}
            >
              Search Academies →
            </button>
          </form>
        </div>
      </section>

      {/* COURSE CATEGORIES & CARDS */}
      <section style={{ maxWidth: '1180px', width: '100%', margin: '0 auto', padding: '48px 20px' }}>
        {/* Category Pill Filters */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '36px' }}>
          {[
            { id: 'all', label: 'All Courses (5)' },
            { id: '4wheeler', label: '🚗 4-Wheeler Car' },
            { id: 'fasttrack', label: '⚡ Fast-Track Refresher' },
            { id: '2wheeler', label: '🏍️ 2-Wheeler Motorcycle' },
            { id: 'auto', label: '🏎️ Automatic & EV' },
            { id: 'commercial', label: '🚛 Commercial Transport' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '10px 18px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: activeCategory === cat.id ? '2px solid #0F172A' : '1.5px solid #E2E8F0',
                background: activeCategory === cat.id ? '#0F172A' : '#FFFFFF',
                color: activeCategory === cat.id ? '#FFFFFF' : '#475569',
                boxShadow: activeCategory === cat.id ? '0 4px 14px rgba(15, 23, 42, 0.12)' : 'none',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {filteredCourses.map((c) => (
            <div
              key={c.id}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderRadius: '18px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
                transition: 'all 0.25s ease',
                position: 'relative',
              }}
            >
              <div>
                {/* Badge & Vehicle Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <span
                    style={{
                      background: c.badgeBg,
                      color: c.badgeColor,
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      border: `1px solid ${c.badgeColor}33`,
                    }}
                  >
                    {c.badge}
                  </span>

                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                    ⏱️ {c.duration}
                  </span>
                </div>

                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px', lineHeight: 1.3 }}>
                  {c.title}
                </h3>

                <div style={{ fontSize: '13px', color: '#EA580C', fontWeight: 700, marginBottom: '12px' }}>
                  {c.subtitle}
                </div>

                <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: 1.5, margin: '0 0 18px' }}>
                  {c.description}
                </p>

                {/* Key Syllabus Checklist */}
                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
                    📋 Core Syllabus & Skills Covered:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {c.highlights.map((h, hIdx) => (
                      <div key={hIdx} style={{ fontSize: '12.5px', color: '#334155', display: 'flex', alignItems: 'flex-start', gap: '6px', lineHeight: 1.35 }}>
                        <span style={{ color: '#16A34A', fontWeight: 800 }}>✓</span>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price & CTA Strip */}
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '18px', marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                      {c.price}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748B', marginLeft: '6px' }}>
                      ({c.perDay})
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 700 }}>
                    ✓ 0% Hidden Fuel Charges
                  </span>
                </div>

                <Link
                  to="/learner"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    textAlign: 'center',
                    padding: '10px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'block',
                    borderRadius: '8px',
                  }}
                >
                  Find Local Academies Offering This →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 28-DAY RTO CURRICULUM ROADMAP SECTION */}
      <section style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '64px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-block',
              background: '#EFF6FF',
              color: '#1D4ED8',
              border: '1px solid #BFDBFE',
              padding: '4px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}
          >
            🎯 Structured 4-Stage Learning Path
          </div>

          <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#0F172A', margin: '0 0 10px' }}>
            The 28-Day Standardized RTO Roadmap
          </h2>
          <p style={{ color: '#64748B', fontSize: '15px', maxWidth: '640px', margin: '0 auto 40px' }}>
            Every accredited academy on DriveLearn India follows our synchronized 28-day practical milestone framework, ensuring full confidence and zero exam surprise.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', textAlign: 'left' }}>
            {roadmapMilestones.map((m, idx) => (
              <div
                key={idx}
                style={{
                  background: '#F8FAFC',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '24px 20px',
                  position: 'relative',
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>{m.icon}</div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#EA580C', textTransform: 'uppercase' }}>
                  {m.phase} · {m.days}
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '6px 0 8px' }}>
                  {m.title}
                </h4>
                <p style={{ fontSize: '12.5px', color: '#64748B', lineHeight: 1.45, margin: 0 }}>
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY DRIVELEARN COMPARISON SECTION */}
      <section style={{ maxWidth: '1000px', width: '100%', margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
            DriveLearn India vs Traditional Driving Schools
          </h2>
          <p style={{ color: '#64748B', fontSize: '14.5px' }}>
            Why thousands of Indian learners choose our digital verified network over unorganized brokers
          </p>
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0' }}>
                <th style={{ padding: '16px 20px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Feature / Standard</th>
                <th style={{ padding: '16px 20px', fontSize: '13px', color: '#166534', fontWeight: 800 }}>🚗 DriveLearn India Network</th>
                <th style={{ padding: '16px 20px', fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Conventional Driving Schools</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Pricing Transparency', dl: '✓ All-inclusive fees, zero fuel surcharges', conv: '✗ Hidden fuel fees & sudden price hikes' },
                { feature: 'Vehicle Safety Standards', dl: '✓ 100% RTO Dual-Control Certified Cars', conv: '⚠️ Often single-pedal private vehicles' },
                { feature: 'Attendance & Milestones', dl: '✓ Live GPS Digital Attendance & Portal Logs', conv: '✗ Manual paper diaries or no records' },
                { feature: 'Instructor Accountability', dl: '✓ Verified background & learner rating reviews', conv: '⚠️ Unvetted freelance instructors' },
                { feature: 'Free RTO Aptitude Practice', dl: '✓ Interactive online mock test engine with timer', conv: '✗ No mock testing or study materials' },
                { feature: 'Digital Wallet Bonus', dl: '✓ ₹15 Welcome Bonus + Referral discounts', conv: '✗ Cash only, no loyalty discounts' },
              ].map((row, rIdx) => (
                <tr key={rIdx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 20px', fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>{row.feature}</td>
                  <td style={{ padding: '14px 20px', fontSize: '13.5px', fontWeight: 700, color: '#15803D' }}>{row.dl}</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#64748B' }}>{row.conv}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* BOTTOM CTA BAND */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          color: '#FFFFFF',
          padding: '50px 24px',
          textAlign: 'center',
          marginTop: 'auto',
        }}
      >
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 10px' }}>
            Ready to Start Your Driving Journey?
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '14.5px', margin: '0 0 24px' }}>
            Search verified driving academies in your neighborhood, compare course packages, and claim your ₹15 instant wallet credit.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/learner"
              className="btn btn-primary btn-lg"
              style={{ padding: '12px 28px', fontWeight: 700, textDecoration: 'none' }}
            >
              🚗 Find a Driving School Near You
            </Link>
            <Link
              to="/aptitude-test"
              className="btn btn-outline btn-lg"
              style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
            >
              ⏱️ Take Free Mock Test
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ForLearners;
