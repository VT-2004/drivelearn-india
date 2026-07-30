import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMySchool, getMyBranches, addBranch, deleteBranch } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/dashboard.css';

const statusClass = {
  pending: 'status-pending',
  verified: 'status-verified',
  rejected: 'status-rejected',
};

const SchoolDashboard = () => {
  const [school, setSchool] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [branchData, setBranchData] = useState({ city: '', state: '', address: '' });

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const schoolRes = await getMySchool();
      setSchool(schoolRes.data.school);

      const branchRes = await getMyBranches();
      setBranches(branchRes.data.branches);
    } catch (err) {
      if (err.response?.status === 404) {
        navigate('/school/register');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddBranch = async (e) => {
    e.preventDefault();
    try {
      await addBranch(branchData);
      setBranchData({ city: '', state: '', address: '' });
      setShowBranchForm(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add branch');
    }
  };

  const handleDeleteBranch = async (id) => {
    if (!window.confirm('Delete this branch?')) return;
    await deleteBranch(id);
    loadData();
  };

  if (loading) return <div className="dash-page">Loading...</div>;
  if (!school) return null;

  return (
    <div className="dash-page">
      <div className="dash-header">
        <h1>School Dashboard</h1>
        <button className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22' }} onClick={logout}>
          Logout
        </button>
      </div>

      <div className="form-card" style={{ marginBottom: '32px' }}>
        <h3 style={{ marginTop: 0 }}>{school.name}</h3>
        <span className={`status-badge ${statusClass[school.verificationStatus]}`}>
          {school.verificationStatus}
        </span>
        <p style={{ color: '#6B7680', fontSize: '14px', marginTop: '16px' }}>
          {school.description || 'No description added yet.'}
        </p>
        <p style={{ fontSize: '14px' }}>
          <strong>Main Location:</strong> {school.address}, {school.city}, {school.state}
        </p>
        {school.verificationStatus === 'pending' && (
          <p style={{ fontSize: '13px', color: '#856404', background: '#FFF3CD', padding: '10px', borderRadius: '4px' }}>
            Your school is awaiting verification from our team. You'll be notified once approved.
          </p>
        )}
      </div>

      <div className="dash-header">
        <h1 style={{ fontSize: '22px' }}>Branches</h1>
        <button className="btn btn-primary" onClick={() => setShowBranchForm(!showBranchForm)}>
          {showBranchForm ? 'Cancel' : '+ Add Branch'}
        </button>
      </div>

      {showBranchForm && (
        <form className="form-card" onSubmit={handleAddBranch} style={{ marginBottom: '24px' }}>
          <label>City</label>
          <input
            type="text"
            value={branchData.city}
            onChange={(e) => setBranchData({ ...branchData, city: e.target.value })}
            required
          />
          <label>State</label>
          <input
            type="text"
            value={branchData.state}
            onChange={(e) => setBranchData({ ...branchData, state: e.target.value })}
            required
          />
          <label>Address</label>
          <input
            type="text"
            value={branchData.address}
            onChange={(e) => setBranchData({ ...branchData, address: e.target.value })}
            required
          />
          <button type="submit" className="btn btn-primary submit-btn">Save Branch</button>
        </form>
      )}

      {branches.length === 0 ? (
        <div className="empty-state">No branches added yet. Add one if you operate in multiple locations.</div>
      ) : (
        branches.map((b) => (
          <div className="branch-card" key={b.id}>
            <span>{b.address}, {b.city}, {b.state}</span>
            <button className="action-btn reject-btn" onClick={() => handleDeleteBranch(b.id)}>
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default SchoolDashboard;
