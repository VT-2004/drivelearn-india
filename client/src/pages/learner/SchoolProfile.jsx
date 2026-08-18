import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSchoolProfile, createBooking, getAvailableSlotsForInstructor } from '../../services/api';
import LiveClock from '../../components/LiveClock';
import AccountMenu from '../../components/AccountMenu';
import '../../styles/search.css';

const SchoolProfile = () => {
  const { id } = useParams();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected teacher drilldown
  const [selectedInstructorId, setSelectedInstructorId] = useState(null);

  // Enrollment Drawer / Modal State
  const [enrollCourse, setEnrollCourse] = useState(null);
  const [enrollInstructor, setEnrollInstructor] = useState(null);
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
      const data = res.data.school;
      setSchool(data);
      if (data.instructors?.length > 0) {
        setSelectedInstructorId(data.instructors[0].id);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'School not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const openEnrollModal = async (course, instructor = null) => {
    setEnrollCourse(course);
    setBookingError('');
    setBookingSuccess('');
    setSelectedSlotId('');

    // Determine instructor (either passed, course's assigned instructor, or selected instructor, or first instructor)
    let inst = instructor;
    if (!inst && course.instructor) {
      inst = course.instructor;
    }
    if (!inst && selectedInstructorId) {
      inst = school.instructors.find((i) => i.id === selectedInstructorId);
    }
    if (!inst && school.instructors?.length > 0) {
      inst = school.instructors[0];
    }
    setEnrollInstructor(inst);

    if (inst) {
      setLoadingSlots(true);
      try {
        const res = await getAvailableSlotsForInstructor(inst.id);
        setAvailableSlots(res.data.slots || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSlots(false);
      }
    } else {
      setAvailableSlots([]);
    }
  };

  const handleEnrollInstructorChange = async (instId) => {
    const inst = school.instructors.find((i) => i.id === parseInt(instId));
    setEnrollInstructor(inst || null);
    setSelectedSlotId('');
    if (!instId) {
      setAvailableSlots([]);
      return;
    }
    setLoadingSlots(true);
    try {
      const res = await getAvailableSlotsForInstructor(instId);
      setAvailableSlots(res.data.slots || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    if (!selectedSlotId) {
      setBookingError('Please choose an available lesson time slot');
      return;
    }
    setSubmitting(true);
    try {
      const res = await createBooking({
        courseId: enrollCourse.id,
        slotId: selectedSlotId,
      });
      setBookingSuccess('🎉 Enrollment created successfully! Redirecting to payment & bookings...');
      setTimeout(() => {
        navigate('/learner/bookings');
      }, 1400);
    } catch (err) {
      setBookingError(err.response?.data?.error || 'Failed to enroll');
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Loading school details...</div>;
  if (error) return <div style={{ padding: '60px', textAlign: 'center' }}>{error} — <Link to="/learner">Back to Search</Link></div>;
  if (!school) return null;

  const currentTeacher = school.instructors?.find((i) => i.id === selectedInstructorId) || school.instructors?.[0];

  // Courses specific to this teacher, or general courses
  const teacherCourses = school.courses?.filter(
    (c) => c.instructorId === currentTeacher?.id || (!c.instructorId && selectedInstructorId == null)
  );
  const generalCourses = school.courses?.filter((c) => !c.instructorId) || [];
  const coursesToDisplay = teacherCourses && teacherCourses.length > 0 ? teacherCourses : school.courses;

  return (
    <div>
      {/* Hero Header */}
      {/* Hero Header */}
      <div className="profile-hero" style={{ background: '#181A1B', color: '#FFFFFF', padding: '24px 48px 36px' }}>
        {/* Dedicated Top Bar: Back Link + LiveClock + Bookings + Profile */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '14px' }}>
          <Link to="/learner" style={{ color: '#D32F2F', fontSize: '13px', fontWeight: 700, textDecoration: 'none', background: '#FFFFFF', padding: '5px 12px', borderRadius: '4px' }}>
            ← Back to Academies Search
          </Link>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginLeft: 'auto' }}>
            <LiveClock />
            <Link
              to="/learner/bookings"
              className="btn btn-outline"
              style={{
                color: '#FFFFFF',
                borderColor: 'rgba(255, 255, 255, 0.7)',
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '6px',
                textDecoration: 'none',
                background: 'rgba(255, 255, 255, 0.05)',
              }}
            >
              📋 My Bookings
            </Link>
            <AccountMenu />
          </div>
        </div>

        {/* School Info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span className="verified-tag" style={{ background: '#D32F2F', color: '#FFFFFF', fontWeight: 700, fontSize: '11px', padding: '4px 10px', borderRadius: '4px' }}>
              ✓ Verified Driving Academy
            </span>
            {school.avgRating && (
              <span style={{ color: '#FFD54F', fontWeight: 700, fontSize: '14px' }}>
                ★ {school.avgRating} ({school.reviewCount} reviews)
              </span>
            )}
          </div>
          <h1 style={{ margin: '10px 0 6px', fontSize: '30px', color: '#FFFFFF' }}>{school.name}</h1>
          <p style={{ color: '#E0E0E0', margin: 0, fontSize: '14px' }}>📍 {school.address}, {school.city}, {school.state}</p>
        </div>
      </div>

      {bookingSuccess && (
        <div style={{ background: '#E8F5E9', color: '#2E7D32', padding: '16px 48px', fontSize: '15px', fontWeight: 600, textAlign: 'center' }}>
          {bookingSuccess}
        </div>
      )}

      {/* Enrollment Modal / Card */}
      {enrollCourse && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '16px',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            maxWidth: '560px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#F2B705' }}>
                  Course Enrollment
                </span>
                <h2 style={{ margin: '4px 0 0', fontSize: '22px' }}>{enrollCourse.title}</h2>
              </div>
              <button
                onClick={() => setEnrollCourse(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#8B929A' }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: '#6B7680', fontSize: '14px', margin: '0 0 16px' }}>
              {enrollCourse.description || 'Full driving licensing curriculum with practical on-road sessions.'}
            </p>

            {/* Fee & Duration Summary */}
            <div style={{ background: '#F8F9FA', border: '1px solid #E9ECEF', borderRadius: '8px', padding: '14px 16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6B7680' }}>Course Duration</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#1C1F22' }}>⏱️ {enrollCourse.durationDays} Days</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: '#6B7680' }}>Total Enrollment Fee</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#2E7D32' }}>₹{Number(enrollCourse.price).toLocaleString('en-IN')}</div>
              </div>
            </div>

            <form onSubmit={handleEnrollSubmit}>
              {/* Teacher Selector */}
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>
                Assigned Instructor / Teacher
              </label>
              <select
                value={enrollInstructor?.id || ''}
                onChange={(e) => handleEnrollInstructorChange(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #D8D4C9', borderRadius: '6px', fontSize: '14px', marginBottom: '16px' }}
              >
                <option value="">Select Instructor...</option>
                {school.instructors?.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.user.name} {i.specialization ? `(${i.specialization})` : ''} — {i.experienceYears || 0} yrs exp
                  </option>
                ))}
              </select>

              {/* Slot Picker */}
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>
                Select Your Initial Lesson Slot *
              </label>

              {loadingSlots ? (
                <p style={{ color: '#6B7680', fontSize: '13px' }}>Loading instructor's available slots...</p>
              ) : availableSlots.length === 0 ? (
                <div style={{ padding: '14px', background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: '6px', fontSize: '13px', color: '#F57F17', marginBottom: '16px' }}>
                  No open slots found for this instructor right now. You can choose another teacher or contact the school.
                </div>
              ) : (
                <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1.5px solid #D8D4C9', borderRadius: '6px', marginBottom: '18px' }}>
                  {availableSlots.map((s) => {
                    const [sh, sm] = s.startTime.split(':').map(Number);
                    const [eh, em] = s.endTime.split(':').map(Number);
                    const diff = (eh * 60 + em) - (sh * 60 + sm);
                    const durText = diff === 60 ? '1 hr' : diff > 60 ? `${Math.floor(diff / 60)}h ${diff % 60}m` : `${diff} min`;

                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedSlotId(s.id)}
                        style={{
                          padding: '10px 14px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          background: selectedSlotId === s.id ? '#FFF9E6' : 'white',
                          borderBottom: '1px solid #F0EEE7',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <strong>{new Date(s.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
                          <span style={{ marginLeft: '10px', color: '#1C1F22' }}>{s.startTime} – {s.endTime}</span>
                        </div>
                        <span
                          style={{
                            fontSize: '11px',
                            background: selectedSlotId === s.id ? '#F2B705' : '#ECEFF1',
                            color: selectedSlotId === s.id ? '#1C1F22' : '#455A64',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontWeight: 700,
                          }}
                        >
                          {durText} lesson
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {bookingError && (
                <div style={{ color: '#D32F2F', fontSize: '13px', marginBottom: '14px', background: '#FFEBEE', padding: '8px 12px', borderRadius: '4px' }}>
                  {bookingError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || !selectedSlotId}
                  style={{ flex: 1, padding: '12px', fontSize: '15px' }}
                >
                  {submitting ? 'Processing Enrollment...' : `Enroll & Pay ₹${Number(enrollCourse.price).toLocaleString('en-IN')}`}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setEnrollCourse(null)}
                  style={{ color: '#1C1F22', border: '1.5px solid #1C1F22', padding: '12px 18px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Body */}
      <div className="profile-body">
        <div>
          {/* STEP 1: Teacher Showcase */}
          <div className="profile-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px' }}>👨‍🏫 Instructors & Teachers</h2>
                <p style={{ color: '#6B7680', fontSize: '13px', margin: '4px 0 0' }}>
                  Select an instructor to view their specialized courses and available lesson slots.
                </p>
              </div>
            </div>

            {school.instructors?.length === 0 ? (
              <p style={{ color: '#8B929A' }}>No instructors registered at this school yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                {school.instructors?.map((inst) => {
                  const isSelected = selectedInstructorId === inst.id;
                  const slotCount = inst.availabilitySlots?.length || 0;
                  const courseCount = inst.courses?.length || 0;

                  return (
                    <div
                      key={inst.id}
                      onClick={() => setSelectedInstructorId(inst.id)}
                      style={{
                        padding: '16px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #F2B705' : '1px solid #E0DDD5',
                        background: isSelected ? '#FFFCF2' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease-in-out',
                        boxShadow: isSelected ? '0 4px 12px rgba(242, 183, 5, 0.18)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1C1F22', color: '#F2B705', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px' }}>
                          {inst.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong style={{ fontSize: '15px', color: '#1C1F22' }}>{inst.user.name}</strong>
                          <div style={{ fontSize: '12px', color: '#6B7680' }}>
                            {inst.specialization || 'Certified Driving Trainer'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px', fontSize: '12px' }}>
                        <span style={{ background: '#F0EEE7', padding: '3px 8px', borderRadius: '4px', color: '#1C1F22', fontWeight: 600 }}>
                          ⭐ {inst.experienceYears != null ? `${inst.experienceYears} yrs exp` : 'Experienced'}
                        </span>
                        <span style={{ background: slotCount > 0 ? '#E8F5E9' : '#ECEFF1', color: slotCount > 0 ? '#2E7D32' : '#6B7680', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          📅 {slotCount} free slot{slotCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* STEP 2: Courses Offered */}
          <div className="profile-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px' }}>
                  📚 Available Courses {currentTeacher ? `(with ${currentTeacher.user.name})` : ''}
                </h2>
                <p style={{ color: '#6B7680', fontSize: '13px', margin: '4px 0 0' }}>
                  Choose a course package, check the enrollment fees, and select your lesson schedule.
                </p>
              </div>
            </div>

            {coursesToDisplay?.length === 0 ? (
              <p style={{ color: '#8B929A' }}>No courses available for this instructor yet.</p>
            ) : (
              coursesToDisplay?.map((c) => (
                <div key={c.id} className="course-card" style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '17px' }}>{c.title}</h4>
                      {c.instructorId && (
                        <span style={{ fontSize: '11px', background: '#F0EEE7', padding: '2px 8px', borderRadius: '4px', color: '#1C1F22' }}>
                          👨‍🏫 {school.instructors?.find((i) => i.id === c.instructorId)?.user?.name || 'Assigned Instructor'}
                        </span>
                      )}
                    </div>
                    <p style={{ color: '#6B7680', fontSize: '13px', margin: '4px 0 8px' }}>
                      {c.description || 'Full driving curriculum with road test preparation.'}
                    </p>
                    <span style={{ fontSize: '12px', color: '#8B929A', fontWeight: 600 }}>
                      ⏱️ Duration: {c.durationDays} Days Course
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div className="course-price-tag" style={{ fontSize: '18px', fontWeight: 800, color: '#1C1F22' }}>
                      ₹{Number(c.price).toLocaleString('en-IN')}
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ marginTop: '8px', fontSize: '13px', padding: '8px 18px' }}
                      onClick={() => openEnrollModal(c, currentTeacher)}
                    >
                      Enroll in Course →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* About Section */}
          <div className="profile-section">
            <h2>About {school.name}</h2>
            <p style={{ color: '#495057', lineHeight: 1.6 }}>{school.description || 'No description provided by this school yet.'}</p>
          </div>

          {/* Reviews Section */}
          <div className="profile-section">
            <h2>Learner Reviews {school.avgRating && `(★ ${school.avgRating} average)`}</h2>
            {school.reviews?.length === 0 ? (
              <p style={{ color: '#8B929A' }}>No reviews yet.</p>
            ) : (
              school.reviews?.map((r) => (
                <div key={r.id} style={{ borderBottom: '1px solid #EFEDE6', padding: '12px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '14px' }}>{r.learner.name}</strong>
                    <span style={{ color: '#F2B705', fontWeight: 600 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  {r.comment && <p style={{ fontSize: '14px', color: '#6B7680', margin: '4px 0 0' }}>{r.comment}</p>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="sidebar-card" style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px' }}>📍 School Locations & Branches</h4>
            {school.branches?.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#8B929A', margin: 0 }}>Main campus only.</p>
            ) : (
              school.branches?.map((b) => (
                <div key={b.id} style={{ fontSize: '13px', marginBottom: '8px', color: '#495057' }}>
                  • <strong>{b.city}</strong>: {b.address}, {b.state}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolProfile;