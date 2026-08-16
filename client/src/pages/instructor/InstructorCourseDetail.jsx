import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getCourseStudents,
  markBookingComplete,
  clockIn,
  clockOut,
  getInstructorCalendar,
  postUpdate,
  getUpdates,
} from '../../services/api';
import AccountMenu from '../../components/AccountMenu';
import LiveClock from '../../components/LiveClock';
import AttendanceCalendar from '../../components/AttendanceCalendar';
import '../../styles/dashboard.css';

const statusTabs = [
  { key: 'all', label: 'All' },
  { key: 'confirmed', label: 'Ongoing' },
  { key: 'completed', label: 'Completed' },
  { key: 'pending', label: 'Pending Payment' },
  { key: 'cancelled', label: 'Cancelled' },
];

const InstructorCourseDetail = () => {
  const { id: courseId } = useParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('confirmed');

  const [updateFormFor, setUpdateFormFor] = useState(null);
  const [updateText, setUpdateText] = useState('');
  const [detailsFor, setDetailsFor] = useState(null);
  const [updatesMap, setUpdatesMap] = useState({});
  const [error, setError] = useState('');

  const load = async (statusFilter) => {
    setLoading(true);
    try {
      const status = statusFilter === 'all' ? undefined : statusFilter;
      const res = await getCourseStudents(courseId, status);
      setBookings(res.data.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, courseId]);

  const handleMarkComplete = async (bookingId) => {
    if (!window.confirm('Mark this course as fully completed for this student?')) return;
    try {
      await markBookingComplete(bookingId);
      load(activeTab);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to mark complete');
    }
  };

  const handleClockIn = async (bookingId) => {
    try {
      await clockIn(bookingId);
      load(activeTab);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to clock in');
    }
  };

  const handleClockOut = async (bookingId) => {
    try {
      await clockOut(bookingId);
      load(activeTab);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to clock out');
    }
  };

  const getTodayAttendance = (booking) => {
    const today = new Date().toDateString();
    return booking.attendance.find((a) => new Date(a.date).toDateString() === today);
  };

  const handlePostUpdate = async (bookingId) => {
    if (!updateText.trim()) return;
    setError('');
    try {
      await postUpdate(bookingId, updateText);
      setUpdateText('');
      setUpdateFormFor(null);
      if (updatesMap[bookingId]) {
        const res = await getUpdates(bookingId);
        setUpdatesMap({ ...updatesMap, [bookingId]: res.data.updates });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post update');
    }
  };

  const toggleDetails = async (bookingId) => {
    if (detailsFor === bookingId) {
      setDetailsFor(null);
      return;
    }
    if (!updatesMap[bookingId]) {
      const res = await getUpdates(bookingId);
      setUpdatesMap({ ...updatesMap, [bookingId]: res.data.updates });
    }
    setDetailsFor(bookingId);
  };

  const courseTitle = bookings[0]?.course?.title || 'Course';

  return (
    <div className="dash-page">
      <div className="dash-header">
        <h1 style={{ fontSize: '24px' }}>{courseTitle}</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link to="/instructor" className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22' }}>
            ← All Courses
          </Link>
          <LiveClock />
          <AccountMenu />
        </div>
      </div>

      <div className="dash-header" style={{ marginTop: '10px' }}>
        <h1 style={{ fontSize: '20px' }}>Students</h1>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {statusTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className="btn"
            style={{
              background: activeTab === t.key ? '#1C1F22' : 'transparent',
              color: activeTab === t.key ? '#fff' : '#1C1F22',
              border: '1.5px solid #1C1F22',
              fontSize: '13px',
              padding: '8px 14px',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : bookings.length === 0 ? (
        <div className="empty-state">No students in this category.</div>
      ) : (
        bookings.map((b) => (
          <div className="form-card" key={b.id} style={{ marginBottom: '20px', maxWidth: '750px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: '0 0 6px' }}>{b.learner.name}</h3>
                <p style={{ margin: '0 0 4px', color: '#6B7680', fontSize: '14px' }}>{b.learner.email}</p>
                <p style={{ margin: '0 0 4px', color: '#6B7680', fontSize: '14px' }}>{b.learner.phone}</p>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  <strong>Booked Date:</strong> {new Date(b.bookedDate).toLocaleDateString('en-IN')}
                </p>
              </div>
              <span className={`status-badge ${b.status === 'completed' ? 'status-verified' : b.status === 'cancelled' ? 'status-rejected' : 'status-pending'}`}>
                {b.status}
              </span>
            </div>

            {b.status === 'confirmed' && (
              <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {(() => {
                  const todayRecord = getTodayAttendance(b);
                  if (!todayRecord || !todayRecord.checkInTime) {
                    return (
                      <button className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 16px', background: '#2E7D32' }} onClick={() => handleClockIn(b.id)}>
                        🟢 Clock In
                      </button>
                    );
                  }
                  if (todayRecord.checkInTime && !todayRecord.checkOutTime) {
                    return (
                      <button className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 16px', background: '#B3261E' }} onClick={() => handleClockOut(b.id)}>
                        🔴 Clock Out
                      </button>
                    );
                  }
                  return (
                    <span style={{ fontSize: '13px', color: '#2E7D32', fontWeight: 600, alignSelf: 'center' }}>
                      ✓ Today: {new Date(todayRecord.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} - {new Date(todayRecord.checkOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  );
                })()}
                <button className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }} onClick={() => { setUpdateFormFor(updateFormFor === b.id ? null : b.id); setError(''); }}>
                  💬 Post Update
                </button>
                <button className="btn btn-outline" style={{ fontSize: '13px', padding: '8px 16px', color: '#1C1F22', border: '1.5px solid #1C1F22' }} onClick={() => toggleDetails(b.id)}>
                  📜 {detailsFor === b.id ? 'Hide Details' : 'View Details'}
                </button>
                <button className="btn btn-outline" style={{ fontSize: '13px', padding: '8px 16px', color: '#1C1F22', border: '1.5px solid #1C1F22' }} onClick={() => handleMarkComplete(b.id)}>
                  Mark Completed
                </button>
              </div>
            )}

            {b.status !== 'confirmed' && (
              <div style={{ marginTop: '16px' }}>
                <button className="btn btn-outline" style={{ fontSize: '13px', padding: '8px 16px', color: '#1C1F22', border: '1.5px solid #1C1F22' }} onClick={() => toggleDetails(b.id)}>
                  📜 {detailsFor === b.id ? 'Hide Details' : 'View Details'}
                </button>
              </div>
            )}

            {updateFormFor === b.id && (
              <div style={{ marginTop: '16px', borderTop: '1px solid #EFEDE6', paddingTop: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Today's update for {b.learner.name}
                </label>
                <textarea
                  placeholder="e.g. Practiced reverse parking today, showing good progress..."
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #D8D4C9', borderRadius: '5px', minHeight: '80px', fontFamily: 'inherit', fontSize: '14px' }}
                />
                {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button className="btn btn-primary" onClick={() => handlePostUpdate(b.id)}>Save Update</button>
                  <button className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22' }} onClick={() => setUpdateFormFor(null)}>Cancel</button>
                </div>
              </div>
            )}

            {detailsFor === b.id && (
              <div style={{ marginTop: '16px', borderTop: '1px solid #EFEDE6', paddingTop: '16px' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>Update History</p>
                {(!updatesMap[b.id] || updatesMap[b.id].length === 0) ? (
                  <p style={{ fontSize: '13px', color: '#8B929A' }}>No updates posted yet.</p>
                ) : (
                  updatesMap[b.id].map((u) => (
                    <div key={u.id} style={{ fontSize: '13px', color: '#6B7680', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #F0EEE7' }}>
                      <strong style={{ color: '#1C1F22' }}>{u.author.name}</strong>
                      <span style={{ color: '#8B929A' }}> ({u.authorRole}) — {new Date(u.createdAt).toLocaleString('en-IN')}</span>
                      <p style={{ margin: '4px 0 0' }}>{u.message}</p>
                    </div>
                  ))
                )}

                {b.attendance.length > 0 && (
                  <>
                    <p style={{ fontSize: '13px', fontWeight: 600, margin: '16px 0 10px' }}>Attendance History</p>
                    {b.attendance.map((a) => (
                      <div key={a.id} style={{ fontSize: '13px', color: '#6B7680', marginBottom: '6px' }}>
                        {new Date(a.date).toLocaleDateString('en-IN')} —{' '}
                        <span style={{ color: a.status === 'present' ? '#2E7D32' : '#B3261E', fontWeight: 600 }}>
                          {a.status}
                        </span>
                        {a.checkInTime && a.checkOutTime && (
                          ` (${new Date(a.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} - ${new Date(a.checkOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })})`
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        ))
      )}

      <div className="dash-header" style={{ marginTop: '40px' }}>
        <h1 style={{ fontSize: '20px' }}>Course Attendance Calendar</h1>
      </div>
      <div className="form-card" style={{ maxWidth: '600px' }}>
        <AttendanceCalendar fetchFn={(month, year) => getInstructorCalendar(month, year, courseId)} />
      </div>
    </div>
  );
};

export default InstructorCourseDetail;