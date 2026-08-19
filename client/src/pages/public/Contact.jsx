import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/landing.css';

const faqs = [
  {
    q: 'How do I verify if a driving school is genuine on DriveLearn India?',
    a: 'Every driving school on DriveLearn India undergoes physical verification and document checks by our Super Admin team. Look for the green "Verified RTO Partner" badge on the academy profile, ensuring dual-control certified vehicles, valid commercial fitness certificates, and licensed instructors.',
  },
  {
    q: 'What is the refund policy if I need to cancel my driving course?',
    a: 'If you cancel at least 24 hours before your first scheduled training session, you will receive a full 100% refund processed automatically to your original payment method. For ongoing courses, prorated refunds are handled seamlessly in accordance with our student protection terms.',
  },
  {
    q: 'How can a driving school owner register and get verified?',
    a: 'School owners can register in 2 minutes via our "List Your School" page. Once registered, upload your driving school trade license and vehicle details. Our compliance team verifies the records within 24-48 hours and activates your verified partner profile.',
  },
  {
    q: 'How do I redeem my ₹15 signup wallet credit?',
    a: 'Every new learner receives an instant ₹15 wallet credit upon creating an account. This credit is automatically deducted from your checkout total when you book any driving course or training package on the platform.',
  },
  {
    q: 'Does DriveLearn India assist with official RTO driving license booking?',
    a: 'Yes. Our partner academies provide full RTO document assistance, slot scheduling for learner license (LL) and permanent driving license (DL) exams, and conduct mock 8-track/H-track practice runs before your official RTO test.',
  },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'learner',
    schoolName: '',
    message: '',
  });
  const [ticketId, setTicketId] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitting(true);

    setTimeout(() => {
      const generatedId = `DL-${Math.floor(10000 + Math.random() * 90000)}`;
      setTicketId(generatedId);
      setSubmitting(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        category: 'learner',
        schoolName: '',
        message: '',
      });
    }, 600);
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* HERO SECTION */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: '#FFFFFF',
          padding: '60px 24px 72px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
            💬 Dedicated National Help & Partner Support Desk
          </div>

          <h1
            style={{
              fontSize: 'clamp(32px, 4.5vw, 44px)',
              fontWeight: 900,
              color: '#FFFFFF',
              lineHeight: 1.15,
              margin: '0 0 14px',
              letterSpacing: '-0.02em',
            }}
          >
            How Can We <span style={{ color: '#F97316' }}>Help You?</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(15px, 1.8vw, 17px)',
              color: '#CBD5E1',
              maxWidth: '680px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Have a question about learner course bookings, academy SaaS onboarding, RTO test simulations, or billing? Reach out to our team across India.
          </p>
        </div>
      </section>

      {/* 3 DIRECT CONTACT CHANNELS */}
      <section style={{ maxWidth: '1140px', width: '100%', margin: '-32px auto 0', padding: '0 20px', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Card 1: Email */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
            }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '14px' }}>
              📧
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>Email Support</h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 12px' }}>General inquiries, student support & billing</p>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1E40AF', fontFamily: 'var(--font-mono)' }}>
              support@drivelearn.in
            </div>
            <div style={{ fontSize: '12px', color: '#16A34A', marginTop: '6px', fontWeight: 600 }}>
              ✓ Average response time: &lt; 2 hours
            </div>
          </div>

          {/* Card 2: Phone */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
            }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '14px' }}>
              📞
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>Helpline & WhatsApp</h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 12px' }}>Toll-free student & school assistance</p>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#B45309', fontFamily: 'var(--font-mono)' }}>
              +91 80 4123 4567 / +91 98765 43210
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>
              Mon – Sat: 9:00 AM – 7:00 PM IST
            </div>
          </div>

          {/* Card 3: Office */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
            }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '14px' }}>
              🏢
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>National Headquarters</h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 6px' }}>DriveLearn India Pvt. Ltd.</p>
            <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.45 }}>
              4th Floor, Tech Innovation Hub, Koramangala 5th Block, Bengaluru, Karnataka 560095
            </div>
          </div>
        </div>
      </section>

      {/* INQUIRY FORM & FAQ SPLIT SECTION */}
      <section style={{ maxWidth: '1140px', width: '100%', margin: '0 auto', padding: '54px 20px', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '36px', alignItems: 'flex-start' }}>
          {/* Interactive Form */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
            }}
          >
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
              Send Us a Message
            </h3>
            <p style={{ fontSize: '13.5px', color: '#64748B', margin: '0 0 22px' }}>
              Fill in the details below and our team will get back to you with ticket confirmation.
            </p>

            {ticketId && (
              <div
                style={{
                  background: '#F0FDF4',
                  border: '1.5px solid #BBF7D0',
                  borderRadius: '12px',
                  padding: '16px 18px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 800, fontSize: '15px' }}>
                  <span>✓</span> Ticket #{ticketId} Created Successfully!
                </div>
                <div style={{ fontSize: '12.5px', color: '#14532D', marginTop: '4px', lineHeight: 1.4 }}>
                  We have received your message. A confirmation email and assigned support executive will respond to you within 2 hours.
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                  I am inquiring about: *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
                >
                  <option value="learner">🎓 Learner Student · Course Booking & Scheduling</option>
                  <option value="school">🏫 Driving School Owner · SaaS Partnership & Verification</option>
                  <option value="instructor">👨‍🏫 Certified Driving Instructor · Onboarding</option>
                  <option value="refund">💳 Refunds, Wallet Balance & Billing Assistance</option>
                  <option value="other">💬 General Technical Inquiry or Feedback</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Rajesh Kumar"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="rajesh@example.com"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                    Academy / City Name
                  </label>
                  <input
                    type="text"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleChange}
                    placeholder="e.g. Bangalore"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                  Detailed Message *
                </label>
                <textarea
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe your inquiry, booking issue, or partner proposal..."
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', lineHeight: 1.45 }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', padding: '12px', fontWeight: 700, borderRadius: '8px', marginTop: '6px' }}
              >
                {submitting ? 'Submitting Ticket...' : '📨 Submit Support Ticket'}
              </button>
            </form>
          </div>

          {/* Interactive FAQs Accordion */}
          <div>
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  display: 'inline-block',
                  background: '#EFF6FF',
                  color: '#1D4ED8',
                  border: '1px solid #BFDBFE',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                ❓ Quick Answers
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                Frequently Asked Questions
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
                Instant answers to common learner and partner inquiries
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {faqs.map((f, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div
                    key={idx}
                    style={{
                      background: '#FFFFFF',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      style={{
                        width: '100%',
                        padding: '16px 18px',
                        background: isOpen ? '#F8FAFC' : '#FFFFFF',
                        border: 'none',
                        textAlign: 'left',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '14px',
                        color: '#0F172A',
                        gap: '10px',
                      }}
                    >
                      <span>{f.q}</span>
                      <span style={{ fontSize: '16px', color: '#EA580C' }}>{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <div style={{ padding: '0 18px 16px', fontSize: '13px', color: '#475569', lineHeight: 1.55 }}>
                        {f.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* System Status Pill */}
            <div
              style={{
                marginTop: '24px',
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '12px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px' }}>🟢</span>
                <span style={{ fontSize: '12.5px', color: '#166534', fontWeight: 700 }}>
                  DriveLearn Cloud & Payment Gateways: Fully Operational
                </span>
              </div>
              <span style={{ fontSize: '11.5px', color: '#15803D', fontFamily: 'var(--font-mono)' }}>
                99.98% Uptime
              </span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;