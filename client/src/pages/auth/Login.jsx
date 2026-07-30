import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
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
      setError(err.response?.data?.error || 'Login failed. Please try again.');
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
        <h2>Welcome back to the road ahead</h2>
        <p>
          Log in to manage your bookings, track your progress, or run your
          driving school — all from one place.
        </p>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-box">
          <h2>Log In</h2>
          <p className="auth-subtext">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
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

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;