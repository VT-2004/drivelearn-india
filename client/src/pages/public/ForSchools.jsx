import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/landing.css';

const capabilities = [
  {
    icon: '👥',
    title: 'Student CRM & Batch Scheduling',
    desc: 'Manage all learner enrollments, slot schedules, and digital attendance from a centralized calendar. Send automated lesson reminders.',
    badge: 'Automated',
  },
  {
    icon: '🎯',
    title: '28-Day RTO Curriculum Engine',
    desc: 'Grade learner progress through 14 standardized practical milestones from ABC pedals to RTO 8-track maneuvers and slope hill ascents.',
    badge: 'Standardized',
  },
  {
    icon: '🚗',
    title: 'Fleet & Compliance Telematics',
    desc: 'Register dual-control vehicles, assign dedicated instructors, and receive proactive alerts before insurance or commercial fitness certificates expire.',
    badge: 'RTO Compliant',
  },
  {
    icon: '💳',
    title: 'Direct UPI & Gateway Settlements',
    desc: 'Accept online payments, course booking deposits, and milestone fees directly via Razorpay and UPI with zero hidden commission.',
    badge: '0% Platform Cut',
  },
  {
    icon: '👨‍🏫',
    title: 'Instructor Portal & Delegation',
    desc: 'Onboard certified driving instructors with custom logins. Allow instructors to log daily attendance and evaluate student driving skills on the road.',
    badge: 'Multi-User',
  },
  {
    icon: '⭐',
    title: 'Verified RTO Marketplace Badge',
    desc: 'Gain verified partner credibility on the DriveLearn India public directory and attract learners actively searching in your city.',
    badge: '3X Growth',
  },
];

const ForSchools = () => {
  const [billingCycle, setBillingCycle] = useState('yearly'); // 'monthly' or 'yearly'
  const [monthlyStudents, setMonthlyStudents] = useState(25);

  const estimatedNewRevenue = monthlyStudents * 6500 * 12;
  const platformRoiMultiplier = Math.round(estimatedNewRevenue / (billingCycle === 'yearly' ? 8999 : 11988));

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* HERO SECTION */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: '#FFFFFF',
          padding: '64px 24px 80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'center' }}>
          <div>
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
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '18px',
              }}
            >
              🏫 India's #1 Cloud Operating System for Driving Academies
            </div>

            <h1
              style={{
                fontSize: 'clamp(32px, 4.5vw, 48px)',
                fontWeight: 900,
                color: '#FFFFFF',
                lineHeight: 1.15,
                margin: '0 0 16px',
                letterSpacing: '-0.02em',
              }}
            >
              Digitize Your Academy & Grow Student Admissions <span style={{ color: '#F97316' }}>3X</span>
            </h1>

            <p
              style={{
                fontSize: 'clamp(15px, 1.8vw, 17px)',
                color: '#CBD5E1',
                lineHeight: 1.6,
                margin: '0 0 28px',
              }}
            >
              Replace paper diaries and spreadsheets with our end-to-end cloud platform. Manage student bookings, track 28-day RTO milestones, coordinate instructors, and accept secure online payments.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link
                to="/signup"
                className="btn btn-primary btn-lg"
                style={{ padding: '12px 28px', fontWeight: 700, textDecoration: 'none' }}
              >
                🚀 Register Your School Free
              </Link>
              <Link
                to="/contact"
                className="btn btn-outline btn-lg"
                style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
              >
                📞 Request Demo Call
              </Link>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '28px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '18px', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '13px', color: '#CBD5E1' }}>✓ <strong>100% Free</strong> 14-Day Trial</div>
              <div style={{ fontSize: '13px', color: '#CBD5E1' }}>✓ <strong>0%</strong> Commission on Cash</div>
              <div style={{ fontSize: '13px', color: '#CBD5E1' }}>✓ <strong>Verified</strong> RTO Badge</div>
            </div>
          </div>

          {/* Interactive Live Academy OS Dashboard Simulation */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  🏫
                </div>
                <div>
                  <strong style={{ fontSize: '15px', color: '#FFFFFF' }}>Elite RTO Driving Academy</strong>
                  <div style={{ fontSize: '11.5px', color: '#94A3B8' }}>Bangalore, Karnataka · 🟢 Verified SaaS Partner</div>
                </div>
              </div>
              <span className="badge" style={{ background: '#DCFCE7', color: '#15803D', fontSize: '11px', fontWeight: 700 }}>
                Live Cloud Sync
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '11.5px', color: '#94A3B8' }}>Active Students</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>142</div>
                <div style={{ fontSize: '11px', color: '#22C55E', marginTop: '2px' }}>+18 this month</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '11.5px', color: '#94A3B8' }}>This Month's Revenue</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#FBBF24', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>₹1,62,500</div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>via Razorpay UPI</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '11.5px', color: '#94A3B8' }}>Certified Instructors</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>8</div>
                <div style={{ fontSize: '11px', color: '#60A5FA', marginTop: '2px' }}>All on schedule</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '11.5px', color: '#94A3B8' }}>Academy Rating</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#FB923C', marginTop: '2px' }}>4.9 ★</div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>86 verified reviews</div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 14px', borderRadius: '8px', fontSize: '12px', color: '#E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>⏱️ Next Session: Rahul S. · 8-Track Maneuvers</span>
              <span style={{ color: '#FB923C', fontWeight: 700 }}>09:30 AM</span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE OPERATING CAPABILITIES */}
      <section style={{ maxWidth: '1140px', width: '100%', margin: '0 auto', padding: '64px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
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
              marginBottom: '10px',
            }}
          >
            ⚡ Complete Academy Operating Suite
          </div>

          <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#0F172A', margin: '0 0 10px' }}>
            Everything You Need to Run & Scale Your Academy
          </h2>
          <p style={{ color: '#64748B', fontSize: '15px', maxWidth: '640px', margin: '0 auto' }}>
            DriveLearn India equips your academy with modern software to eliminate administrative headaches and focus on quality driving instruction.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '22px' }}>
          {capabilities.map((c, idx) => (
            <div
              key={idx}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderRadius: '16px',
                padding: '26px',
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '32px' }}>{c.icon}</span>
                  <span
                    style={{
                      background: '#F1F5F9',
                      color: '#334155',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '999px',
                      border: '1px solid #CBD5E1',
                    }}
                  >
                    {c.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
                  {c.title}
                </h3>

                <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                  {c.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INTERACTIVE REVENUE & ROI CALCULATOR */}
      <section style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '60px 20px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-block',
              background: '#DCFCE7',
              color: '#15803D',
              border: '1px solid #86EFAC',
              padding: '4px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}
          >
            💰 Projected Academy Revenue Growth
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
            Calculate Your Growth Potential
          </h2>
          <p style={{ color: '#64748B', fontSize: '14.5px', maxWidth: '600px', margin: '0 auto 36px' }}>
            See how much additional revenue your academy can generate by listing on DriveLearn India and automating your bookings.
          </p>

          <div
            style={{
              background: '#F8FAFC',
              borderRadius: '20px',
              border: '1.5px solid #E2E8F0',
              padding: '32px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '28px',
              alignItems: 'center',
              textAlign: 'left',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                Estimated Monthly Student Admissions: <strong style={{ color: '#EA580C', fontSize: '16px' }}>{monthlyStudents} Students</strong>
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={monthlyStudents}
                onChange={(e) => setMonthlyStudents(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#EA580C', cursor: 'pointer', marginBottom: '14px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
                <span>5 Students/mo</span>
                <span>50 Students/mo</span>
                <span>100 Students/mo</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '12px', lineHeight: 1.4 }}>
                * Based on an average Indian RTO 4-Wheeler course package fee of ₹6,500 with zero platform cut on cash.
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '14px', border: '1.5px solid #E2E8F0', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Projected Annual Gross Revenue</div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#15803D', fontFamily: 'var(--font-mono)', margin: '6px 0' }}>
                ₹{estimatedNewRevenue.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '12.5px', color: '#0F172A', fontWeight: 700 }}>
                🚀 Estimated ROI: ~{platformRoiMultiplier}X on SaaS partner cost
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING & SAAS PLANS */}
      <section style={{ maxWidth: '1140px', width: '100%', margin: '0 auto', padding: '64px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div
            style={{
              display: 'inline-block',
              background: '#FFF7ED',
              color: '#C2410C',
              border: '1px solid #FED7AA',
              padding: '4px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}
          >
            👑 Transparent Academy SaaS Pricing
          </div>

          <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#0F172A', margin: '0 0 10px' }}>
            Simple, High-Value Plans for Every Academy
          </h2>
          <p style={{ color: '#64748B', fontSize: '14.5px', margin: '0 0 20px' }}>
            No hidden setup charges. Cancel anytime. Full unlock on driving school software.
          </p>

          {/* Billing Cycle Toggle */}
          <div style={{ display: 'inline-flex', background: '#F1F5F9', padding: '4px', borderRadius: '999px', border: '1px solid #CBD5E1' }}>
            <button
              onClick={() => setBillingCycle('monthly')}
              style={{
                padding: '8px 20px',
                borderRadius: '999px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                background: billingCycle === 'monthly' ? '#FFFFFF' : 'none',
                color: billingCycle === 'monthly' ? '#0F172A' : '#64748B',
                boxShadow: billingCycle === 'monthly' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              style={{
                padding: '8px 20px',
                borderRadius: '999px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                background: billingCycle === 'yearly' ? '#0F172A' : 'none',
                color: billingCycle === 'yearly' ? '#FFFFFF' : '#64748B',
                boxShadow: billingCycle === 'yearly' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              Annual VIP (Save 25% · 2 Months Free)
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Plan 1: Starter */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: '18px',
              padding: '30px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>Starter Academy</h3>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px' }}>For single-branch driving schools getting started</p>
              
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A', fontFamily: 'var(--font-mono)', marginBottom: '16px' }}>
                {billingCycle === 'yearly' ? '₹9,990' : '₹999'}
                <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>{billingCycle === 'yearly' ? ' / year' : ' / month'}</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#334155' }}>
                <li>✓ Up to <strong>3 Instructors</strong> Onboarding</li>
                <li>✓ Up to <strong>2 Fleet Vehicles</strong> Registration</li>
                <li>✓ Student Enrollment CRM & Schedule</li>
                <li>✓ Online UPI Booking Gateway</li>
                <li>✓ Basic Analytics & Monthly Statements</li>
              </ul>
            </div>

            <Link
              to="/signup"
              className="btn btn-outline"
              style={{ width: '100%', textAlign: 'center', padding: '10px', fontWeight: 700, textDecoration: 'none', borderRadius: '8px' }}
            >
              Get Started with Starter
            </Link>
          </div>

          {/* Plan 2: Annual Pro (Featured) */}
          <div
            style={{
              background: '#FFFFFF',
              border: '2px solid #F97316',
              borderRadius: '18px',
              padding: '30px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 10px 30px rgba(249, 115, 22, 0.12)',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-12px',
                right: '24px',
                background: '#F97316',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 12px',
                borderRadius: '999px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              ⭐ Most Popular Partner Plan
            </div>

            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>Annual Pro Partner</h3>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px' }}>Complete operating suite with verified badge</p>
              
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#EA580C', fontFamily: 'var(--font-mono)', marginBottom: '16px' }}>
                {billingCycle === 'yearly' ? '₹8,999' : '₹1,299'}
                <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>{billingCycle === 'yearly' ? ' / year' : ' / month'}</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#334155' }}>
                <li>✓ Up to <strong>15 Instructors</strong> & Dedicated Portals</li>
                <li>✓ Up to <strong>10 Fleet Vehicles</strong> & Telematics</li>
                <li>✓ <strong>⭐ Verified RTO Partner Badge</strong> on Search</li>
                <li>✓ <strong>28-Day Milestone Tracking</strong> Engine</li>
                <li>✓ Priority Listing on City Directory</li>
                <li>✓ SMS & WhatsApp Reminders to Students</li>
                <li>✓ Priority 24/7 Academy Partner Support</li>
              </ul>
            </div>

            <Link
              to="/signup"
              className="btn btn-primary"
              style={{ width: '100%', textAlign: 'center', padding: '11px', fontWeight: 700, textDecoration: 'none', borderRadius: '8px' }}
            >
              Join as Verified Partner →
            </Link>
          </div>

          {/* Plan 3: Enterprise */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: '18px',
              padding: '30px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>Enterprise Multi-Branch</h3>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px' }}>For large networks with multiple city locations</p>
              
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A', fontFamily: 'var(--font-mono)', marginBottom: '16px' }}>
                {billingCycle === 'yearly' ? '₹19,999' : '₹2,499'}
                <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>{billingCycle === 'yearly' ? ' / year' : ' / month'}</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#334155' }}>
                <li>✓ <strong>Unlimited Instructors</strong> & Branch Accounts</li>
                <li>✓ <strong>Unlimited Fleet Vehicles</strong> & Reminders</li>
                <li>✓ Multi-Branch Consolidated Dashboard</li>
                <li>✓ Custom Driving Course & Syllabus Builder</li>
                <li>✓ Dedicated Partner Account Manager</li>
                <li>✓ Custom RTO API Integration Support</li>
              </ul>
            </div>

            <Link
              to="/signup"
              className="btn btn-outline"
              style={{ width: '100%', textAlign: 'center', padding: '10px', fontWeight: 700, textDecoration: 'none', borderRadius: '8px' }}
            >
              Contact Enterprise Sales
            </Link>
          </div>
        </div>
      </section>

      {/* 4-STEP ONBOARDING WORKFLOW */}
      <section style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '60px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
            Get Your School Live in 4 Simple Steps
          </h2>
          <p style={{ color: '#64748B', fontSize: '14.5px', marginBottom: '40px' }}>
            Seamless setup in under 5 minutes with zero technical knowledge required
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', textAlign: 'left' }}>
            {[
              { step: '01', title: 'Register Academy', desc: 'Create your school account, set your location coordinates, and enter your RTO registration details.' },
              { step: '02', title: 'Quick Verification', desc: 'Admin reviews your application to ensure safety compliance and activates your Verified Partner Badge.' },
              { step: '03', title: 'Add Fleet & Staff', desc: 'Onboard your certified instructors, log your dual-pedal vehicles, and publish your course fees.' },
              { step: '04', title: 'Accept Bookings', desc: 'Start receiving learner admissions, manage practical lessons, and collect payments online.' },
            ].map((s) => (
              <div key={s.step} style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '16px', padding: '24px 20px' }}>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#EA580C', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>{s.step}</div>
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>{s.title}</h4>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.45, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          color: '#FFFFFF',
          padding: '54px 24px',
          textAlign: 'center',
          marginTop: 'auto',
        }}
      >
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 10px' }}>
            Ready to Take Your Driving Academy Online?
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '15px', margin: '0 0 24px' }}>
            Join India's fastest growing network of verified driving schools. Start your free 14-day trial today with zero commitments.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/signup"
              className="btn btn-primary btn-lg"
              style={{ padding: '12px 28px', fontWeight: 700, textDecoration: 'none' }}
            >
              🚀 Register Your School Now
            </Link>
            <Link
              to="/contact"
              className="btn btn-outline btn-lg"
              style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
            >
              💬 Contact Support & Inquiries
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ForSchools;
