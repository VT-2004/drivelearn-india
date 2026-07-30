import { useEffect, useState } from 'react';
import { getAllSchools, approveSchool, rejectSchool } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/dashboard.css';

const statusClass = {
  pending: 'status-pending',
  verified: 'status-verified',
  rejected: 'status-rejected',
};

const AdminDashboard = () => {
  const [schools, setSchools] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  const { logout } = useAuth();

  const loadSchools = async () => {
    setLoading(true);
    try {
      const res = await getAllSchools(filter === 'all' ? null : filter);
      setSchools(res.data.schools);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, [filter]);

  const handleApprove = async (id) => {
    await approveSchool(id);
    loadSchools();
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this school?')) return;
    await rejectSchool(id);
    loadSchools();
  };

  return (
    <div className="dash-page">
      <div className="dash-header">
        <h1>Admin Dashboard</h1>
        <button className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22' }} onClick={logout}>
          Logout
        </button>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        {['pending', 'verified', 'rejected', 'all'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="btn"
            style={{
              background: filter === f ? '#1C1F22' : 'transparent',
              color: filter === f ? '#fff' : '#1C1F22',
              border: '1.5px solid #1C1F22',
              textTransform: 'capitalize',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : schools.length === 0 ? (
        <div className="empty-state">No schools found for this filter.</div>
      ) : (
        <table className="dash-table">
          <thead>
            <tr>
              <th>School Name</th>
              <th>Owner</th>
              <th>Location</th>
              <th>Status</th>
              <th>Document</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.owner?.name}<br /><span style={{ color: '#8B929A', fontSize: '12px' }}>{s.owner?.email}</span></td>
                <td>{s.city}, {s.state}</td>
                <td><span className={`status-badge ${statusClass[s.verificationStatus]}`}>{s.verificationStatus}</span></td>
                <td>
                  {s.documentsUrl ? (
                    <a href={`http://localhost:5000${s.documentsUrl}`} target="_blank" rel="noreferrer">View</a>
                  ) : 'None'}
                </td>
                <td>
                  {s.verificationStatus === 'pending' && (
                    <>
                      <button className="action-btn approve-btn" onClick={() => handleApprove(s.id)}>Approve</button>
                      <button className="action-btn reject-btn" onClick={() => handleReject(s.id)}>Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard;
