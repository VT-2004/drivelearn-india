import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerSchool } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/dashboard.css';

const RegisterSchool = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    city: '',
    state: '',
    address: '',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      if (file) data.append('document', file);

      await registerSchool(data);
      navigate('/school');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dash-page">
      <div className="dash-header">
        <h1>Register Your Driving School</h1>
        <button className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22' }} onClick={logout}>
          Logout
        </button>
      </div>

      <div className="form-card">
        <p style={{ marginTop: 0, color: '#6B7680', fontSize: '14px' }}>
          Logged in as {user?.name}. Fill out your school details below — your school will
          go live once verified by our team.
        </p>

        <form onSubmit={handleSubmit}>
          <label>School Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />

          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} />

          <label>City</label>
          <input type="text" name="city" value={formData.city} onChange={handleChange} required />

          <label>State</label>
          <input type="text" name="state" value={formData.state} onChange={handleChange} required />

          <label>Address</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} required />

          <label>Verification Document (License/Registration proof)</label>
          <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} />
          <p className="form-hint">Accepted formats: JPG, PNG, PDF (max 5MB)</p>

          {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}

          <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit for Verification'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterSchool;
