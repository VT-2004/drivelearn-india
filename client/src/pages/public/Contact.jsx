import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/landing.css';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Note: no backend endpoint for this yet — just confirms UI works.
    // A real submission endpoint can be added in a later part if needed.
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div>
      <Navbar />

      <section className="contact-hero">
        <h1>Get in Touch</h1>
        <p>
          Questions about registering your school, booking a course, or anything else?
          We're here to help.
        </p>
      </section>

      <section className="contact-body">
        <div>
          <div className="contact-info-item">
            <h5>Email</h5>
            <p>support@b2world.in</p>
          </div>
          <div className="contact-info-item">
            <h5>Phone</h5>
            <p>+91 00000 00000</p>
          </div>
          <div className="contact-info-item">
            <h5>Office</h5>
            <p>B2World (BTOW Pvt. Ltd.)<br />India</p>
          </div>
          <div className="contact-info-item">
            <h5>Support Hours</h5>
            <p>Monday – Saturday, 9:00 AM – 6:00 PM IST</p>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          {submitted && (
            <div className="contact-success">
              Thanks! Your message has been noted — we'll get back to you soon.
            </div>
          )}
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <label>Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
          />
          <button type="submit" className="btn btn-primary btn-lg">
            Send Message
          </button>
        </form>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;