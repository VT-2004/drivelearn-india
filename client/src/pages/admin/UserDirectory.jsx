import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers } from '../../services/api';
import AccountMenu from '../../components/AccountMenu';
import '../../styles/dashboard.css';

const roleLabels = {
  admin: 'Super Admin',
  school_owner: 'School Owner',
  instructor: 'Instructor',
  learner: 'Learner',
};

const UserDirectory = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = async (role) => {
    setLoading(true);
    try {
      const res = await getAllUsers(role === 'all' ? null : role);
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  return (
    <div className="dash-page">
      <div className="dash-header">
        <h1>User Directory</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link to="/admin" className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22' }}>
            ← Back to Dashboard
          </Link>
          <AccountMenu />
        </div>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {['all', 'learner', 'school_owner', 'instructor', 'admin'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="btn"
            style={{
              background: filter === f ? '#1C1F22' : 'transparent',
              color: filter === f ? '#fff' : '#1C1F22',
              border: '1.5px solid #1C1F22',
            }}
          >
            {f === 'all' ? 'All Users' : roleLabels[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : users.length === 0 ? (
        <div className="empty-state">No users found for this filter.</div>
      ) : (
        <table className="dash-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Role</th>
              <th>Context</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}<br /><span style={{ color: '#8B929A', fontSize: '12px' }}>{u.phone}</span></td>
                <td>
                  <span className="status-badge status-pending" style={{ background: '#F0EEE7', color: '#1C1F22' }}>
                    {roleLabels[u.role]}
                  </span>
                </td>
                <td style={{ fontSize: '13px' }}>
                  {u.role === 'learner' && `Wallet: ₹${Number(u.walletBalance).toLocaleString('en-IN')} · ${u._count.bookings} booking(s)`}
                  {u.role === 'school_owner' && (u.drivingSchool ? `${u.drivingSchool.name} (${u.drivingSchool.verificationStatus})` : 'No school registered')}
                  {u.role === 'instructor' && (u.instructor ? `${u.instructor.school.name}${u.instructor.specialization ? ` · ${u.instructor.specialization}` : ''}` : '—')}
                  {u.role === 'admin' && '—'}
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserDirectory;