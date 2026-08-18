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
    role: 'learner', // learner | school_owner | instructor
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (role) => {
    setFormData({ ...formData, role });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long with at least one number.');
      return;
    }

    setLoading(true);

    try {
      const res = await signupUser(formData);
      setSuccess(res.data?.message || '✓ Account created successfully! Redirecting to sign in...');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again with a valid email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Brand Visual Side */}
      <div className="auth-visual">
        <Link to="/" className="auth-back-home">
          ← Back to DriveLearn Home
        </Link>

        <div className="auth-visual-content">
          <div className="auth-visual-logo">
            🚗 Drive<span>Learn</span> India
          </div>
          <h2>Start Your Driving Journey With Confidence</h2>
          <p>
            Whether you're booking dual-control driving lessons, mastering RTO 8-track maneuvers, or digitizing your driving academy, your journey starts here.
          </p>

          {/* Glass Benefits Card */}
          <div className="auth-trust-card">
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#FDE047', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              🎁 Exclusive Signup Benefits:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>
              <div>✓ <strong>₹15 Wallet Bonus</strong> credited instantly on learner registration</div>
              <div>✓ <strong>Dual-Control Certified Fleet</strong> with zero-risk training</div>
              <div>✓ <strong>Official CMVR Form 5</strong> digital certificate upon completion</div>
              <div>✓ <strong>Free Instant Rescheduling</strong> with flexible online slots</div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '24px' }}>
          © {new Date().getFullYear()} DriveLearn India · Central Motor Vehicles Rules Form 5 Compliant
        </div>
      </div>

      {/* Right Form Side */}
      <div className="auth-form-side">
        <div className="auth-form-box">
          <h2>Create Account</h2>
          <p className="auth-subtext">Select your account type and fill in your details</p>

          {/* Role Selector Tabs */}
          <div className="auth-role-selector">
            <button
              type="button"
              onClick={() => handleRoleChange('learner')}
              className={`auth-role-tab ${formData.role === 'learner' ? 'active' : ''}`}
            >
              <span style={{ fontSize: '16px' }}>🚗</span>
              <span>Learner Trainee</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('school_owner')}
              className={`auth-role-tab ${formData.role === 'school_owner' ? 'active' : ''}`}
            >
              <span style={{ fontSize: '16px' }}>🏢</span>
              <span>School Owner</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('instructor')}
              className={`auth-role-tab ${formData.role === 'instructor' ? 'active' : ''}`}
            >
              <span style={{ fontSize: '16px' }}>👨‍🏫</span>
              <span>Instructor</span>
            </button>
          </div>

          {/* Google Sign-in for Learners */}
          {formData.role === 'learner' && (
            <>
              <GoogleSignInButton onError={setError} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
                <span style={{ fontSize: '11.5px', color: '#94A3B8', fontWeight: 700 }}>OR SIGN UP WITH EMAIL</span>
                <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
              </div>
            </>
          )}

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder={formData.role === 'school_owner' ? 'e.g. Rajesh Kumar (Owner)' : 'e.g. Ananya Sharma'}
                value={formData.name}
                onChange={handleChange}
                className="auth-input"
                required
              />
            </div>

            <div className="auth-input-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className="auth-input"
                required
              />
            </div>

            <div className="auth-input-group">
              <label>Mobile Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                className="auth-input"
                required
              />
            </div>

            <div className="auth-input-group">
              <label>Create Password</label>
              <div className="auth-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Min 6 characters with letters & numbers"
                  value={formData.password}
                  onChange={handleChange}
                  className="auth-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-password-toggle"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                Must be at least 6 characters long and include numbers.
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Creating Your Account...' : formData.role === 'learner' ? 'Claim ₹15 Bonus & Sign Up →' : 'Create Academy Account →'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in here →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;