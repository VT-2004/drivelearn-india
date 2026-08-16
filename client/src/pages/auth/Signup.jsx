import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signupUser } from '../../services/api';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import '../../styles/auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'learner',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await signupUser(formData);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <Link to="/" className="auth-back-home">← Back to home</Link>
        <div className="auth-visual-logo">
          Drive<span>Learn</span> India
        </div>
        <h2>Start your journey with us</h2>
        <p>
          Whether you're learning to drive or running a driving school,
          your digital dashboard starts here.
        </p>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-box">
          <h2>Create Account</h2>
          <p className="auth-subtext">Fill in your details to get started</p>

          <GoogleSignInButton onError={setError} />
          <p style={{ fontSize: '12px', color: '#8B929A', textAlign: 'center', marginTop: '8px' }}>
            Google sign-up creates a Learner account. School owners and instructors, please use the form below.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#E4E1D9' }} />
            <span style={{ fontSize: '12px', color: '#8B929A' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#E4E1D9' }} />
          </div>

          <form onSubmit={handleSubmit}>
            <label>Full Name</label>
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

            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <p style={{ fontSize: '12px', color: '#8B929A', marginTop: '4px', marginBottom: '0' }}>
              At least 8 characters, with uppercase, lowercase, a number, and a special character.
            </p>

            <label>I am a</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="learner">Learner</option>
              <option value="school_owner">Driving School Owner</option>
              <option value="instructor">Instructor</option>
            </select>

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;