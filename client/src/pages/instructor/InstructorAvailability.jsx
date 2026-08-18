import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyAvailability, addAvailability, deleteAvailability } from '../../services/api';
import AccountMenu from '../../components/AccountMenu';
import LiveClock from '../../components/LiveClock';
import '../../styles/dashboard.css';

const InstructorAvailability = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ date: '', startTime: '', endTime: '' });
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMyAvailability();
      setSlots(res.data.slots);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await addAvailability(formData);
      setFormData({ date: '', startTime: '', endTime: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add slot');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this slot?')) return;
    try {
      await deleteAvailability(id);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete slot');
    }
  };

  const grouped = slots.reduce((acc, s) => {
    const dateKey = new Date(s.date).toLocaleDateString('en-IN');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(s);
    return acc;
  }, {});

  return (
    <div className="dash-page">
      <div className="dash-header">
        <h1>My Availability</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link to="/instructor" className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22' }}>
            ← All Courses
          </Link>
          <LiveClock />
          <AccountMenu />
        </div>
      </div>

      <p style={{ color: '#6B7680', marginBottom: '24px' }}>
        Add the time slots you're free to teach. Learners can only book you during these times.
      </p>

      <form className="form-card" onSubmit={handleSubmit} style={{ maxWidth: '500px', marginBottom: '28px' }}>
        <h3 style={{ marginTop: 0 }}>Add a Slot</h3>
        <label>Date</label>
        <input type="date" name="date" min={today} value={formData.date} onChange={handleChange} required />
        <label>Start Time</label>
        <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required />
        <label>End Time</label>
        <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required />
        {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
        <button type="submit" className="btn btn-primary submit-btn">Add Slot</button>
      </form>

      <div className="dash-header">
        <h1 style={{ fontSize: '20px' }}>Upcoming Slots</h1>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="empty-state">No availability slots added yet.</div>
      ) : (
        Object.entries(grouped).map(([date, daySlots]) => (
          <div key={date} style={{ marginBottom: '18px' }}>
            <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>{date}</p>
            {daySlots.map((s) => (
              <div className="branch-card" key={s.id}>
                <span>
                  {s.startTime} – {s.endTime}
                  {s.isBooked && (
                    <span className="status-badge status-verified" style={{ marginLeft: '10px' }}>Booked</span>
                  )}
                </span>
                {!s.isBooked && (
                  <button className="action-btn reject-btn" onClick={() => handleDelete(s.id)}>Remove</button>
                )}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default InstructorAvailability;