import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getInstructorCourses, getMyWorkplace, addCourse, deleteCourse, getMyCourses } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LiveClock from '../../components/LiveClock';
import AccountMenu from '../../components/AccountMenu';
import '../../styles/dashboard.css';

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [myCreatedCourses, setMyCreatedCourses] = useState([]);
  const [workplace, setWorkplace] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showAddCourse, setShowAddCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: '', description: '', price: '', durationDays: '' });
  const [courseError, setCourseError] = useState('');
  const [savingCourse, setSavingCourse] = useState(false);

  const { user } = useAuth();

  const loadData = async () => {
    try {
      const [coursesRes, workplaceRes, myCoursesRes] = await Promise.all([
        getInstructorCourses(),
        getMyWorkplace(),
        getMyCourses().catch(() => ({ data: { courses: [] } })),
      ]);
      setCourses(coursesRes.data.courses || []);
      setWorkplace(workplaceRes.data.workplace || null);
      setMyCreatedCourses(myCoursesRes.data.courses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCourseChange = (e) => {
    setCourseForm({ ...courseForm, [e.target.name]: e.target.value });
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCourseError('');
    setSavingCourse(true);
    try {
      await addCourse(courseForm);
      setCourseForm({ title: '', description: '', price: '', durationDays: '' });
      setShowAddCourse(false);
      await loadData();
    } catch (err) {
      setCourseError(err.response?.data?.error || 'Failed to create course');
    } finally {
      setSavingCourse(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await deleteCourse(courseId);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete course');
    }
  };

  const assignedCourseIds = new Set(courses.map((c) => c.id));
  const unassignedCourses = workplace?.allCourses?.filter((c) => !assignedCourseIds.has(c.id)) || [];

  return (
    <div className="dash-page">
      <div className="dash-header">
        <h1>Instructor Dashboard</h1>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddCourse(!showAddCourse)}
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            {showAddCourse ? '✕ Close Form' : '+ Create Course'}
          </button>
          <Link to="/instructor/availability" className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22', padding: '8px 16px', fontSize: '14px' }}>
            📅 Manage Availability Slots
          </Link>
          <LiveClock />
          <AccountMenu />
        </div>
      </div>

      <p style={{ color: '#6B7680', marginBottom: '20px' }}>
        Welcome, {user?.name}. Manage your courses, teaching schedule, and enrolled students.
      </p>

      {/* Add Course Form */}
      {showAddCourse && (
        <form className="form-card" onSubmit={handleCreateCourse} style={{ marginBottom: '28px', maxWidth: '650px', border: '2px solid #F2B705' }}>
          <h3 style={{ marginTop: 0, marginBottom: '14px' }}>➕ Create a New Course</h3>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '13px' }}>Course Title *</label>
          <input
            type="text"
            name="title"
            placeholder="e.g. 2-Wheeler Beginner Licensing Course"
            value={courseForm.title}
            onChange={handleCourseChange}
            required
            style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #D8D4C9', borderRadius: '6px' }}
          />

          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '13px' }}>Description</label>
          <textarea
            name="description"
            placeholder="Course syllabus, vehicle type, road training details..."
            value={courseForm.description}
            onChange={handleCourseChange}
            rows={3}
            style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #D8D4C9', borderRadius: '6px' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '13px' }}>Enrollment Fee (₹) *</label>
              <input
                type="number"
                name="price"
                placeholder="1500"
                value={courseForm.price}
                onChange={handleCourseChange}
                required
                min="0"
                style={{ width: '100%', padding: '10px', border: '1px solid #D8D4C9', borderRadius: '6px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '13px' }}>Duration (Days) *</label>
              <input
                type="number"
                name="durationDays"
                placeholder="15"
                value={courseForm.durationDays}
                onChange={handleCourseChange}
                required
                min="1"
                style={{ width: '100%', padding: '10px', border: '1px solid #D8D4C9', borderRadius: '6px' }}
              />
            </div>
          </div>

          {courseError && <p style={{ color: '#D32F2F', fontSize: '13px', marginTop: '10px', marginBottom: '10px' }}>{courseError}</p>}

          <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary" disabled={savingCourse}>
              {savingCourse ? 'Publishing...' : 'Publish Course'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setShowAddCourse(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {workplace && (
            <div className="form-card" style={{ marginBottom: '28px', maxWidth: '750px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '4px' }}>🏫 {workplace.schoolName}</h3>
              <p style={{ color: '#8B929A', fontSize: '13px', marginBottom: '12px' }}>
                📍 {workplace.address}, {workplace.city}, {workplace.state}
              </p>
              {workplace.description && (
                <p style={{ fontSize: '14px', color: '#6B7680', marginBottom: '12px' }}>{workplace.description}</p>
              )}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {workplace.specialization && (
                  <span className="dash-price-tag" style={{ background: '#F0EEE7', color: '#1C1F22' }}>
                    🏷️ {workplace.specialization}
                  </span>
                )}
                {workplace.experienceYears != null && (
                  <span className="dash-price-tag" style={{ background: '#F0EEE7', color: '#1C1F22' }}>
                    ⭐ {workplace.experienceYears} yrs experience
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Courses created / taught by instructor */}
          <div className="dash-header" style={{ marginTop: '20px' }}>
            <h2 style={{ fontSize: '20px' }}>Courses Taught By You</h2>
          </div>

          {myCreatedCourses.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              {myCreatedCourses.map((c) => (
                <div className="form-card" key={c.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ margin: '0 0 6px' }}>{c.title}</h3>
                      <span className="dash-price-tag" style={{ background: '#E8F5E9', color: '#2E7D32', fontWeight: 700 }}>
                        ₹{Number(c.price).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p style={{ color: '#6B7680', fontSize: '13px', margin: '4px 0 10px' }}>
                      ⏱️ {c.durationDays} days · {c.school?.name || workplace?.schoolName}
                    </p>
                    {c.description && (
                      <p style={{ fontSize: '13px', color: '#495057', marginBottom: '12px' }}>{c.description}</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #ECEAE4', paddingTop: '10px' }}>
                    <Link to={`/instructor/course/${c.id}`} style={{ fontSize: '13px', fontWeight: 600, color: '#1C1F22', textDecoration: 'none' }}>
                      View Students →
                    </Link>
                    <button className="action-btn reject-btn" onClick={() => handleDeleteCourse(c.id)} style={{ fontSize: '12px' }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Student Classrooms */}
          <div className="dash-header" style={{ marginTop: '24px' }}>
            <h2 style={{ fontSize: '20px' }}>Active Student Classrooms</h2>
          </div>

          {courses.length === 0 ? (
            <div className="empty-state">
              You don't have any students assigned yet. Once a learner enrolls in your course and books a time slot, it will show up here.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
              {courses.map((c) => (
                <Link to={`/instructor/course/${c.id}`} key={c.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="form-card" style={{ height: '100%' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '4px' }}>{c.title}</h3>
                    <p style={{ color: '#8B929A', fontSize: '13px', marginBottom: '16px' }}>
                      {c.schoolName} · {c.durationDays} days
                    </p>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <div className="dash-price-tag" style={{ background: '#F0EEE7', color: '#1C1F22' }}>
                        {c.totalStudents} total
                      </div>
                      <div className="dash-price-tag" style={{ background: '#D4EDDA', color: '#155724' }}>
                        {c.ongoingStudents} ongoing
                      </div>
                      <div className="dash-price-tag" style={{ background: '#E4E1D9', color: '#1C1F22' }}>
                        {c.completedStudents} completed
                      </div>
                    </div>
                    <p style={{ marginTop: '16px', marginBottom: 0, color: '#F2B705', fontSize: '13px', fontWeight: 600 }}>
                      View Students & Calendar →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InstructorDashboard;