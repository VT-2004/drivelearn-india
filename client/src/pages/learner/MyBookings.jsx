import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/dashboard.css';

const statusClass = {
  pending: 'status-pending',
  confirmed: 'status-verified',
  completed: 'status-verified',
  cancelled: 'status-rejected',
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  const load = async () => {
    setLoading(true);
    const res = await getMyBookings();
    setBookings(res.data.bookings);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    await cancelBooking(id);
    load();
  };

  return (
    <div className="dash-page">
      <div className="dash-header">
        <h1>My Bookings</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/learner" className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22' }}>
            Find More Schools
          </Link>
          <button className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22' }} onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          No bookings yet. <Link to="/learner">Find a driving school</Link> to get started.
        </div>
      ) : (
        bookings.map((b) => (
          <div className="form-card" key={b.id} style={{ marginBottom: '16px', maxWidth: '700px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: '0 0 6px' }}>{b.course.title}</h3>
                <p style={{ margin: '0 0 4px', color: '#6B7680', fontSize: '14px' }}>
                  {b.course.school.name} — {b.course.school.city}
                </p>
                <p style={{ margin: '0 0 4px', fontSize: '14px' }}>
                  <strong>Date:</strong> {new Date(b.bookedDate).toLocaleDateString('en-IN')}
                </p>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  <strong>Instructor:</strong> {b.instructor.user.name}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`status-badge ${statusClass[b.status]}`}>{b.status}</span>
                {(b.status === 'pending' || b.status === 'confirmed') && (
                  <div style={{ marginTop: '10px' }}>
                    <button className="action-btn reject-btn" onClick={() => handleCancel(b.id)}>Cancel</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyBookings;
