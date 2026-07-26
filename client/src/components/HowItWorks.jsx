const steps = [
  {
    plate: 'STEP 01',
    title: 'Search',
    desc: 'Enter your city or locality and browse verified driving schools near you, complete with pricing and real reviews.',
  },
  {
    plate: 'STEP 02',
    title: 'Compare & Book',
    desc: 'Compare courses, instructors, and packages side by side, then book your lesson slot and pay securely online.',
  },
  {
    plate: 'STEP 03',
    title: 'Learn & Track',
    desc: 'Attend lessons, track your progress after every session, and get on the road to your license with confidence.',
  },
];

const HowItWorks = () => {
  return (
    <section className="how">
      <div className="section-eyebrow">The Route</div>
      <h2 className="section-title">Three Steps to Your License</h2>
      <div className="how-steps">
        {steps.map((step) => (
          <div className="how-step" key={step.plate}>
            <span className="how-step-plate">{step.plate}</span>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
