const features = [
  {
    icon: '🛵',
    title: 'Scooter & Activa Training',
    desc: 'Master two-wheeler balance, throttle modulation, braking technique, and zero-panic traffic handling designed for beginners.',
  },
  {
    icon: '🏍️',
    title: 'Geared Motorcycle Mastery',
    desc: 'Step-by-step clutch control, gear shifting, gradient/slope starts, and heavy-traffic confidence from expert instructors.',
  },
  {
    icon: '🎯',
    title: 'RTO 8-Track & Test Prep',
    desc: 'Practice on simulated RTO 8-formation tracks and H-tracks to pass your permanent driving license test on the 1st attempt.',
  },
  {
    icon: '🎁',
    title: '₹15 Welcome Wallet Bonus & Low Rates',
    desc: 'Transparent pricing with ₹15 introductory wallet credit applied directly to your booking with zero hidden charges.',
  },
];

const Features = () => {
  return (
    <section className="features" style={{ background: '#FFFFFF', padding: '80px 48px' }}>
      <div className="section-eyebrow" style={{ color: '#D32F2F', fontWeight: 700, letterSpacing: '1.5px' }}>
        WHY LEARN WITH DRIVELEARN INDIA
      </div>
      <h2 className="section-title" style={{ fontSize: '38px', color: '#181A1B', marginBottom: '16px' }}>
        Built for Confident 2-Wheeler & Car Drivers
      </h2>
      <p style={{ color: '#5F6368', fontSize: '16px', maxWidth: '640px', marginBottom: '40px' }}>
        Over 80% of urban commuters in Maharashtra ride two-wheelers daily. We prioritize certified training on safety, road discipline, and RTO track testing.
      </p>

      <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
        {features.map((f) => (
          <div
            className="feature-card"
            key={f.title}
            style={{
              background: '#FDFDFD',
              border: '1.5px solid #F0ECE1',
              borderRadius: '12px',
              padding: '28px',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '14px' }}>{f.icon}</div>
            <h4 style={{ fontSize: '18px', color: '#181A1B', margin: '0 0 8px' }}>{f.title}</h4>
            <p style={{ color: '#5F6368', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
