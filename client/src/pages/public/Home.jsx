import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { searchSchools } from '../../services/api';
import '../../styles/landing.css';

const Home = () => {
  const navigate = useNavigate();

  // Search Filters State
  const [searchFilters, setSearchFilters] = useState({
    city: 'Bengaluru',
    state: 'Karnataka',
    category: '4-wheeler',
    transmission: 'manual',
  });

  // DB Schools state
  const [featuredSchools, setFeaturedSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(true);

  // Interactive Quiz State
  const quizQuestions = [
    {
      id: 1,
      signEmoji: '🛑',
      signName: 'Octagonal Red Sign with "STOP"',
      question: 'What is the mandatory action upon seeing an octagonal STOP sign in India?',
      options: [
        { text: 'Slow down and proceed if no vehicle is approaching', correct: false },
        { text: 'Come to a complete stop before the stop line, look both ways, then proceed', correct: true },
        { text: 'Honk and accelerate through the intersection', correct: false },
        { text: 'Stop only if a traffic police officer is present', correct: false },
      ],
      explanation: 'Under the Motor Vehicles Act (Section 119), a STOP sign mandates a complete cessation of vehicle motion before the line regardless of traffic density.',
    },
    {
      id: 2,
      signEmoji: '⚠️',
      signName: 'Inverted Triangle with Red Border',
      question: 'What does the "GIVE WAY / YIELD" inverted triangular road sign signify?',
      options: [
        { text: 'You have right of way over all oncoming traffic', correct: false },
        { text: 'Slow down and give precedence to traffic on the main road / roundabout', correct: true },
        { text: 'Road is closed for construction ahead', correct: false },
        { text: 'Overtaking from the left is allowed', correct: false },
      ],
      explanation: 'Give Way signs require you to yield to vehicles approaching on the major road or circulating traffic inside a roundabout.',
    },
    {
      id: 3,
      signEmoji: '🅿️❌',
      signName: 'Blue Circle with Red Cross (No Stopping)',
      question: 'What is the crucial difference between "No Parking" and "No Stopping / Standing"?',
      options: [
        { text: 'They mean the exact same thing', correct: false },
        { text: 'No Parking allows momentary drop-off; No Stopping forbids any halt whatsoever', correct: true },
        { text: 'No Stopping applies only to commercial trucks', correct: false },
        { text: 'No Parking is enforced only at night', correct: false },
      ],
      explanation: 'No Stopping (Red Cross on Blue) prohibits halting even for a few seconds to drop off or pick up passengers.',
    },
  ];

  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Curriculum Stepper Active Stage
  const [activeCurriculumStage, setActiveCurriculumStage] = useState(0);

  // FAQ Accordion Open State
  const [openFaq, setOpenFaq] = useState(null);

  // Load Real Schools from API
  useEffect(() => {
    searchSchools({ limit: 6 })
      .then((res) => {
        if (res.data?.schools && res.data.schools.length > 0) {
          setFeaturedSchools(res.data.schools);
        } else {
          // Fallback verified academies
          setFeaturedSchools([
            {
              id: 1,
              name: 'Royal Crown Driving Academy',
              city: 'Bengaluru, Karnataka',
              address: 'Indiranagar 100ft Road',
              rating: 4.9,
              coursesCount: 4,
              price: 4999,
              vehiclesCount: 6,
              verified: true,
              image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=70',
            },
            {
              id: 2,
              name: 'Apex Motor Training Institute',
              city: 'Mumbai, Maharashtra',
              address: 'Andheri West & Bandra',
              rating: 4.8,
              coursesCount: 5,
              price: 5499,
              vehiclesCount: 8,
              verified: true,
              image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=70',
            },
            {
              id: 3,
              name: 'National RTO Safety Academy',
              city: 'New Delhi, Delhi NCR',
              address: 'Connaught Place & South Ex',
              rating: 4.9,
              coursesCount: 3,
              price: 4499,
              vehiclesCount: 5,
              verified: true,
              image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=70',
            },
          ]);
        }
      })
      .catch(() => {
        setFeaturedSchools([]);
      })
      .finally(() => {
        setLoadingSchools(false);
      });
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    navigate(`/learner?city=${encodeURIComponent(searchFilters.city)}&category=${encodeURIComponent(searchFilters.category)}`);
  };

  const handleQuizSelect = (optIndex, isCorrect) => {
    if (quizAnswered) return;
    setSelectedQuizOption(optIndex);
    setQuizAnswered(true);
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    setSelectedQuizOption(null);
    setQuizAnswered(false);
    setCurrentQuizIndex((prev) => (prev + 1) % quizQuestions.length);
  };

  const curriculumStages = [
    {
      stage: 'Stage 01',
      title: 'Cockpit Orientation & Pedal Modulation',
      duration: 'Days 1 - 3',
      icon: '🎛️',
      summary: 'Build fundamental muscle memory before entering moving traffic.',
      skills: [
        'ABC Control: Accelerator, Brake, Clutch pedal positioning',
        'Biting Point Discovery & smooth zero-stall vehicle launch',
        '3-Point Mirror Adjustment (ORVMs & IRVM blind spots)',
        'Dashboard Warning Lights, wipers & turn indicator discipline',
      ],
    },
    {
      stage: 'Stage 02',
      title: 'RTO Yard Maneuvers: 8-Track & "H" Shape',
      duration: 'Days 4 - 6',
      icon: '📐',
      summary: 'Master precise spatial control on official RTO testing patterns.',
      skills: [
        'Figure-8 continuous steering transition without crossing lanes',
        '"H" Formation reverse bay parking and turning',
        'Incline / Gradient Hill-Start with handbrake and clutch balance',
        'Tight U-turn and 3-point road turning in confined lanes',
      ],
    },
    {
      stage: 'Stage 03',
      title: 'Urban Traffic & Defensive Navigation',
      duration: 'Days 7 - 10',
      icon: '🚦',
      summary: 'Experience real city flow, signals, roundabouts, and pedestrians.',
      skills: [
        'Bumper-to-bumper peak hour traffic clutch crawling',
        'Right-of-way rules at uncontrolled 4-way intersections',
        'Lane discipline and safe mirror-indicator-shoulder checks',
        'Pedestrian crossing, auto-rickshaw & two-wheeler hazard awareness',
      ],
    },
    {
      stage: 'Stage 04',
      title: 'Highway Speed & Night Driving',
      duration: 'Days 11 - 13',
      icon: '🛣️',
      summary: 'High-speed stability, multi-lane overtaking, and headlight etiquette.',
      skills: [
        'Expressway speed modulation (60-80 km/h) & safe following distance',
        'Overtaking safely with high-beam dipping and horn signaling',
        'High-beam vs Low-beam night driving glare prevention',
        'Emergency heavy braking & hydroplaning control during monsoons',
      ],
    },
    {
      stage: 'Stage 05',
      title: 'Reverse Parallel & Angular Parking',
      duration: 'Days 14 - 15',
      icon: '🅿️',
      summary: 'Eliminate parking anxiety forever in tight Indian urban spaces.',
      skills: [
        '45-degree angle reverse parallel curb parking',
        'Tight mall basement 90-degree bay parking',
        'Mirror alignment techniques for zero curb-rash',
        'Reversing using side mirrors without turning body',
      ],
    },
    {
      stage: 'Stage 06',
      title: 'Mock RTO Driving Test & Form 5 Certification',
      duration: 'Day 16',
      icon: '🎓',
      summary: 'Official evaluation by Senior Instructor and instant digital certificate.',
      skills: [
        'Full 100-point mock practical driving test under RTO inspector rules',
        'Form 5 Driving School Competency Certificate generation',
        'Learner permanent driving license slot booking assistance',
        'DriveLearn India Official Verified Accreditation badge',
      ],
    },
  ];

  const faqs = [
    {
      q: 'How does DriveLearn India verify listed driving schools and instructors?',
      a: 'Every driving academy listed on DriveLearn must submit valid State Transport Department RTO licenses, dual-control vehicular registration certificates, and instructor commercial teaching badges. Our compliance team verifies each document before granting the "Verified RTO Partner" badge.',
    },
    {
      q: 'Can I choose between Manual and Automatic (EV/Petrol) training vehicles?',
      a: 'Yes! DriveLearn India allows you to filter schools by transmission type. You can choose traditional manual gearshift cars with dual-clutch control or modern automatic / electric vehicles suited for city commuting.',
    },
    {
      q: 'How does the DriveLearn ₹15 introductory wallet bonus and payment refund work?',
      a: 'All new learners receive an instant ₹15 introductory wallet credit on registration. Payments are securely escrowed via Razorpay. If you cancel a booking according to our flexible cancellation policy, 100% of your eligible refund is credited instantly to your DriveLearn Wallet for immediate re-booking.',
    },
    {
      q: 'Will I receive an official RTO Form 5 certificate upon course completion?',
      a: 'Yes! Upon completing your course sessions, an official RTO Form 5-compliant Certificate of Driver Competency with a unique serial number, digital security seal, and instructor endorsement is generated instantly for PDF download and sent to your email.',
    },
    {
      q: 'Can I change my assigned instructor or reschedule a lesson slot?',
      a: 'Absolutely. You can reschedule any upcoming training session directly from your Learner Dashboard by choosing from your instructor’s open calendar slots with zero extra fees.',
    },
    {
      q: 'I am a Driving School Owner. How do I list my academy?',
      a: 'Click "For School Owners" in the top bar or click the "Register Your Academy" button below. You can register your school, upload branches and dual-control vehicles, assign instructors, and start receiving digital bookings immediately.',
    },
  ];

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. TOP ANNOUNCEMENT & RTO TRUST BAR */}
      <div
        style={{
          background: 'linear-gradient(90deg, #0B192C 0%, #1E3A8A 50%, #0B192C 100%)',
          color: '#FFFFFF',
          padding: '8px 16px',
          fontSize: '12px',
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}>
          <span style={{ background: '#C59B27', color: '#0B192C', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, fontSize: '11px' }}>
            🇮🇳 NATIONAL RTO COMPLIANCE
          </span>
          <span>India’s 1st Certified Dual-Control Driving Network · 100% CMVR Form 5 Compliant · 50,000+ Safe Drivers Trained</span>
        </div>

        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <span style={{ color: '#FDE047' }}>🎁 Get ₹15 Bonus on Sign Up</span>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>
          <Link to="/aptitude-test" style={{ color: '#93C5FD', textDecoration: 'underline' }}>
            Free RTO Mock Test →
          </Link>
        </div>
      </div>

      {/* 2. GLOBAL NAVBAR */}
      <Navbar />

      {/* 3. HERO SECTION WITH LIVE INTERACTIVE FINDER & SIMULATION CARD */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0B192C 0%, #16202A 60%, #1E293B 100%)',
          color: '#FFFFFF',
          padding: '64px 24px 80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Decorative Road Lines Background */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.05,
            backgroundImage: 'radial-gradient(#FFFFFF 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '48px', alignItems: 'center', position: 'relative', zIndex: 2 }}>
          {/* Left Column: Headline, Trust Points, and Quick Search Bar */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '999px', fontSize: '13px', marginBottom: '20px' }}>
              <span>🛡️</span> Over 1,200+ Verified Driving Schools Across 40+ Indian Cities
            </div>

            <h1 style={{ fontSize: '46px', fontWeight: 900, lineHeight: 1.15, color: '#FFFFFF', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
              Master Driving.<br />
              <span style={{ background: 'linear-gradient(90deg, #F97316 0%, #FBBF24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Drive With Total Confidence.
              </span>
            </h1>

            <p style={{ fontSize: '16.5px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6, marginBottom: '28px', maxWidth: '560px' }}>
              Book certified dual-control driving academies, practice on official RTO 8-tracks, schedule slots online, and earn your verified RTO Form 5 certificate.
            </p>

            {/* Quick Interactive Search Box */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
                color: 'var(--ink)',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>
                🔍 FIND CERTIFIED DRIVING ACADEMIES IN YOUR CITY
              </div>

              <form onSubmit={handleHeroSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr) auto', gap: '12px', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--muted)', marginBottom: '4px' }}>City / Hub</label>
                  <select
                    value={searchFilters.city}
                    onChange={(e) => setSearchFilters({ ...searchFilters, city: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid var(--line)', fontSize: '13.5px', fontWeight: 600, background: '#FFFFFF' }}
                  >
                    <option value="Bengaluru">Bengaluru, KA</option>
                    <option value="Mumbai">Mumbai, MH</option>
                    <option value="Delhi">Delhi NCR</option>
                    <option value="Pune">Pune, MH</option>
                    <option value="Hyderabad">Hyderabad, TS</option>
                    <option value="Chennai">Chennai, TN</option>
                    <option value="Kolkata">Kolkata, WB</option>
                    <option value="Ahmedabad">Ahmedabad, GJ</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--muted)', marginBottom: '4px' }}>Category</label>
                  <select
                    value={searchFilters.category}
                    onChange={(e) => setSearchFilters({ ...searchFilters, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid var(--line)', fontSize: '13.5px', fontWeight: 600, background: '#FFFFFF' }}
                  >
                    <option value="4-wheeler">🚗 4-Wheeler Car</option>
                    <option value="2-wheeler">🏍️ 2-Wheeler (Bike/Scooter)</option>
                    <option value="commercial">🚐 Commercial LMV</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--muted)', marginBottom: '4px' }}>Transmission</label>
                  <select
                    value={searchFilters.transmission}
                    onChange={(e) => setSearchFilters({ ...searchFilters, transmission: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid var(--line)', fontSize: '13.5px', fontWeight: 600, background: '#FFFFFF' }}
                  >
                    <option value="manual">Manual (Clutch/Gear)</option>
                    <option value="automatic">Automatic / EV</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '11px 22px', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>Search</span> →
                </button>
              </form>
            </div>

            {/* Micro Highlights */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>
              <span>✓ Dual-Control Safety Fleet</span>
              <span>✓ Female Instructors Available</span>
              <span>✓ Instant Wallet Refunds</span>
            </div>
          </div>

          {/* Right Column: Interactive Live Simulation Card */}
          <div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(16px)',
                border: '1.5px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                    🚗
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: '#FFFFFF' }}>Royal Crown Driving Academy</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Verified RTO Academy · Indiranagar Hub</div>
                  </div>
                </div>

                <span style={{ background: '#22C55E', color: '#FFFFFF', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 800 }}>
                  ★ 4.9 (420+ Reviews)
                </span>
              </div>

              {/* Course Detail Box */}
              <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12.5px' }}>Course Package:</span>
                  <strong style={{ color: '#FDE047', fontSize: '13px' }}>4-Wheeler Car Mastery (15 Days)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12.5px' }}>Dual-Control Vehicle:</span>
                  <strong style={{ color: '#FFFFFF', fontSize: '13px' }}>Maruti Swift (KA-01-MJ-8821)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12.5px' }}>Assigned Instructor:</span>
                  <strong style={{ color: '#FFFFFF', fontSize: '13px' }}>Vikram Singh (10+ Yrs Exp)</strong>
                </div>

                {/* Progress Bar Simulation */}
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>Practical Milestone Progress</span>
                    <span style={{ color: '#4ADE80', fontWeight: 700 }}>Session 12 of 15 (80%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.15)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: '80%', height: '100%', background: 'linear-gradient(90deg, #F97316 0%, #22C55E 100%)', borderRadius: '999px' }} />
                  </div>
                </div>
              </div>

              {/* Action Simulation Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <Link
                  to="/learner"
                  className="btn"
                  style={{ background: '#FFFFFF', color: 'var(--ink)', textAlign: 'center', padding: '10px', fontSize: '13px', fontWeight: 700, borderRadius: '8px' }}
                >
                  📅 Book Slot Now
                </Link>
                <Link
                  to="/aptitude-test"
                  className="btn"
                  style={{ background: '#F97316', color: '#FFFFFF', textAlign: 'center', padding: '10px', fontSize: '13px', fontWeight: 700, borderRadius: '8px' }}
                >
                  📝 Mock Test (Free)
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LIVE PLATFORM IMPACT & STATS MARQUEE */}
      <section className="stats-strip">
        <div className="stats-grid">
          <div className="stat-item">
            <h3>50,000+</h3>
            <p>Certified Safe Drivers Trained</p>
          </div>
          <div className="stat-item">
            <h3>1,200+</h3>
            <p>RTO Verified Driving Academies</p>
          </div>
          <div className="stat-item">
            <h3>98.4%</h3>
            <p>First-Attempt RTO Test Pass Rate</p>
          </div>
          <div className="stat-item">
            <h3>100%</h3>
            <p>Dual-Control Safety Fleet Compliance</p>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE RTO TRAFFIC RULE & ROAD SIGN QUIZ SIMULATOR */}
      <section style={{ padding: '70px 24px', background: '#F8FAFC' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              🧠 TEST YOUR DRIVING KNOWLEDGE
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '8px 0 10px', color: 'var(--ink)' }}>
              Interactive RTO Road Sign & Traffic Simulator
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '15px', maxWidth: '600px', margin: '0 auto' }}>
              Over 40% of learner permit applicants fail the written computer test due to sign confusion. Test your reflexes below:
            </p>
          </div>

          <div className="quiz-widget">
            {/* Question Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--line)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '32px' }}>{quizQuestions[currentQuizIndex].signEmoji}</span>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 700 }}>
                    Question {currentQuizIndex + 1} of {quizQuestions.length} · {quizQuestions[currentQuizIndex].signName}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ink)', marginTop: '2px' }}>
                    {quizQuestions[currentQuizIndex].question}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ background: 'var(--primary-tint)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 800 }}>
                  Score: {quizScore}
                </span>
              </div>
            </div>

            {/* Options Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              {quizQuestions[currentQuizIndex].options.map((opt, idx) => {
                let btnClass = 'quiz-option-btn';
                if (quizAnswered) {
                  if (opt.correct) btnClass += ' correct';
                  else if (selectedQuizOption === idx) btnClass += ' wrong';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={quizAnswered}
                    onClick={() => handleQuizSelect(idx, opt.correct)}
                    className={btnClass}
                  >
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation & Next Question */}
            {quizAnswered && (
              <div
                style={{
                  background: selectedQuizOption !== null && quizQuestions[currentQuizIndex].options[selectedQuizOption].correct ? '#F0FDF4' : '#FEF2F2',
                  border: `1.5px solid ${selectedQuizOption !== null && quizQuestions[currentQuizIndex].options[selectedQuizOption].correct ? '#86EFAC' : '#FCA5A5'}`,
                  borderRadius: '10px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: selectedQuizOption !== null && quizQuestions[currentQuizIndex].options[selectedQuizOption].correct ? '#15803D' : '#B91C1C' }}>
                    {selectedQuizOption !== null && quizQuestions[currentQuizIndex].options[selectedQuizOption].correct ? '✓ Correct Answer!' : '✗ Incorrect!'}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '4px', maxWidth: '650px' }}>
                    {quizQuestions[currentQuizIndex].explanation}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleNextQuizQuestion}
                    className="btn btn-primary btn-sm"
                    style={{ padding: '8px 16px', fontWeight: 700 }}
                  >
                    Next Question →
                  </button>
                  <Link
                    to="/aptitude-test"
                    className="btn btn-outline btn-sm"
                    style={{ background: '#FFFFFF', padding: '8px 16px', fontWeight: 700 }}
                  >
                    Take Full 20-Q Mock Test
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. COMPREHENSIVE 6-STAGE RTO CURRICULUM STEPPER */}
      <section style={{ padding: '80px 24px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              📚 STANDARDIZED TRAINING ROADMAP
            </span>
            <h2 style={{ fontSize: '34px', fontWeight: 800, margin: '8px 0 10px', color: 'var(--ink)' }}>
              From Zero Knowledge to Certified Driver in 6 Stages
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '15px', maxWidth: '640px', margin: '0 auto' }}>
              Unlike random driving instructors, all DriveLearn India academies follow the strict Central Motor Vehicles Rules (CMVR) training syllabus.
            </p>
          </div>

          {/* Stepper Tabs Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '8px',
              marginBottom: '32px',
              background: 'var(--paper)',
              padding: '6px',
              borderRadius: '14px',
              border: '1px solid var(--line)',
            }}
          >
            {curriculumStages.map((stage, sIdx) => {
              const isActive = activeCurriculumStage === sIdx;
              return (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => setActiveCurriculumStage(sIdx)}
                  style={{
                    background: isActive ? '#FFFFFF' : 'transparent',
                    border: isActive ? '1.5px solid var(--primary)' : 'none',
                    borderRadius: '10px',
                    padding: '12px 8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>{stage.icon}</div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: isActive ? 'var(--primary)' : 'var(--muted)' }}>
                    {stage.stage}
                  </div>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--ink)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {stage.title.split(' ')[0]} {stage.title.split(' ')[1]}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Stage Detail Showcase Card */}
          {(() => {
            const cur = curriculumStages[activeCurriculumStage];
            return (
              <div
                style={{
                  background: 'linear-gradient(135deg, #1C1F22 0%, #2A323D 100%)',
                  color: '#FFFFFF',
                  borderRadius: '18px',
                  padding: '36px',
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 0.8fr',
                  gap: '36px',
                  alignItems: 'center',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.18)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <span style={{ background: 'var(--primary)', color: '#FFFFFF', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 800 }}>
                      {cur.stage} · {cur.duration}
                    </span>
                    <span style={{ fontSize: '24px' }}>{cur.icon}</span>
                  </div>

                  <h3 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 10px', color: '#FFFFFF' }}>
                    {cur.title}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14.5px', marginBottom: '24px', lineHeight: 1.5 }}>
                    {cur.summary}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {cur.skills.map((skill, skIdx) => (
                      <div key={skIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#E2E8F0' }}>
                        <span style={{ color: '#4ADE80', fontWeight: 800 }}>✓</span>
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Action Card */}
                <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', padding: '24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>🚗</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>Ready to master this stage?</div>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>
                    Enroll in an accredited academy in your area with transparent pricing and dual-control protection.
                  </p>
                  <Link to="/learner" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontWeight: 800, display: 'inline-block' }}>
                    Browse Accredited Courses →
                  </Link>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* 7. WHY DRIVELEARN VS LOCAL UNVERIFIED AGENTS (SIDE-BY-SIDE) */}
      <section style={{ padding: '80px 24px', background: '#F8FAFC' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              ⚖️ THE DRIVELEARN DIFFERENCE
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '8px 0 10px', color: 'var(--ink)' }}>
              DriveLearn India vs. Traditional Local Driving Schools
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '15px' }}>
              See why over 50,000 learners choose our verified digital network:
            </p>
          </div>

          <table className="comparison-table">
            <thead>
              <tr>
                <th style={{ width: '38%' }}>Features & Safety Standards</th>
                <th style={{ width: '31%', color: 'var(--primary)', background: '#FBE9EA' }}>
                  🚗 DriveLearn India Network
                </th>
                <th style={{ width: '31%', color: 'var(--muted)' }}>
                  🏚️ Traditional Local Agents
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Dual-Control Fleet Verification</strong></td>
                <td style={{ color: '#15803D', fontWeight: 700 }}>✓ 100% Certified Dual-Brakes</td>
                <td style={{ color: '#B91C1C' }}>✗ Often unverified private cars</td>
              </tr>
              <tr>
                <td><strong>Slot Booking & Rescheduling</strong></td>
                <td style={{ color: '#15803D', fontWeight: 700 }}>✓ 1-Click Online Slot Reschedule</td>
                <td style={{ color: '#B91C1C' }}>✗ Rigid timings, missed slot lost</td>
              </tr>
              <tr>
                <td><strong>Digital Attendance & Progress Logs</strong></td>
                <td style={{ color: '#15803D', fontWeight: 700 }}>✓ Live session logs with milestone notes</td>
                <td style={{ color: '#B91C1C' }}>✗ Manual paper sheets, frequent cuts</td>
              </tr>
              <tr>
                <td><strong>Instructor Replacement Guarantee</strong></td>
                <td style={{ color: '#15803D', fontWeight: 700 }}>✓ Instant instructor change on request</td>
                <td style={{ color: '#B91C1C' }}>✗ Bound to single instructor</td>
              </tr>
              <tr>
                <td><strong>Payment Protection & Wallet Refunds</strong></td>
                <td style={{ color: '#15803D', fontWeight: 700 }}>✓ Escrow Razorpay & Instant Refunds</td>
                <td style={{ color: '#B91C1C' }}>✗ Cash-only, non-refundable</td>
              </tr>
              <tr>
                <td><strong>Official RTO Form 5 Certificate</strong></td>
                <td style={{ color: '#15803D', fontWeight: 700 }}>✓ Tamper-proof Digital PDF & Serial</td>
                <td style={{ color: '#B91C1C' }}>✗ Delayed or unaccredited slips</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 8. PARTNER WITH DRIVELEARN (FOR SCHOOL OWNERS & INSTRUCTORS) */}
      <section style={{ padding: '70px 24px', background: '#FFFFFF' }}>
        <div
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            background: 'linear-gradient(135deg, #0B192C 0%, #1E3A8A 100%)',
            color: '#FFFFFF',
            borderRadius: '20px',
            padding: '48px',
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: '36px',
            alignItems: 'center',
            boxShadow: '0 20px 48px rgba(0,0,0,0.16)',
          }}
        >
          <div>
            <span style={{ background: '#F97316', color: '#FFFFFF', padding: '4px 12px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase' }}>
              🏢 FOR DRIVING SCHOOL OWNERS
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF', margin: '14px 0 12px' }}>
              Digitize Your Driving Academy & Grow 3X Faster
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
              Receive verified student bookings, manage multi-branch instructors, generate automated availability slots, track digital attendance, and issue government-compliant Form 5 certificates.
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link to="/school/register" className="btn btn-primary" style={{ padding: '12px 24px', fontWeight: 800 }}>
                Register Your Academy (Free) →
              </Link>
              <Link to="/login" className="btn btn-outline" style={{ background: '#FFFFFF', color: '#0B192C', padding: '12px 24px', fontWeight: 800 }}>
                Owner Portal Login
              </Link>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#FDE047', marginBottom: '14px' }}>
              ⚡ What You Get as an Accredited Partner:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: '#E2E8F0' }}>
              <div>✓ <strong>Direct Online Bookings</strong> with zero marketing cost</div>
              <div>✓ <strong>Automated Slot Scheduler</strong> with 15-min buffers</div>
              <div>✓ <strong>Multi-Vehicle Fleet Tracking</strong> (Manual / Auto / 2W)</div>
              <div>✓ <strong>Staff Instructor Performance</strong> & student review tracking</div>
              <div>✓ <strong>Official Digital Invoicing & GST Compliance</strong></div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. INTERACTIVE FAQ ACCORDION */}
      <section style={{ padding: '80px 24px', background: '#F8FAFC' }}>
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              ❓ FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '8px 0 10px', color: 'var(--ink)' }}>
              Everything You Need to Know
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '15px' }}>
              Clear answers on course enrollment, RTO test guidelines, and payments.
            </p>
          </div>

          <div>
            {faqs.map((faq, fIdx) => {
              const isOpen = openFaq === fIdx;
              return (
                <div key={fIdx} className="faq-item">
                  <div
                    className="faq-header"
                    onClick={() => setOpenFaq(isOpen ? null : fIdx)}
                  >
                    <span>{faq.q}</span>
                    <span style={{ fontSize: '18px', color: 'var(--primary)', fontWeight: 800 }}>
                      {isOpen ? '−' : '+'}
                    </span>
                  </div>
                  {isOpen && (
                    <div className="faq-body">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. FINAL ACTION BANNER */}
      <section style={{ padding: '60px 24px', background: 'linear-gradient(135deg, #B3182F 0%, #7A0E1F 100%)', color: '#FFFFFF', textAlign: 'center' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 900, color: '#FFFFFF', marginBottom: '12px' }}>
            Ready to Get Behind the Wheel?
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.85)', marginBottom: '28px' }}>
            Join 50,000+ confident drivers. Claim your ₹15 introductory wallet bonus and book your first lesson slot today.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn" style={{ background: '#FFFFFF', color: '#B3182F', padding: '14px 32px', fontWeight: 800, fontSize: '15px', borderRadius: '8px' }}>
              Claim ₹15 Bonus & Sign Up →
            </Link>
            <Link to="/aptitude-test" className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1.5px solid rgba(255,255,255,0.4)', padding: '14px 28px', fontWeight: 800, fontSize: '15px', borderRadius: '8px' }}>
              Take Free Mock RTO Test
            </Link>
          </div>
        </div>
      </section>

      {/* 11. MEGA FOOTER */}
      <Footer />
    </div>
  );
};

export default Home;
