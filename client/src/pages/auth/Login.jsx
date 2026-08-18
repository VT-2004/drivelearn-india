import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import '../../styles/auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginUser(formData);
      const { token, user } = response.data;

      login(user, token);

      const roleRoutes = {
        admin: '/admin',
        school_owner: '/school',
        instructor: '/instructor',
        learner: '/learner',
      };

      navigate(roleRoutes[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please check your email and password.');
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
          <h2>Welcome Back to the Road Ahead</h2>
          <p>
            Log in to manage your driving lesson slots, track practical RTO skill milestones, view verified certificates, or operate your driving academy.
          </p>

          {/* Glass Trust Card */}
          <div className="auth-trust-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#22C55E', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800 }}>
                ✓
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                  India's 1st Certified Driving Network
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                  100% CMVR Form 5 & Dual-Control Compliant
                </div>
              </div>
            </div>

            <div className="auth-trust-stats">
              <div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#FDE047' }}>50,000+</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>Safe Drivers Certified</div>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#4ADE80' }}>1,200+</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>Verified Academies</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '24px' }}>
          © {new Date().getFullYear()} DriveLearn India · Central Motor Vehicles Rules Compliant
        </div>
      </div>

      {/* Right Form Side */}
      <div className="auth-form-side">
        <div className="auth-form-box">
          <h2>Sign In</h2>
          <p className="auth-subtext">Access your driving portal and dashboard</p>

          {/* Google 1-Tap Login */}
          <GoogleSignInButton onError={setError} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
            <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 700 }}>OR SIGN IN WITH EMAIL</span>
            <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
          </div>

          {error && (
            <div className="auth-error">
              <strong>⚠️ Login Error:</strong> {error}
              <div style={{ marginTop: '6px' }}>
                <Link
                  to={`/forgot-password${formData.email ? `?email=${encodeURIComponent(formData.email)}` : ''}`}
                  style={{ color: '#B91C1C', fontWeight: 700, fontSize: '12px', textDecoration: 'underline' }}
                >
                  Forgot your password? Click here to reset →
                </Link>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ margin: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '12px', color: '#B3182F', fontWeight: 700, textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
              <div className="auth-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
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
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In to Dashboard →'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account yet? <Link to="/signup">Create free account →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;