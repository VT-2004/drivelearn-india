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
  IconUserCheck,
  IconBookOpen,
  IconCheck,
  IconWallet,
  IconSearch,
  IconBuilding,
  IconCompass,
  SignStop,
  SignGiveWay,
  SignNoStopping,
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
      story: 'I was terrified of stalling at Bengaluru traffic signals. My instructor, Suresh, spent the first 4 sessions solely on clutch bite-point control in a closed yard. Passed my RTO test at Kasturi Nagar in my very first attempt with zero negative points!',
      course: '28-Day Comprehensive Car Course',
    },
    {
      name: 'Arjun Mehta',
      role: 'Product Designer',
      location: 'Kothrud, Pune',
      rating: 5,
      story: 'The online slot rescheduling is a lifesaver. When my office schedule changed, I could move my 7:00 AM slot to 5:30 PM with one tap. The dual-control Maruti Swift felt extremely safe even on crowded FC Road traffic.',
      course: '15-Day Fast-Track Manual',
    },
    {
      name: 'Sneha Kulkarni',
      role: 'Doctor',
      location: 'Dwarka, Delhi NCR',
      rating: 5,
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
    <div style={{ background: '#FFFFFF', minHeight: '100vh', color: '#1E293B', fontFamily: 'var(--font-body)' }}>
      <Navbar />

      {/* 1. HERO SECTION: CLEAN RED & WHITE INSTITUTIONAL THEME */}
      <section
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '50px 24px 60px',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px', alignItems: 'center' }}>
          {/* Left Column: Clean Headline & Search Engine */}
          <div>
            {/* Red Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#FDF2F4',
                border: '1px solid #F8D7DA',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#B3182F',
                marginBottom: '18px',
              }}
            >
              <IconShieldCheck size={16} color="#B3182F" />
              <span>Government of India (MoRTH) Standardized Driving Network</span>
            </div>

            <h1
              style={{
                fontSize: '40px',
                fontWeight: 800,
                lineHeight: 1.2,
                color: '#1E293B',
                margin: '0 0 14px',
                letterSpacing: '-0.02em',
              }}
            >
              Learn Driving on Real Roads.<br />
              <span style={{ color: '#B3182F' }}>
                With Verified RTO Driving Schools.
              </span>
            </h1>

            <p
              style={{
                fontSize: '15.5px',
                color: '#475569',
                lineHeight: 1.6,
                marginBottom: '26px',
                maxWidth: '560px',
              }}
            >
              Compare licensed driving schools, train in dual-control cars, practice on official 8-tracks, and track all 14 practical driving skills to clear your RTO license test.
            </p>

            {/* Plain Search Box */}
            <div
              style={{
                background: '#F8F9FA',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <IconSearch size={16} color="#B3182F" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#B3182F', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  SEARCH DRIVING SCHOOLS NEAR YOU
                </span>
              </div>

              <form onSubmit={handleHeroSearch} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    City
                  </label>
                  <select
                    value={searchFilters.city}
                    onChange={(e) => setSearchFilters({ ...searchFilters, city: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 10px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      fontWeight: 600,
                      background: '#FFFFFF',
                      color: '#1E293B',
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

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Vehicle
                  </label>
                  <select
                    value={searchFilters.category}
                    onChange={(e) => setSearchFilters({ ...searchFilters, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 10px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      fontWeight: 600,
                      background: '#FFFFFF',
                      color: '#1E293B',
                      outline: 'none',
                    }}
                  >
                    <option value="4-wheeler">4-Wheeler Car</option>
                    <option value="2-wheeler">2-Wheeler (Bike/Scooter)</option>
                    <option value="commercial">Commercial LMV</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Transmission
                  </label>
                  <select
                    value={searchFilters.transmission}
                    onChange={(e) => setSearchFilters({ ...searchFilters, transmission: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 10px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      fontWeight: 600,
                      background: '#FFFFFF',
                      color: '#1E293B',
                      outline: 'none',
                    }}
                  >
                    <option value="manual">Manual (Clutch & Gear)</option>
                    <option value="automatic">Automatic / EV</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn"
                  style={{
                    background: '#B3182F',
                    color: '#FFFFFF',
                    padding: '10px 20px',
                    fontWeight: 700,
                    fontSize: '13px',
                    borderRadius: '6px',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    height: '38px',
                    cursor: 'pointer',
                  }}
                >
                  <span>Search</span>
                  <IconArrowRight size={15} />
                </button>
              </form>
            </div>

            {/* Plain Trust Chips */}
            <div
              style={{
                display: 'flex',
                gap: '18px',
                marginTop: '16px',
                fontSize: '12.5px',
                color: '#475569',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <IconCheck size={14} color="#B3182F" strokeWidth={2.5} /> Dual-Control Safety Cars
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <IconCheck size={14} color="#B3182F" strokeWidth={2.5} /> Female Instructors Available
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <IconCheck size={14} color="#B3182F" strokeWidth={2.5} /> 100% Wallet Refund Protection
              </span>
            </div>
          </div>

          {/* Right Column: Clean Academy Preview Card */}
          <div>
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      background: '#B3182F',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      flexShrink: 0,
                    }}
                  >
                    <IconCar size={22} color="#FFFFFF" strokeWidth={2} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: '#1E293B' }}>
                      Royal Crown Driving Academy
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <IconMapPin size={13} color="#64748B" /> Indiranagar, Bengaluru · RTO Verified
                    </div>
                  </div>
                </div>

                <div style={{ background: '#FDF2F4', color: '#B3182F', border: '1px solid #F8D7DA', padding: '3px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <IconStar size={12} color="#B3182F" /> 4.9 (420+ Reviews)
                </div>
              </div>

              {/* Course Detail Table */}
              <div style={{ background: '#F8F9FA', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12.5px' }}>
                  <span style={{ color: '#64748B' }}>Training Course:</span>
                  <strong style={{ color: '#1E293B' }}>28-Day Comprehensive Car Course</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12.5px' }}>
                  <span style={{ color: '#64748B' }}>Training Car:</span>
                  <strong style={{ color: '#1E293B' }}>Maruti Swift Dual-Brake (KA-03)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '12.5px' }}>
                  <span style={{ color: '#64748B' }}>Certified Instructor:</span>
                  <strong style={{ color: '#1E293B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IconUserCheck size={13} color="#15803D" /> Suresh Kumar (9 Yrs Exp)
                  </strong>
                </div>

                {/* Progress Bar */}
                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '5px' }}>
                    <span style={{ color: '#475569', fontWeight: 600 }}>14-Module Practical Progress</span>
                    <span style={{ color: '#B3182F', fontWeight: 800 }}>8 of 14 Cleared (60%)</span>
                  </div>
                  <div style={{ width: '100%', height: '7px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '60%', height: '100%', background: '#B3182F', borderRadius: '4px' }} />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <Link
                  to="/learner"
                  style={{
                    background: '#B3182F',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    padding: '9px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    borderRadius: '6px',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                  }}
                >
                  <IconCalendar size={14} /> Book Lesson Slot
                </Link>
                <Link
                  to="/aptitude-test"
                  style={{
                    background: '#FFFFFF',
                    color: '#1E293B',
                    border: '1px solid #CBD5E1',
                    textAlign: 'center',
                    padding: '9px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    borderRadius: '6px',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                  }}
                >
                  <IconBookOpen size={14} /> Free Mock Test
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PLAIN STATS STRIP */}
      <section style={{ background: '#F8F9FA', borderBottom: '1px solid #E2E8F0', padding: '30px 24px' }}>
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#FDF2F4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B3182F', flexShrink: 0 }}>
              <IconAward size={22} color="#B3182F" />
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#B3182F', fontFamily: 'var(--font-mono)' }}>50,000+</div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Trained Licensed Drivers</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#FDF2F4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B3182F', flexShrink: 0 }}>
              <IconBuilding size={22} color="#B3182F" />
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#B3182F', fontFamily: 'var(--font-mono)' }}>1,200+</div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>RTO Verified Academies</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#FDF2F4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B3182F', flexShrink: 0 }}>
              <IconCheckCircle size={22} color="#B3182F" />
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#B3182F', fontFamily: 'var(--font-mono)' }}>98.4%</div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>First-Attempt Pass Rate</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#FDF2F4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B3182F', flexShrink: 0 }}>
              <IconCompass size={22} color="#B3182F" />
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#B3182F', fontFamily: 'var(--font-mono)' }}>40+ Cities</div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Across India</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE RTO ROAD SIGN QUIZ */}
      <section style={{ padding: '60px 24px', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '920px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <span style={{ color: '#B3182F', fontWeight: 700, fontSize: '11.5px', textTransform: 'uppercase', background: '#FDF2F4', padding: '4px 10px', borderRadius: '4px', border: '1px solid #F8D7DA' }}>
              RTO TEST PREPARATION
            </span>
            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 6px', color: '#1E293B' }}>
              RTO Road Sign & Traffic Rule Practice
            </h2>
            <p style={{ color: '#64748B', fontSize: '14px', maxWidth: '580px', margin: '0 auto' }}>
              Test your understanding of official Indian traffic rules before your learner permit exam:
            </p>
          </div>

          <div
            style={{
              background: '#F8F9FA',
              borderRadius: '10px',
              padding: '24px',
              border: '1px solid #E2E8F0',
            }}
          >
            {(() => {
              const currentQ = quizQuestions[currentQuizIndex];
              const SignComp = currentQ.SignComponent;
              return (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ flexShrink: 0, padding: '4px', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                        <SignComp size={48} />
                      </div>
                      <div>
                        <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 700 }}>
                          Question {currentQuizIndex + 1} of {quizQuestions.length} · {currentQ.signName}
                        </div>
                        <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#1E293B', marginTop: '2px', lineHeight: 1.4 }}>
                          {currentQ.question}
                        </div>
                      </div>
                    </div>

                    <span style={{ background: '#FDF2F4', color: '#B3182F', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 800, border: '1px solid #F8D7DA' }}>
                      Score: {quizScore} / {quizQuestions.length}
                    </span>
                  </div>

                  {/* Options */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                    {currentQ.options.map((opt, idx) => {
                      const isSelected = selectedQuizOption === idx;
                      let bg = '#FFFFFF';
                      let borderColor = '#CBD5E1';
                      let textColor = '#1E293B';

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
                            border: `1px solid ${borderColor}`,
                            borderRadius: '8px',
                            padding: '12px 14px',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: quizAnswered ? 'default' : 'pointer',
                            color: textColor,
                            fontSize: '13px',
                            fontWeight: 600,
                            lineHeight: 1.4,
                          }}
                        >
                          <span
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '4px',
                              background: '#F1F5F9',
                              border: '1px solid #CBD5E1',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
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

                  {/* Explanation */}
                  {quizAnswered && (
                    <div
                      style={{
                        background: selectedQuizOption !== null && currentQ.options[selectedQuizOption].correct ? '#F0FDF4' : '#FEF2F2',
                        border: `1px solid ${selectedQuizOption !== null && currentQ.options[selectedQuizOption].correct ? '#86EFAC' : '#FCA5A5'}`,
                        borderRadius: '8px',
                        padding: '14px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '10px',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '13px', color: selectedQuizOption !== null && currentQ.options[selectedQuizOption].correct ? '#15803D' : '#B91C1C' }}>
                          {selectedQuizOption !== null && currentQ.options[selectedQuizOption].correct ? '✓ Correct Answer!' : '✗ Incorrect!'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#475569', marginTop: '3px', maxWidth: '600px' }}>
                          {currentQ.explanation}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={handleNextQuizQuestion}
                          style={{
                            background: '#B3182F',
                            color: '#FFFFFF',
                            padding: '7px 14px',
                            fontWeight: 700,
                            fontSize: '12px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          Next Question →
                        </button>
                        <Link
                          to="/aptitude-test"
                          style={{
                            background: '#FFFFFF',
                            color: '#1E293B',
                            border: '1px solid #CBD5E1',
                            padding: '7px 14px',
                            fontWeight: 700,
                            fontSize: '12px',
                            borderRadius: '4px',
                            textDecoration: 'none',
                          }}
                        >
                          Full 20-Q Mock Test
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

      {/* 4. 4-PHASE / 14-MODULE CMVR PRACTICAL SYLLABUS */}
      <section style={{ padding: '60px 24px', background: '#F8F9FA', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span style={{ color: '#B3182F', fontWeight: 700, fontSize: '11.5px', textTransform: 'uppercase', background: '#FDF2F4', padding: '4px 10px', borderRadius: '4px', border: '1px solid #F8D7DA' }}>
              PRACTICAL CURRICULUM
            </span>
            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 6px', color: '#1E293B' }}>
              Standardized 28-Day Driving Syllabus
            </h2>
            <p style={{ color: '#64748B', fontSize: '14px', maxWidth: '580px', margin: '0 auto' }}>
              Every DriveLearn India academy follows the 14 mandatory practical modules mandated under Central Motor Vehicles Rules (CMVR):
            </p>
          </div>

          {/* Stepper Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '10px',
              marginBottom: '20px',
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
                    background: isActive ? '#B3182F' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#1E293B',
                    border: isActive ? '1px solid #B3182F' : '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '14px 16px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 2px 8px rgba(179, 24, 47, 0.2)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: isActive ? '#FFFFFF' : '#B3182F', textTransform: 'uppercase' }}>
                      {phase.phase}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: isActive ? '#FEE2E2' : '#64748B' }}>
                      {phase.days}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.3 }}>
                    {phase.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Phase Card */}
          {(() => {
            const activePhase = curriculumPhases[activeCurriculumStage];
            return (
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  padding: '28px',
                  display: 'grid',
                  gridTemplateColumns: '1.3fr 0.7fr',
                  gap: '28px',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FDF2F4', color: '#B3182F', border: '1px solid #F8D7DA', padding: '3px 10px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 800, marginBottom: '10px' }}>
                    <span>{activePhase.phase}</span> · <span>{activePhase.days}</span>
                  </div>

                  <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px', color: '#1E293B' }}>
                    {activePhase.title}
                  </h3>
                  <p style={{ color: '#475569', fontSize: '13.5px', marginBottom: '18px', lineHeight: 1.5 }}>
                    {activePhase.summary}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activePhase.skills.map((skill, skIdx) => (
                      <div key={skIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12.5px', color: '#334155' }}>
                        <span style={{ color: '#B3182F', fontWeight: 800, marginTop: '1px' }}>✓</span>
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    background: '#F8F9FA',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '20px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FDF2F4', color: '#B3182F', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <IconSteeringWheel size={22} color="#B3182F" />
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>
                    Enroll in this course module
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px', lineHeight: 1.4 }}>
                    Choose an accredited driving academy in your city with verified dual-control cars.
                  </p>
                  <Link
                    to="/learner"
                    style={{
                      background: '#B3182F',
                      color: '#FFFFFF',
                      width: '100%',
                      padding: '9px',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                    }}
                  >
                    <span>Browse Driving Schools</span>
                    <IconArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* 5. COMPARISON TABLE */}
      <section style={{ padding: '60px 24px', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '920px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <span style={{ color: '#B3182F', fontWeight: 700, fontSize: '11.5px', textTransform: 'uppercase', background: '#FDF2F4', padding: '4px 10px', borderRadius: '4px', border: '1px solid #F8D7DA' }}>
              WHY DRIVELEARN INDIA
            </span>
            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 6px', color: '#1E293B' }}>
              DriveLearn India Network vs. Unorganized Driving Agents
            </h2>
            <p style={{ color: '#64748B', fontSize: '14px' }}>
              Clear comparison of safety standards and transparent policies:
            </p>
          </div>

          <div style={{ border: '1px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #CBD5E1' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 800, color: '#1E293B', width: '38%' }}>
                    Features & Safety
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 800, color: '#B3182F', background: '#FDF2F4', width: '31%' }}>
                    DriveLearn India Network
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 800, color: '#64748B', width: '31%' }}>
                    Unorganized Local Agents
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>Dual-Control Car Verification</td>
                  <td style={{ padding: '12px 16px', color: '#15803D', fontWeight: 700 }}>✓ 100% Certified Dual-Brake Cars</td>
                  <td style={{ padding: '12px 16px', color: '#B91C1C' }}>✗ Often private unverified cars</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>Free Slot Rescheduling</td>
                  <td style={{ padding: '12px 16px', color: '#15803D', fontWeight: 700 }}>✓ 1-Click Online Rescheduling</td>
                  <td style={{ padding: '12px 16px', color: '#B91C1C' }}>✗ Missed slot lost completely</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>14-Module Skill Scorecard</td>
                  <td style={{ padding: '12px 16px', color: '#15803D', fontWeight: 700 }}>✓ Digital Session Attendance Logs</td>
                  <td style={{ padding: '12px 16px', color: '#B91C1C' }}>✗ Manual paper cuts</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>Female Instructor Availability</td>
                  <td style={{ padding: '12px 16px', color: '#15803D', fontWeight: 700 }}>✓ Certified Lady Instructors</td>
                  <td style={{ padding: '12px 16px', color: '#B91C1C' }}>✗ Rarely available</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>Payment Protection & Refunds</td>
                  <td style={{ padding: '12px 16px', color: '#15803D', fontWeight: 700 }}>✓ Razorpay & Instant Refund</td>
                  <td style={{ padding: '12px 16px', color: '#B91C1C' }}>✗ Cash-only, non-refundable</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>Official CMVR Form 5</td>
                  <td style={{ padding: '12px 16px', color: '#15803D', fontWeight: 700 }}>✓ Tamper-proof Digital PDF</td>
                  <td style={{ padding: '12px 16px', color: '#B91C1C' }}>✗ Delayed physical slips</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. LEARNER EXPERIENCES */}
      <section style={{ padding: '60px 24px', background: '#F8F9FA', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span style={{ color: '#B3182F', fontWeight: 700, fontSize: '11.5px', textTransform: 'uppercase', background: '#FDF2F4', padding: '4px 10px', borderRadius: '4px', border: '1px solid #F8D7DA' }}>
              STUDENT REVIEWS
            </span>
            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 6px', color: '#1E293B' }}>
              Learner Experiences
            </h2>
            <p style={{ color: '#64748B', fontSize: '14px' }}>
              Feedback from students who passed their driving license test on first attempt:
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {learnerReviews.map((rev, rIdx) => (
              <div
                key={rIdx}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#B3182F', marginBottom: '10px' }}>
                    {[...Array(rev.rating)].map((_, i) => (
                      <IconStar key={i} size={14} color="#B3182F" />
                    ))}
                  </div>

                  <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6, marginBottom: '16px', fontStyle: 'italic' }}>
                    "{rev.story}"
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B' }}>{rev.name}</div>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>{rev.role} · {rev.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PARTNER WITH DRIVELEARN FOR SCHOOL OWNERS */}
      <section style={{ padding: '60px 24px', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <div
          style={{
            maxWidth: '1140px',
            margin: '0 auto',
            background: '#FDF2F4',
            border: '1px solid #F8D7DA',
            borderRadius: '12px',
            padding: '36px',
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: '30px',
            alignItems: 'center',
          }}
        >
          <div>
            <span style={{ background: '#B3182F', color: '#FFFFFF', padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
              FOR DRIVING SCHOOL OWNERS
            </span>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#1E293B', margin: '12px 0 10px' }}>
              List Your Driving Academy on DriveLearn India
            </h2>
            <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.5, marginBottom: '20px' }}>
              Receive online student bookings, manage instructor availability slots, track student milestones, and issue official CMVR Form 5 certificates.
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link to="/for-schools" style={{ background: '#B3182F', color: '#FFFFFF', padding: '10px 20px', fontWeight: 700, fontSize: '13px', borderRadius: '6px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span>List Your Academy</span>
                <IconArrowRight size={14} />
              </Link>
              <Link to="/login" style={{ background: '#FFFFFF', color: '#1E293B', border: '1px solid #CBD5E1', padding: '10px 20px', fontWeight: 700, fontSize: '13px', borderRadius: '6px', textDecoration: 'none' }}>
                Owner Portal Login
              </Link>
            </div>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: '8px', padding: '20px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#B3182F', marginBottom: '12px' }}>
              Included with Academy Registration:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', color: '#334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconCheck size={14} color="#B3182F" strokeWidth={2.5} /> Direct online student bookings
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconCheck size={14} color="#B3182F" strokeWidth={2.5} /> Automated slot scheduling calendar
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconCheck size={14} color="#B3182F" strokeWidth={2.5} /> Multi-vehicle fleet tracking
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconCheck size={14} color="#B3182F" strokeWidth={2.5} /> Government-compliant Form 5 certification
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FREQUENTLY ASKED QUESTIONS */}
      <section style={{ padding: '60px 24px', background: '#F8F9FA', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <span style={{ color: '#B3182F', fontWeight: 700, fontSize: '11.5px', textTransform: 'uppercase', background: '#FDF2F4', padding: '4px 10px', borderRadius: '4px', border: '1px solid #F8D7DA' }}>
              FAQ
            </span>
            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 6px', color: '#1E293B' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: '#64748B', fontSize: '14px' }}>
              Common questions about driving lessons, fees, and RTO test procedures:
            </p>
          </div>

          <div>
            {faqs.map((faq, fIdx) => {
              const isOpen = openFaq === fIdx;
              return (
                <div key={fIdx} style={{ border: '1px solid #CBD5E1', borderRadius: '8px', marginBottom: '10px', background: '#FFFFFF', overflow: 'hidden' }}>
                  <div
                    onClick={() => setOpenFaq(isOpen ? null : fIdx)}
                    style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 700, fontSize: '14px', color: '#1E293B' }}
                  >
                    <span>{faq.q}</span>
                    <span style={{ fontSize: '18px', color: '#B3182F', fontWeight: 800 }}>
                      {isOpen ? '−' : '+'}
                    </span>
                  </div>
                  {isOpen && (
                    <div style={{ padding: '0 20px 16px', fontSize: '13px', color: '#475569', lineHeight: 1.5, borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. FINAL RED & WHITE ACTION BANNER */}
      <section style={{ padding: '50px 24px', background: '#B3182F', color: '#FFFFFF', textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#FFFFFF', marginBottom: '10px' }}>
            Ready to Start Learning?
          </h2>
          <p style={{ fontSize: '15px', color: '#FEE2E2', marginBottom: '24px', lineHeight: 1.5 }}>
            Join 50,000+ drivers. Claim your ₹15 welcome wallet credit and book your first lesson with a certified school today.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" style={{ background: '#FFFFFF', color: '#B3182F', padding: '12px 26px', fontWeight: 800, fontSize: '13.5px', borderRadius: '6px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <IconWallet size={15} color="#B3182F" />
              <span>Claim ₹15 Bonus & Sign Up</span>
            </Link>
            <Link to="/aptitude-test" style={{ background: 'transparent', color: '#FFFFFF', border: '1px solid #FFFFFF', padding: '12px 22px', fontWeight: 800, fontSize: '13.5px', borderRadius: '6px', textDecoration: 'none' }}>
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
