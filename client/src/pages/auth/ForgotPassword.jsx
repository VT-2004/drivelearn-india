import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { checkEmailExists, forgotPassword } from '../../services/api';
import '../../styles/auth.css';

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  // Multi-step state: 1 = Verify Email, 2 = Set New Password
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(initialEmail);
  const [verifiedName, setVerifiedName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Auto check email if passed via query param
  useEffect(() => {
    if (initialEmail && initialEmail.includes('@')) {
      handleVerifyEmail(null, initialEmail);
    }
  }, [initialEmail]);

  // Step 1: Verify Email Exists in DB
  const handleVerifyEmail = async (e, directEmail) => {
    if (e) e.preventDefault();
    const emailToVerify = (directEmail || email).trim();
    if (!emailToVerify) {
      setError('Please enter your registered Gmail or email address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await checkEmailExists(emailToVerify);
      setVerifiedName(res.data.user?.name || 'User');
      setSuccess(`✓ Account found for ${res.data.user?.name || emailToVerify}! You can now enter your new password below.`);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'No registered account found with this email. Please verify spelling or sign up.');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const res = await forgotPassword({
        email: email.trim(),
        newPassword,
      });
      setSuccess(res.data.message || 'Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1800);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <Link to="/login" className="auth-back-home">← Back to Log In</Link>
        <div className="auth-visual-logo">
          Drive<span>Learn</span> India
        </div>
        <h2>Reset Your Password</h2>
        <p>
          Fast, secure account recovery. Verify your registered Gmail address to set a new password instantly.
        </p>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              background: '#D32F2F',
              color: '#FFFFFF',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 800,
            }}>
              {step}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#D32F2F', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {step === 1 ? 'Step 1: Verify Account Gmail' : 'Step 2: Enter New Password'}
            </span>
          </div>

          <h2 style={{ margin: '0 0 6px' }}>{step === 1 ? 'Find Your Account' : 'Set New Password'}</h2>
          <p className="auth-subtext" style={{ marginBottom: '20px' }}>
            {step === 1
              ? 'Enter your registered Gmail or email address to verify your account.'
              : `Setting new password for ${verifiedName || email}`}
          </p>

          {success && (
            <div style={{
              background: '#E8F5E9',
              color: '#2E7D32',
              padding: '12px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '16px',
              border: '1px solid #C8E6C9',
            }}>
              {success}
            </div>
          )}

          {error && <div className="auth-error" style={{ marginBottom: '16px' }}>{error}</div>}

          {/* STEP 1: Verify Gmail */}
          {step === 1 && (
            <form onSubmit={handleVerifyEmail}>
              <label>Registered Gmail / Email Address</label>
              <input
                type="email"
                placeholder="e.g. yourname@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />

              <button
                type="submit"
                className="btn btn-primary auth-submit-btn"
                disabled={loading}
                style={{ marginTop: '14px', background: '#D32F2F', color: '#FFFFFF', fontWeight: 700 }}
              >
                {loading ? 'Verifying Email in Database...' : 'Verify Gmail & Continue →'}
              </button>
            </form>
          )}

          {/* STEP 2: Enter New Password & Re-enter New Password */}
          {step === 2 && (
            <form onSubmit={handleResetPassword}>
              <div style={{
                background: '#F8F9FA',
                border: '1px solid #E9ECEF',
                borderRadius: '6px',
                padding: '10px 14px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#6B7680', textTransform: 'uppercase' }}>Verified Account</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#181A1B' }}>{email}</div>
                </div>
                <button
                  type="button"
                  onClick={() => { setStep(1); setSuccess(''); setError(''); }}
                  style={{ background: 'none', border: 'none', color: '#D32F2F', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Change Email
                </button>
              </div>

              {/* Slot 1: Enter New Password */}
              <label>Enter New Password *</label>
              <input
                type="password"
                placeholder="Min 8 characters (mixed case + number)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoFocus
              />

              {/* Slot 2: Re-enter New Password */}
              <label style={{ marginTop: '12px' }}>Re-enter New Password *</label>
              <input
                type="password"
                placeholder="Re-type new password to confirm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <button
                type="submit"
                className="btn btn-primary auth-submit-btn"
                disabled={loading}
                style={{ marginTop: '16px', background: '#D32F2F', color: '#FFFFFF', fontWeight: 700 }}
              >
                {loading ? 'Updating Password...' : 'Save New Password & Log In'}
              </button>
            </form>
          )}

          <p className="auth-switch" style={{ marginTop: '24px' }}>
            Remembered your credentials? <Link to="/login" style={{ color: '#D32F2F', fontWeight: 600 }}>Back to Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
