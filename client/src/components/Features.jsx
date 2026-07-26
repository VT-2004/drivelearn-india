const features = [
  {
    title: 'Verified Schools Only',
    desc: 'Every driving school is manually verified before going live, so you never book with an unlisted or fake operator.',
  },
  {
    title: 'Secure Payments',
    desc: 'Pay for your course safely online through Razorpay — no cash-only surprises or hidden charges.',
  },
  {
    title: 'Real Reviews',
    desc: 'Ratings come only from learners who actually completed a course, keeping feedback honest and useful.',
  },
  {
    title: 'Progress Tracking',
    desc: 'See your attendance and lesson progress updated by your instructor after every session.',
  },
];

const Features = () => {
  return (
    <section className="features">
      <div className="section-eyebrow">Why DriveLearn India</div>
      <h2 className="section-title">Built for a Smoother Journey</h2>
      <div className="features-grid">
        {features.map((f) => (
          <div className="feature-card" key={f.title}>
            <h4>{f.title}</h4>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
