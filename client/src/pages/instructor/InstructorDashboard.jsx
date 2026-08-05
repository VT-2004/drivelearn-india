import { useEffect, useState } from 'react';
import {
  getMyAssignedBookings,
  markAttendance,
  markBookingComplete,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/dashboard.css';

const InstructorDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFormId, setActiveFormId] = useState(null);
  const [attendanceData, setAttendanceData] = useState({ date: '', status: 'present', notes: '' });
  const [error, setError] = useState('');

  const { logout, user } = useAuth();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMyAssignedBookings();
      setBookings(res.data.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAttendanceForm = (bookingId) => {
    setActiveFormId(bookingId);
    setAttendanceData({ date: new Date().toISOString().split('T')[0], status: 'present', notes: '' });
    setError('');
  };

  const handleMarkAttendance = async (e, bookingId) => {
    e.preventDefault();
    setError('');
    try {
      await markAttendance({ bookingId, ...attendanceData });
      setActiveFormId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark attendance');
    }
  };

  const handleMarkComplete = async (bookingId) => {
    if (!window.confirm('Mark this course as fully completed?')) return;
    try {
      await markBookingComplete(bookingId);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to mark complete');
    }
  };

  if (loading) return <div className="dash-page">Loading...</div>;

  return (
    <div className="dash-page">
      <div className="dash-header">
        <h1>Instructor Dashboard</h1>
        <button className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22' }} onClick={logout}>
          Logout
        </button>
      </div>

      <p style={{ color: '#6B7680', marginBottom: '24px' }}>
        Welcome, {user?.name}. Below are your assigned students and lessons.
      </p>

      {bookings.length === 0 ? (
        <div className="empty-state">No students assigned to you yet.</div>
      ) : (
        bookings.map((b) => (
          <div className="form-card" key={b.id} style={{ marginBottom: '20px', maxWidth: '700px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: '0 0 6px' }}>{b.learner.name}</h3>
                <p style={{ margin: '0 0 4px', color: '#6B7680', fontSize: '14px' }}>{b.learner.phone}</p>
                <p style={{ margin: '0 0 4px', fontSize: '14px' }}><strong>Course:</strong> {b.course.title}</p>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  <strong>Booked Date:</strong> {new Date(b.bookedDate).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`status-badge ${b.status === 'completed' ? 'status-verified' : 'status-pending'}`}>
                  {b.status}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }} onClick={() => openAttendanceForm(b.id)}>
                + Mark Attendance
              </button>
              {b.status === 'confirmed' && (
                <button className="btn btn-outline" style={{ fontSize: '13px', padding: '8px 16px', color: '#1C1F22', border: '1.5px solid #1C1F22' }} onClick={() => handleMarkComplete(b.id)}>
                  Mark Course Completed
                </button>
              )}
            </div>

            {activeFormId === b.id && (
              <form onSubmit={(e) => handleMarkAttendance(e, b.id)} style={{ marginTop: '16px', borderTop: '1px solid #EFEDE6', paddingTop: '16px' }}>
                <label>Lesson Date</label>
                <input
                  type="date"
                  value={attendanceData.date}
                  onChange={(e) => setAttendanceData({ ...attendanceData, date: e.target.value })}
                  required
                />
                <label>Status</label>
                <select
                  value={attendanceData.status}
                  onChange={(e) => setAttendanceData({ ...attendanceData, status: e.target.value })}
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                </select>
                <label>Progress Notes</label>
                <textarea
                  placeholder="e.g. Completed reverse parking, needs more practice on highways"
                  value={attendanceData.notes}
                  onChange={(e) => setAttendanceData({ ...attendanceData, notes: e.target.value })}
                />
                {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button type="submit" className="btn btn-primary">Save Attendance</button>
                  <button type="button" className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22' }} onClick={() => setActiveFormId(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {b.attendance.length > 0 && (
              <div style={{ marginTop: '16px', borderTop: '1px solid #EFEDE6', paddingTop: '16px' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Lesson History</p>
                {b.attendance.map((a) => (
                  <div key={a.id} style={{ fontSize: '13px', color: '#6B7680', marginBottom: '6px' }}>
                    {new Date(a.date).toLocaleDateString('en-IN')} —{' '}
                    <span style={{ color: a.status === 'present' ? '#2E7D32' : '#B3261E', fontWeight: 600 }}>
                      {a.status}
                    </span>
                    {a.notes && ` — ${a.notes}`}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default InstructorDashboard;
