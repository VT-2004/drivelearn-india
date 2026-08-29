import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { searchSchools } from '../../services/api';
import {
  IconCar,
  IconSteeringWheel,
  IconShieldCheck,
  IconMapPin,
  IconCalendar,
  IconClock,
  IconAward,
  IconStar,
  IconCheckCircle,
  IconArrowRight,
  IconUser,
  IconUserCheck,
  IconPhone,
  IconBookOpen,
  IconAlertCircle,
  IconCheck,
  IconWallet,
  IconSearch,
  IconSliders,
  IconBuilding,
  IconHelpCircle,
  IconChevronDown,
  SignStop,
  SignGiveWay,
  SignNoStopping,
  SignSpeedLimit50,
} from '../../components/Icons';
import '../../styles/landing.css';

const Home = () => {
  const navigate = useNavigate();

  // Search Filters State
  const [searchFilters, setSearchFilters] = useState({
    city: 'Bengaluru',
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
      SignComponent: SignStop,
      signName: 'Octagonal Red Sign ("STOP")',
      question: 'What is the mandatory action upon approaching an octagonal STOP sign at an Indian intersection?',
      options: [
        { text: 'Slow down to 10 km/h and proceed if the cross-traffic looks clear', correct: false },
        { text: 'Come to a complete standstill behind the stop line, observe both sides, and yield before moving', correct: true },
        { text: 'Continuous horn honking while accelerating across the junction', correct: false },
        { text: 'Stop only when a traffic police officer is physically present', correct: false },
      ],
      explanation: 'Under Section 119 of the Motor Vehicles Act, a STOP sign requires a complete halt of wheels before the painted line, regardless of road density.',
    },
    {
      id: 2,
      SignComponent: SignGiveWay,
      signName: 'Inverted Triangular Sign ("GIVE WAY")',
      question: 'When approaching a multi-lane roundabout with a "GIVE WAY" triangular sign, who has legal right of way?',
      options: [
        { text: 'You, because you are entering from the main arterial road', correct: false },
        { text: 'Vehicles already circulating inside the roundabout from your right', correct: true },
        { text: 'Heaviest commercial vehicles always take priority', correct: false },
        { text: 'Whichever vehicle flashes their headlights first', correct: false },
      ],
      explanation: 'Under CMVR traffic rules, entering traffic must yield to circulating vehicles on their right inside roundabouts and junctions.',
    },
    {
      id: 3,
      SignComponent: SignNoStopping,
      signName: 'Blue Disc with Red Border & Red Cross ("NO STOPPING")',
      question: 'How does a "No Stopping / Standing" sign differ from a standard "No Parking" sign?',
      options: [
        { text: 'They are identical and carry the same spot fines', correct: false },
        { text: 'No Parking allows momentary passenger pick/drop; No Stopping prohibits halting even for 1 second', correct: true },
        { text: 'No Stopping applies exclusively to heavy commercial trucks and buses', correct: false },
        { text: 'No Stopping is enforced only after sundown', correct: false },
      ],
      explanation: 'The blue disc with a red cross (No Stopping/Standing) strictly prohibits any halt—including dropping passengers or waiting at the kerb.',
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
              address: '100ft Road, Indiranagar',
              rating: 4.9,
              reviewsCount: 420,
              coursesCount: 4,
              price: 4999,
              vehiclesCount: 6,
              verified: true,
              image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=70',
            },
            {
              id: 2,
              name: 'Apex Motor Training Institute',
              city: 'Bengaluru, Karnataka',
              address: '5th Block, Koramangala',
              rating: 4.8,
              reviewsCount: 310,
              coursesCount: 3,
              price: 4499,
              vehiclesCount: 5,
              verified: true,
              image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=70',
            },
            {
              id: 3,
              name: 'National Safe Drive Academy',
              city: 'Bengaluru, Karnataka',
              address: 'Outer Ring Road, Bellandur',
              rating: 4.7,
              reviewsCount: 285,
              coursesCount: 5,
              price: 5299,
              vehiclesCount: 8,
              verified: true,
              image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=70',
            },
          ]);
        }
      })
      .catch(() => {
        setFeaturedSchools([]);
      })
      .finally(() => setLoadingSchools(false));
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    navigate(`/learner?city=${encodeURIComponent(searchFilters.city)}&category=${encodeURIComponent(searchFilters.category)}&transmission=${encodeURIComponent(searchFilters.transmission)}`);
  };

  const handleQuizSelect = (optionIndex, isCorrect) => {
    if (quizAnswered) return;
    setSelectedQuizOption(optionIndex);
    setQuizAnswered(true);
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    setSelectedQuizOption(null);
    setQuizAnswered(false);
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
    } else {
      setCurrentQuizIndex(0);
    }
  };

  // 4-Phase / 14-Module CMVR Training Syllabus
  const curriculumPhases = [
    {
      phase: 'Phase 01',
      title: 'Cockpit Orientation & Clutch Balance',
      days: 'Days 1 to 8',
      summary: 'Build calm pedal reflex before touching public roads. Master the clutch bite point without stalling.',
      skills: [
        'ABC pedal posture, dual-control brake safety orientation & blind-spot mirror set',
        'Bite-point clutch feathering & stall-free rolling starts on flat ground',
        'Push-pull steering slalom, lane centering & 1st-to-2nd gear shift timing',
        'Closed-yard straight-line reversing with passenger shoulder checks',
      ],
    },
    {
      phase: 'Phase 02',
      title: 'Official RTO 8-Track & H-Bay Parking',
      days: 'Days 9 to 16',
      summary: 'Tackle the exact automated driving test track dimensions required by RTO inspectors.',
      skills: [
        'Figure-8 track continuous steering loop without touching sensor kerbs',
        '90-degree H-track bay reverse parking inside official yellow track boundaries',
        'Kerb-side parallel parking and tight 45-degree basement parking slots',
        'Handbrake hill-hold on steep flyover gradients with zero rollback',
      ],
    },
    {
      phase: 'Phase 03',
      title: 'Suburban Arterials & Dense Rush Hour',
      days: 'Days 17 to 24',
      summary: 'Transition to busy Indian traffic signals, auto-rickshaw blindspots, and flyover merging.',
      skills: [
        'Speed management and Mirror-Signal-Manoeuvre (MSM) lane discipline',
        'Dense rush-hour stop-and-crawl in 1st/2nd gear across pedestrian intersections',
        'Multi-lane roundabout lane choices and right-of-way priority rules',
        'Safe highway speed merging, overtaking clearance, and fastag toll lane approaches',
      ],
    },
    {
      phase: 'Phase 04',
      title: 'Night Hazards, Wet Rain & RTO Mock Exam',
      days: 'Days 25 to 28',
      summary: 'Final refinement under low-visibility conditions and complete mock driving test evaluation.',
      skills: [
        'High-beam glare mitigation, dipping headlights, and wet road anti-skid braking',
        'Panic stop hazard drill from 40 km/h with straight-line chassis control',
        'Full RTO automated test track rehearsal with simulated inspector scorecard',
        'CMVR Form 5 Driving School Training Certificate graduation sign-off',
      ],
    },
  ];

  // Learner Stories (Humanized Reviews)
  const learnerReviews = [
    {
      name: 'Pooja R.',
      role: 'Software Engineer',
      location: 'Indiranagar, Bengaluru',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      story: 'I was terrified of stalling at Bengaluru traffic signals. My instructor, Suresh, spent the first 4 sessions solely on clutch bite-point control in a closed yard. Passed my RTO test at Kasturi Nagar in my very first attempt with zero negative points!',
      course: '28-Day Comprehensive Car Course',
    },
    {
      name: 'Arjun Mehta',
      role: 'Product Designer',
      location: 'Kothrud, Pune',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      story: 'The online slot rescheduling is a lifesaver. When my office schedule changed, I could move my 7:00 AM slot to 5:30 PM with one tap. The dual-control Maruti Swift felt extremely safe even on crowded FC Road traffic.',
      course: '15-Day Fast-Track Manual',
    },
    {
      name: 'Sneha Kulkarni',
      role: 'Doctor',
      location: 'Dwarka, Delhi NCR',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
      story: 'Having a dedicated female instructor was important for me. DriveLearn matched me with Ananya at Apex Academy. She patiently taught me parallel parking and flyover slope hold without raising her voice once.',
      course: '21-Day Automatic / EV Course',
    },
  ];

  // FAQ Accordion Content
  const faqs = [
    {
      q: 'How does DriveLearn India verify that a driving school is genuine?',
      a: 'Every academy listed on DriveLearn must submit physical verification of their RTO Accreditation License, commercial dual-control vehicle registration certificates, certified instructor badges, and dedicated off-road training yard facilities.',
    },
    {
      q: 'What is the official RTO Form 5 certificate and why do I need it?',
      a: 'Form 5 is the statutory driving school completion certificate mandated under Rule 27 of the Central Motor Vehicles Rules (CMVR). When you complete your course with an accredited DriveLearn partner school, a tamper-proof digital Form 5 with a verified serial number is generated for your RTO permanent license application.',
    },
    {
      q: 'What happens if I miss a scheduled driving session?',
      a: 'Unlike unorganized instructors where a missed lesson is simply lost, our platform allows you to reschedule any upcoming session directly from your learner portal up to 4 hours before the slot at zero additional fee.',
    },
    {
      q: 'Can I choose a female instructor or practice in an automatic car?',
      a: 'Yes. When searching for academies in your locality, you can filter specifically for academies offering certified female instructors and choose between manual transmission, automatic torque-converter/CVT, or modern EV training fleets.',
    },
    {
      q: 'Are there any hidden costs for fuel, yard maintenance, or test day vehicle hire?',
      a: 'No. All packages on DriveLearn India are 100% all-inclusive. Fuel costs, vehicle dual-pedal maintenance, instructor fees, and training track access are fully covered in the listed price.',
    },
  ];

  return (
    <div style={{ background: '#FAF8F5', minHeight: '100vh', color: 'var(--ink)' }}>
      <Navbar />

      {/* 1. HERO SECTION: HANDCRAFTED, AUTHENTIC & GROUNDED */}
      <section
        style={{
          background: 'linear-gradient(145deg, #101622 0%, #1A2332 55%, #121824 100%)',
          color: '#FFFFFF',
          padding: '60px 24px 76px',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Subtle Architectural Grid Lines */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.04,
            backgroundImage: 'radial-gradient(#FFFFFF 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '1220px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.18fr 0.82fr', gap: '48px', alignItems: 'center', position: 'relative', zIndex: 2 }}>
          {/* Left Column: Authentic Copy & Search Engine */}
          <div>
            {/* Trust Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#E2E8F0',
                marginBottom: '20px',
              }}
            >
              <IconShieldCheck size={16} color="#4ADE80" />
              <span>Ministry of Road Transport & Highways (MoRTH) Standardized Curriculum</span>
            </div>

            <h1
              style={{
                fontSize: '44px',
                fontWeight: 900,
                lineHeight: 1.15,
                color: '#FFFFFF',
                margin: '0 0 16px',
                letterSpacing: '-0.025em',
              }}
            >
              Learn driving on real roads.<br />
              <span style={{ color: '#F59E0B' }}>
                With instructors who teach with patience.
              </span>
            </h1>

            <p
              style={{
                fontSize: '16px',
                color: '#CBD5E1',
                lineHeight: 1.6,
                marginBottom: '28px',
                maxWidth: '560px',
              }}
            >
              Compare licensed RTO driving academies, train on verified dual-control cars, practice on official 8-tracks, and track all 14 practical skills to earn your official Form 5 certificate.
            </p>

            {/* Tactile Search Bar */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                color: 'var(--ink)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <IconSearch size={16} color="var(--primary)" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  FIND LICENSED DRIVING ACADEMIES
                </span>
              </div>

              <form onSubmit={handleHeroSearch} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    City / Locality
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={searchFilters.city}
                      onChange={(e) => setSearchFilters({ ...searchFilters, city: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        background: '#FFFFFF',
                        color: 'var(--ink)',
                        outline: 'none',
                      }}
                    >
                      <option value="Bengaluru">Bengaluru (KA)</option>
                      <option value="Mumbai">Mumbai (MH)</option>
                      <option value="Delhi">Delhi NCR</option>
                      <option value="Pune">Pune (MH)</option>
                      <option value="Hyderabad">Hyderabad (TS)</option>
                      <option value="Chennai">Chennai (TN)</option>
                      <option value="Kolkata">Kolkata (WB)</option>
                      <option value="Ahmedabad">Ahmedabad (GJ)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Vehicle Type
                  </label>
                  <select
                    value={searchFilters.category}
                    onChange={(e) => setSearchFilters({ ...searchFilters, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #E2E8F0',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      background: '#FFFFFF',
                      color: 'var(--ink)',
                      outline: 'none',
                    }}
                  >
                    <option value="4-wheeler">4-Wheeler Car</option>
                    <option value="2-wheeler">2-Wheeler (MCWG)</option>
                    <option value="commercial">Commercial LMV</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Transmission
                  </label>
                  <select
                    value={searchFilters.transmission}
                    onChange={(e) => setSearchFilters({ ...searchFilters, transmission: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #E2E8F0',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      background: '#FFFFFF',
                      color: 'var(--ink)',
                      outline: 'none',
                    }}
                  >
                    <option value="manual">Manual (Clutch & Gear)</option>
                    <option value="automatic">Automatic / EV</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    padding: '11px 22px',
                    fontWeight: 800,
                    fontSize: '13.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    height: '42px',
                  }}
                >
                  <span>Search</span>
                  <IconArrowRight size={16} />
                </button>
              </form>
            </div>

            {/* Humanized Trust Signals */}
            <div
              style={{
                display: 'flex',
                gap: '20px',
                marginTop: '20px',
                fontSize: '12.5px',
                color: '#CBD5E1',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <IconCheck size={15} color="#4ADE80" strokeWidth={2.5} /> Dual-Control Safety Pedals
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <IconCheck size={15} color="#4ADE80" strokeWidth={2.5} /> Lady Instructors on Request
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <IconCheck size={15} color="#4ADE80" strokeWidth={2.5} /> Instant Wallet Refunds
              </span>
            </div>
          </div>

          {/* Right Column: Authentic Academy Training Docket Simulation */}
          <div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: '18px',
                padding: '24px',
                boxShadow: '0 24px 48px rgba(0,0,0,0.35)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #B3182F 0%, #E1712E 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      flexShrink: 0,
                    }}
                  >
                    <IconCar size={24} color="#FFFFFF" strokeWidth={2} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: '#FFFFFF' }}>
                      Royal Crown Driving Academy
                    </div>
                    <div style={{ fontSize: '12px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <IconMapPin size={13} color="#94A3B8" /> Indiranagar, Bengaluru · RTO KA-03 Accredited
                    </div>
                  </div>
                </div>

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ADE80', padding: '4px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 800 }}>
                  <IconStar size={12} color="#4ADE80" /> 4.9 (420+ Reviews)
                </div>
              </div>

              {/* Course Docket Box */}
              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '12.5px' }}>
                  <span style={{ color: '#94A3B8' }}>Package:</span>
                  <strong style={{ color: '#FDE047' }}>28-Day Comprehensive Car Course</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '12.5px' }}>
                  <span style={{ color: '#94A3B8' }}>Training Fleet:</span>
                  <strong style={{ color: '#FFFFFF' }}>Maruti Swift Dual-Brake (KA-03-MB-4102)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '12.5px' }}>
                  <span style={{ color: '#94A3B8' }}>Assigned Instructor:</span>
                  <strong style={{ color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <IconUserCheck size={14} color="#4ADE80" /> Suresh Kumar (9 Yrs Exp)
                  </strong>
                </div>

                {/* Milestone Progress Bar */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '6px' }}>
                    <span style={{ color: '#CBD5E1' }}>14-Module Practical Progress</span>
                    <span style={{ color: '#4ADE80', fontWeight: 800 }}>8 of 14 Cleared (60%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.15)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: '60%', height: '100%', background: 'linear-gradient(90deg, #E1712E 0%, #22C55E 100%)', borderRadius: '999px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#94A3B8', marginTop: '6px' }}>
                    <span>✓ 8-Track Cleared</span>
                    <span>✓ H-Bay Cleared</span>
                    <span style={{ color: '#FDE047' }}>⏳ Next: Flyover Slope</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <Link
                  to="/learner"
                  className="btn"
                  style={{
                    background: '#FFFFFF',
                    color: '#0F172A',
                    textAlign: 'center',
                    padding: '10px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <IconCalendar size={14} /> Book Training Slot
                </Link>
                <Link
                  to="/aptitude-test"
                  className="btn"
                  style={{
                    background: 'linear-gradient(135deg, #B3182F 0%, #8B0E20 100%)',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    padding: '10px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <IconBookOpen size={14} /> Free Mock Test
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REAL IMPACT NUMBERS STRIP */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid var(--line)', padding: '36px 24px' }}>
        <div
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '32px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
              <IconAward size={24} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>50,000+</div>
              <div style={{ fontSize: '12.5px', color: 'var(--muted)', fontWeight: 600 }}>Certified Drivers Graduated</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--orange-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--orange)', flexShrink: 0 }}>
              <IconBuilding size={24} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>1,200+</div>
              <div style={{ fontSize: '12.5px', color: 'var(--muted)', fontWeight: 600 }}>RTO-Accredited Academies</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803D', flexShrink: 0 }}>
              <IconCheckCircle size={24} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>98.4%</div>
              <div style={{ fontSize: '12.5px', color: 'var(--muted)', fontWeight: 600 }}>First-Attempt RTO Test Pass Rate</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A', flexShrink: 0 }}>
              <IconCompass size={24} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>40+ Cities</div>
              <div style={{ fontSize: '12.5px', color: 'var(--muted)', fontWeight: 600 }}>Across 18 Indian States</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE RTO ROAD SIGN SIMULATOR */}
      <section style={{ padding: '72px 24px', background: '#F4F5F2' }}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '11.5px', letterSpacing: '1.2px', textTransform: 'uppercase', background: 'var(--primary-tint)', padding: '4px 12px', borderRadius: '999px' }}>
              PRACTICE OFFICIAL RTO QUESTIONS
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: 900, margin: '10px 0 8px', color: 'var(--ink)', letterSpacing: '-0.02em' }}>
              Interactive Road Sign & Traffic Rule Simulator
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '14.5px', maxWidth: '620px', margin: '0 auto' }}>
              Over 40% of learner permit applicants fail the computer aptitude test on road sign technicalities. Test your reflexes on authentic RTO test questions:
            </p>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid var(--line)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
            }}
          >
            {/* Question Header */}
            {(() => {
              const currentQ = quizQuestions[currentQuizIndex];
              const SignComp = currentQ.SignComponent;
              return (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', borderBottom: '1px solid var(--line)', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ flexShrink: 0, padding: '4px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                        <SignComp size={54} />
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 700 }}>
                          Question {currentQuizIndex + 1} of {quizQuestions.length} · {currentQ.signName}
                        </div>
                        <div style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--ink)', marginTop: '2px', lineHeight: 1.4 }}>
                          {currentQ.question}
                        </div>
                      </div>
                    </div>

                    <span style={{ background: 'var(--primary-tint)', color: 'var(--primary)', padding: '5px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 800 }}>
                      Score: {quizScore} / {quizQuestions.length}
                    </span>
                  </div>

                  {/* Options Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                    {currentQ.options.map((opt, idx) => {
                      const isSelected = selectedQuizOption === idx;
                      let bg = '#FAFAFA';
                      let borderColor = '#E2E8F0';
                      let textColor = 'var(--ink)';

                      if (quizAnswered) {
                        if (opt.correct) {
                          bg = '#F0FDF4';
                          borderColor = '#86EFAC';
                          textColor = '#15803D';
                        } else if (isSelected) {
                          bg = '#FEF2F2';
                          borderColor = '#FCA5A5';
                          textColor = '#B91C1C';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={quizAnswered}
                          onClick={() => handleQuizSelect(idx, opt.correct)}
                          style={{
                            background: bg,
                            border: `1.5px solid ${borderColor}`,
                            borderRadius: '10px',
                            padding: '14px 16px',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: quizAnswered ? 'default' : 'pointer',
                            color: textColor,
                            fontSize: '13.5px',
                            fontWeight: 600,
                            lineHeight: 1.4,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background: '#FFFFFF',
                              border: '1px solid #CBD5E1',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 800,
                              flexShrink: 0,
                            }}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation & Next */}
                  {quizAnswered && (
                    <div
                      style={{
                        background: selectedQuizOption !== null && currentQ.options[selectedQuizOption].correct ? '#F0FDF4' : '#FEF2F2',
                        border: `1.5px solid ${selectedQuizOption !== null && currentQ.options[selectedQuizOption].correct ? '#86EFAC' : '#FCA5A5'}`,
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
                        <div style={{ fontWeight: 800, fontSize: '13.5px', color: selectedQuizOption !== null && currentQ.options[selectedQuizOption].correct ? '#15803D' : '#B91C1C' }}>
                          {selectedQuizOption !== null && currentQ.options[selectedQuizOption].correct ? '✓ Correct! Excellent road reflex.' : '✗ Incorrect observation.'}
                        </div>
                        <div style={{ fontSize: '12.5px', color: 'var(--ink-soft)', marginTop: '4px', maxWidth: '620px' }}>
                          {currentQ.explanation}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={handleNextQuizQuestion}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '8px 16px', fontWeight: 700, fontSize: '12.5px' }}
                        >
                          Next Question →
                        </button>
                        <Link
                          to="/aptitude-test"
                          className="btn btn-outline btn-sm"
                          style={{ background: '#FFFFFF', padding: '8px 16px', fontWeight: 700, fontSize: '12.5px' }}
                        >
                          Full 20-Q Exam
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* 4. 4-PHASE / 14-MODULE CMVR STANDARDIZED SYLLABUS */}
      <section style={{ padding: '80px 24px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '11.5px', letterSpacing: '1.2px', textTransform: 'uppercase', background: 'var(--primary-tint)', padding: '4px 12px', borderRadius: '999px' }}>
              CMVR FORM 5 SYLLABUS
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: 900, margin: '10px 0 8px', color: 'var(--ink)', letterSpacing: '-0.02em' }}>
              Structured 28-Day Practical Roadmap
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '15px', maxWidth: '600px', margin: '0 auto' }}>
              Unlike unorganized drivers who just tell you to "press accelerator", every DriveLearn academy breaks your training into 4 structured stages:
            </p>
          </div>

          {/* Phase Stepper Selectors */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '12px',
              marginBottom: '28px',
            }}
          >
            {curriculumPhases.map((phase, pIdx) => {
              const isActive = activeCurriculumStage === pIdx;
              return (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => setActiveCurriculumStage(pIdx)}
                  style={{
                    background: isActive ? '#FFFFFF' : '#F8FAFC',
                    border: isActive ? '2px solid var(--primary)' : '1px solid var(--line)',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 6px 18px rgba(179, 24, 47, 0.12)' : 'none',
                    transition: 'all 0.18s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: isActive ? 'var(--primary)' : 'var(--muted)', textTransform: 'uppercase' }}>
                      {phase.phase}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                      {phase.days}
                    </span>
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.3 }}>
                    {phase.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Phase Showcase */}
          {(() => {
            const activePhase = curriculumPhases[activeCurriculumStage];
            return (
              <div
                style={{
                  background: 'linear-gradient(135deg, #131A24 0%, #202B3B 100%)',
                  color: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '36px',
                  display: 'grid',
                  gridTemplateColumns: '1.25fr 0.75fr',
                  gap: '36px',
                  alignItems: 'center',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
                }}
              >
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: '#FFFFFF', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 800, marginBottom: '14px' }}>
                    <span>{activePhase.phase}</span> · <span>{activePhase.days}</span>
                  </div>

                  <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 10px', color: '#FFFFFF' }}>
                    {activePhase.title}
                  </h3>
                  <p style={{ color: '#CBD5E1', fontSize: '14px', marginBottom: '22px', lineHeight: 1.6 }}>
                    {activePhase.summary}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {activePhase.skills.map((skill, skIdx) => (
                      <div key={skIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: '#F1F5F9' }}>
                        <span style={{ color: '#4ADE80', fontWeight: 800, marginTop: '2px' }}>✓</span>
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '14px',
                    padding: '24px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <IconSteeringWheel size={26} color="#F59E0B" />
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
                    Ready to practice this stage?
                  </div>
                  <p style={{ fontSize: '12.5px', color: '#94A3B8', marginBottom: '20px', lineHeight: 1.5 }}>
                    Pick an accredited academy near you with verified dual-control cars and transparent fee structures.
                  </p>
                  <Link
                    to="/learner"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '11px', fontWeight: 800, fontSize: '13px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <span>Browse Certified Schools</span>
                    <IconArrowRight size={15} />
                  </Link>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* 5. SIDE-BY-SIDE COMPARISON: DRIVELEARN VS UNORGANIZED DRIVING AGENTS */}
      <section style={{ padding: '80px 24px', background: '#F8FAFC' }}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '38px' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '11.5px', letterSpacing: '1.2px', textTransform: 'uppercase', background: 'var(--primary-tint)', padding: '4px 12px', borderRadius: '999px' }}>
              TRANSPARENCY & STANDARDS
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: 900, margin: '10px 0 8px', color: 'var(--ink)', letterSpacing: '-0.02em' }}>
              DriveLearn India vs. Unorganized Local Driving Schools
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '14.5px' }}>
              Why over 50,000 learners chose our structured, transparent digital network:
            </p>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--line)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <table className="comparison-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--line)' }}>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: 800, color: 'var(--ink)', width: '38%' }}>
                    Safety, Standards & Service
                  </th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: 800, color: 'var(--primary)', background: '#FBE9EA', width: '31%' }}>
                    DriveLearn India Network
                  </th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: 800, color: 'var(--muted)', width: '31%' }}>
                    Unorganized Local Agents
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 700 }}>Dual-Control Vehicle Safety</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#15803D', fontWeight: 700 }}>✓ 100% Certified Dual-Brake Fleet</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#B91C1C' }}>✗ Often private cars without pedals</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 700 }}>Slot Rescheduling</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#15803D', fontWeight: 700 }}>✓ 1-Click Online Rescheduling (Free)</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#B91C1C' }}>✗ Missed slot lost completely</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 700 }}>Milestone Tracking</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#15803D', fontWeight: 700 }}>✓ 14-Module Digital Skill Scorecard</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#B91C1C' }}>✗ Paper register with cut corners</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 700 }}>Female Instructor Choice</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#15803D', fontWeight: 700 }}>✓ Certified Lady Instructors available</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#B91C1C' }}>✗ Rarely available or verified</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 700 }}>Payment Protection & Refunds</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#15803D', fontWeight: 700 }}>✓ Escrow Razorpay & Instant Refund</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#B91C1C' }}>✗ Cash-only, non-refundable</td>
                </tr>
                <tr>
                  <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 700 }}>Official CMVR Form 5</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#15803D', fontWeight: 700 }}>✓ Tamper-proof Digital PDF & Serial</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#B91C1C' }}>✗ Manual delays and re-test hassles</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. REAL LEARNER REVIEWS & STORIES */}
      <section style={{ padding: '80px 24px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '11.5px', letterSpacing: '1.2px', textTransform: 'uppercase', background: 'var(--primary-tint)', padding: '4px 12px', borderRadius: '999px' }}>
              REAL EXPERIENCES
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: 900, margin: '10px 0 8px', color: 'var(--ink)', letterSpacing: '-0.02em' }}>
              Stories from First-Time Drivers
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '14.5px' }}>
              How real students overcame driving anxiety and cleared their license test on first try:
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {learnerReviews.map((rev, rIdx) => (
              <div
                key={rIdx}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid var(--line)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B', marginBottom: '14px' }}>
                    {[...Array(rev.rating)].map((_, i) => (
                      <IconStar key={i} size={15} color="#F59E0B" />
                    ))}
                  </div>

                  <p style={{ fontSize: '13.5px', color: 'var(--ink)', lineHeight: 1.6, marginBottom: '20px', fontStyle: 'italic' }}>
                    "{rev.story}"
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--line)', paddingTop: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--ink)' }}>{rev.name}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>{rev.role} · {rev.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. ACADEMY PARTNER PORTAL CTA */}
      <section style={{ padding: '70px 24px', background: '#F8FAFC' }}>
        <div
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            background: 'linear-gradient(135deg, #101622 0%, #1E293B 100%)',
            color: '#FFFFFF',
            borderRadius: '20px',
            padding: '48px',
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: '36px',
            alignItems: 'center',
            boxShadow: '0 20px 48px rgba(0,0,0,0.12)',
          }}
        >
          <div>
            <span style={{ background: '#E1712E', color: '#FFFFFF', padding: '4px 12px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase' }}>
              FOR DRIVING SCHOOL OWNERS
            </span>
            <h2 style={{ fontSize: '30px', fontWeight: 900, color: '#FFFFFF', margin: '14px 0 12px', letterSpacing: '-0.02em' }}>
              Digitize Your Academy & Fill Your Training Slots
            </h2>
            <p style={{ color: '#CBD5E1', fontSize: '14.5px', lineHeight: 1.6, marginBottom: '24px' }}>
              Receive verified student bookings, manage instructor schedules with automated buffer slots, track digital attendance, and issue government-compliant Form 5 certificates.
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link to="/for-schools" className="btn btn-primary" style={{ padding: '12px 24px', fontWeight: 800, fontSize: '13.5px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span>List Your Academy</span>
                <IconArrowRight size={15} />
              </Link>
              <Link to="/login" className="btn btn-outline" style={{ background: '#FFFFFF', color: '#0F172A', padding: '12px 24px', fontWeight: 800, fontSize: '13.5px' }}>
                Owner Portal Login
              </Link>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#FDE047', marginBottom: '14px' }}>
              Included in DriveLearn Academy OS:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconCheck size={16} color="#4ADE80" strokeWidth={2.5} /> Direct student bookings with zero upfront setup fee
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconCheck size={16} color="#4ADE80" strokeWidth={2.5} /> Automated slot calendar with 15-min vehicle reset buffers
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconCheck size={16} color="#4ADE80" strokeWidth={2.5} /> Multi-car fleet management (Manual, Automatic, 2-Wheeler)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconCheck size={16} color="#4ADE80" strokeWidth={2.5} /> Instant digital invoicing with automated GST calculation
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FREQUENTLY ASKED QUESTIONS */}
      <section style={{ padding: '80px 24px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '38px' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '11.5px', letterSpacing: '1.2px', textTransform: 'uppercase', background: 'var(--primary-tint)', padding: '4px 12px', borderRadius: '999px' }}>
              COMMON QUESTIONS
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: 900, margin: '10px 0 8px', color: 'var(--ink)', letterSpacing: '-0.02em' }}>
              Everything You Need to Know
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '14.5px' }}>
              Direct answers about course packages, RTO testing, and safety policies:
            </p>
          </div>

          <div>
            {faqs.map((faq, fIdx) => {
              const isOpen = openFaq === fIdx;
              return (
                <div key={fIdx} className="faq-item" style={{ border: '1px solid var(--line)', borderRadius: '12px', marginBottom: '12px', background: '#FFFFFF', overflow: 'hidden' }}>
                  <div
                    className="faq-header"
                    onClick={() => setOpenFaq(isOpen ? null : fIdx)}
                    style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 700, fontSize: '14.5px', color: 'var(--ink)' }}
                  >
                    <span>{faq.q}</span>
                    <span style={{ fontSize: '18px', color: 'var(--primary)', fontWeight: 800 }}>
                      {isOpen ? '−' : '+'}
                    </span>
                  </div>
                  {isOpen && (
                    <div className="faq-body" style={{ padding: '0 22px 18px', fontSize: '13.5px', color: 'var(--ink-soft)', lineHeight: 1.6, borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. FINAL ACTION BANNER */}
      <section style={{ padding: '60px 24px', background: 'linear-gradient(135deg, #B3182F 0%, #8B0E20 100%)', color: '#FFFFFF', textAlign: 'center' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '34px', fontWeight: 900, color: '#FFFFFF', marginBottom: '12px', letterSpacing: '-0.02em' }}>
            Ready to get behind the wheel?
          </h2>
          <p style={{ fontSize: '15.5px', color: 'rgba(255,255,255,0.9)', marginBottom: '28px', lineHeight: 1.5 }}>
            Join 50,000+ confident drivers. Claim your ₹15 introductory wallet bonus and book your first lesson slot with a verified academy.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn" style={{ background: '#FFFFFF', color: '#B3182F', padding: '13px 30px', fontWeight: 800, fontSize: '14px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <IconWallet size={16} color="#B3182F" />
              <span>Claim ₹15 Bonus & Sign Up</span>
            </Link>
            <Link to="/aptitude-test" className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1.5px solid rgba(255,255,255,0.35)', padding: '13px 26px', fontWeight: 800, fontSize: '14px', borderRadius: '8px' }}>
              Take Free Mock RTO Test
            </Link>
          </div>
        </div>
      </section>

      {/* 10. MEGA FOOTER */}
      <Footer />
    </div>
  );
};

export default Home;
