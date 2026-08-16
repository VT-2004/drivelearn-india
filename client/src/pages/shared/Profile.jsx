import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMe, updateProfile, changePassword } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/dashboard.css';

const roleLabels = {
  admin: 'Super Admin',
  school_owner: 'School Owner',
  instructor: 'Instructor',
  learner: 'Learner',
};

const Profile = () => {
  const { user, login } = useAuth();
  const [profileData, setProfileData] = useState({ name: '', phone: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');

  const [fullUser, setFullUser] = useState(user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMe();
        setFullUser(res.data.user);
        setProfileData({ name: res.data.user.name, phone: res.data.user.phone });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');
    try {
      const res = await updateProfile(profileData);
      setProfileMsg('Profile updated successfully.');
      const token = localStorage.getItem('token');
      login(res.data.user, token);
      setFullUser(res.data.user);
    } catch (err) {
      setProfileError(err.response?.data?.error || 'Failed to update profile');
    }
  };

  const handlePwChange = (e) => {
    setPwData({ ...pwData, [e.target.name]: e.target.value });
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwMsg('');
    setPwError('');
    if (pwData.newPassword !== pwData.confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    try {
      await changePassword({ currentPassword: pwData.currentPassword, newPassword: pwData.newPassword });
      setPwMsg('Password changed successfully.');
      setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.response?.data?.error || 'Failed to change password');
    }
  };

  const roleRoutes = {
    admin: '/admin',
    school_owner: '/school',
    instructor: '/instructor',
    learner: '/learner',
  };

  if (loading) return <div className="dash-page">Loading...</div>;

  return (
    <div className="dash-page">
      <div className="dash-header">
        <h1>My Profile</h1>
        <Link to={roleRoutes[user?.role] || '/'} className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22' }}>
          ← Back to Dashboard
        </Link>
      </div>

      <div className="form-card" style={{ maxWidth: '500px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%', background: '#1C1F22',
            color: '#F2B705', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '22px', fontFamily: 'var(--font-mono)',
          }}>
            {fullUser?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px' }}>{fullUser?.name}</div>
            <span style={{
              fontSize: '11px', textTransform: 'uppercase', background: '#1C1F22',
              color: '#F2B705', padding: '3px 8px', borderRadius: '10px', display: 'inline-block', marginTop: '4px',
            }}>
              {roleLabels[fullUser?.role] || fullUser?.role}
            </span>
          </div>
        </div>

        {fullUser?.role === 'learner' && (
          <div className="dash-price-tag" style={{ display: 'inline-block', marginBottom: '20px', fontSize: '15px' }}>
            💰 Wallet Balance: ₹{Number(fullUser.walletBalance).toLocaleString('en-IN')}
          </div>
        )}

        <h3 style={{ marginTop: 0 }}>Account Details</h3>
        <form onSubmit={handleProfileSubmit}>
          <label>Full Name</label>
          <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} required />

          <label>Email (cannot be changed)</label>
          <input type="email" value={fullUser?.email || ''} disabled style={{ background: '#F0EEE7', color: '#8B929A' }} />

          <label>Phone</label>
          <input type="text" name="phone" value={profileData.phone} onChange={handleProfileChange} required />

          {profileMsg && <p style={{ color: '#2E7D32', fontSize: '14px' }}>{profileMsg}</p>}
          {profileError && <p style={{ color: 'red', fontSize: '14px' }}>{profileError}</p>}

          <button type="submit" className="btn btn-primary submit-btn">Save Changes</button>
        </form>
      </div>

      <div className="form-card" style={{ maxWidth: '500px' }}>
        <h3 style={{ marginTop: 0 }}>Change Password</h3>
        <form onSubmit={handlePwSubmit}>
          <label>Current Password</label>
          <input type="password" name="currentPassword" value={pwData.currentPassword} onChange={handlePwChange} required />

          <label>New Password</label>
          <input type="password" name="newPassword" value={pwData.newPassword} onChange={handlePwChange} required />
          <p className="form-hint">At least 8 characters, with uppercase, lowercase, a number, and a special character.</p>

          <label>Confirm New Password</label>
          <input type="password" name="confirmPassword" value={pwData.confirmPassword} onChange={handlePwChange} required />

          {pwMsg && <p style={{ color: '#2E7D32', fontSize: '14px' }}>{pwMsg}</p>}
          {pwError && <p style={{ color: 'red', fontSize: '14px' }}>{pwError}</p>}

          <button type="submit" className="btn btn-primary submit-btn">Change Password</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;