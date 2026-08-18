import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSchoolProfile, createBooking, getAvailableSlotsForInstructor } from '../../services/api';
import '../../styles/search.css';

const SchoolProfile = () => {
  const { id } = useParams();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [bookingCourse, setBookingCourse] = useState(null); // course being booked
  const [bookingInstructorId, setBookingInstructorId] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await getSchoolProfile(id);
      setSchool(res.data.school);
    } catch (err) {
      setError(err.response?.data?.error || 'School not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const openBookingForm = (course) => {
    setBookingCourse(course);
    setBookingInstructorId('');
    setAvailableSlots([]);
    setSelectedSlotId('');
    setBookingError('');
    setBookingSuccess('');
  };

  const handleInstructorSelect = async (instructorId) => {
    setBookingInstructorId(instructorId);
    setSelectedSlotId('');
    setAvailableSlots([]);
    if (!instructorId) return;

    setLoadingSlots(true);
    try {
      const res = await getAvailableSlotsForInstructor(instructorId);
      setAvailableSlots(res.data.slots);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    if (!selectedSlotId) {
      setBookingError('Please select a time slot');
      return;
    }
    setSubmitting(true);
    try {
      await createBooking({
        courseId: bookingCourse.id,
        slotId: selectedSlotId,
      });
      setBookingSuccess('Booking created successfully! View it under "My Bookings".');
      setBookingCourse(null);
    } catch (err) {
      setBookingError(err.response?.data?.error || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '60px' }}>Loading...</div>;
  if (error) return <div style={{ padding: '60px' }}>{error} — <Link to="/learner">Go back to search</Link></div>;
  if (!school) return null;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <div className="profile-hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Link to="/learner" style={{ display: 'block', marginBottom: '16px', color: '#F2B705', fontSize: '13px', textDecoration: 'none' }}>← Back to search</Link>
            <span className="verified-tag">Verified School</span>
            {school.avgRating && (
              <span style={{ marginLeft: '10px', color: '#F2B705', fontWeight: 600, fontSize: '14px' }}>
                ★ {school.avgRating} ({school.reviewCount} review{school.reviewCount !== 1 ? 's' : ''})
              </span>
            )}
            <h1>{school.name}</h1>
            <p style={{ color: '#C8CDD2' }}>{school.address}, {school.city}, {school.state}</p>
          </div>
          <Link to="/learner/bookings" className="btn btn-outline">My Bookings</Link>
        </div>
      </div>

      {bookingSuccess && (
        <div style={{ background: '#E8F5E9', color: '#2E7D32', padding: '14px 48px', fontSize: '14px' }}>
          {bookingSuccess}
        </div>
      )}

      <div className="profile-body">
        <div>
          <div className="profile-section">
            <h2>About</h2>
            <p>{school.description || 'No description provided by this school yet.'}</p>
          </div>

          <div className="profile-section">
            <h2>Courses</h2>
            {school.courses.length === 0 ? (
              <p style={{ color: '#8B929A' }}>No courses listed yet.</p>
            ) : (
              school.courses.map((c) => (
                <div key={c.id}>
                  <div className="course-card">
                    <div>
                      <h4>{c.title}</h4>
                      <p style={{ color: '#6B7680', fontSize: '14px', margin: 0 }}>
                        {c.description} · {c.durationDays} days
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="course-price-tag">
                        ₹{Number(c.price).toLocaleString('en-IN')}
                      </div>
                      <br />
                      <button
                        className="btn btn-primary"
                        style={{ marginTop: '10px', fontSize: '13px', padding: '8px 16px' }}
                        onClick={() => openBookingForm(c)}
                      >
                        Book This Course
                      </button>
                    </div>
                  </div>

                  {bookingCourse?.id === c.id && (
                    <form className="form-card" onSubmit={handleBookingSubmit} style={{ marginBottom: '20px' }}>
                      <h4 style={{ marginTop: 0 }}>Book: {c.title}</h4>

                      <label>Select Instructor</label>
                      <select value={bookingInstructorId} onChange={(e) => handleInstructorSelect(e.target.value)} required>
                        <option value="">Choose an instructor...</option>
                        {school.instructors.map((i) => (
                          <option key={i.id} value={i.id}>{i.user.name}{i.specialization ? ` — ${i.specialization}` : ''}</option>
                        ))}
                      </select>

                      {bookingInstructorId && (
                        <>
                          <label>Available Time Slots</label>
                          {loadingSlots ? (
                            <p style={{ fontSize: '13px', color: '#8B929A' }}>Loading slots...</p>
                          ) : availableSlots.length === 0 ? (
                            <p style={{ fontSize: '13px', color: '#B3261E' }}>
                              This instructor has no available slots right now. Try another instructor.
                            </p>
                          ) : (
                            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1.5px solid #D8D4C9', borderRadius: '5px', marginBottom: '10px' }}>
                              {availableSlots.map((s) => (
                                <div
                                  key={s.id}
                                  onClick={() => setSelectedSlotId(s.id)}
                                  style={{
                                    padding: '10px 14px', cursor: 'pointer', fontSize: '14px',
                                    background: selectedSlotId === s.id ? '#FFF8E1' : 'white',
                                    borderBottom: '1px solid #F0EEE7',
                                  }}
                                >
                                  {new Date(s.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · {s.startTime} – {s.endTime}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}

                      {bookingError && <p style={{ color: 'red', fontSize: '14px' }}>{bookingError}</p>}

                      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button type="submit" className="btn btn-primary" disabled={submitting || !selectedSlotId}>
                          {submitting ? 'Booking...' : 'Confirm Booking'}
                        </button>
                        <button type="button" className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22' }} onClick={() => setBookingCourse(null)}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="profile-section">
            <h2>Instructors</h2>
            {school.instructors.length === 0 ? (
              <p style={{ color: '#8B929A' }}>No instructors listed yet.</p>
            ) : (
              <div>
                {school.instructors.map((i) => (
                  <span className="instructor-chip" key={i.id}>
                    {i.user.name}{i.specialization ? ` — ${i.specialization}` : ''}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="profile-section">
            <h2>Reviews {school.avgRating && `(★ ${school.avgRating} average)`}</h2>
            {school.reviews.length === 0 ? (
              <p style={{ color: '#8B929A' }}>No reviews yet.</p>
            ) : (
              school.reviews.map((r) => (
                <div key={r.id} style={{ borderBottom: '1px solid #EFEDE6', padding: '14px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '14px' }}>{r.learner.name}</strong>
                    <span style={{ color: '#F2B705', fontWeight: 600 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  {r.comment && <p style={{ fontSize: '14px', color: '#6B7680', margin: '6px 0 0' }}>{r.comment}</p>}
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="sidebar-card">
            <h4>Branches</h4>
            {school.branches.length === 0 ? (
              <p style={{ fontSize: '14px', color: '#8B929A' }}>Single location only.</p>
            ) : (
              school.branches.map((b) => (
                <p key={b.id} style={{ fontSize: '14px', marginBottom: '8px' }}>
                  {b.address}, {b.city}, {b.state}
                </p>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolProfile;