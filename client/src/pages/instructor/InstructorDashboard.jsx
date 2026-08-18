import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getInstructorCourses, getMyWorkplace } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LiveClock from '../../components/LiveClock';
import AccountMenu from '../../components/AccountMenu';
import '../../styles/dashboard.css';

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [workplace, setWorkplace] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const [coursesRes, workplaceRes] = await Promise.all([
          getInstructorCourses(),
          getMyWorkplace(),
        ]);
        setCourses(coursesRes.data.courses);
        setWorkplace(workplaceRes.data.workplace);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const assignedCourseIds = new Set(courses.map((c) => c.id));
  const unassignedCourses = workplace?.allCourses?.filter((c) => !assignedCourseIds.has(c.id)) || [];

  return (
    <div className="dash-page">
      <div className="dash-header">
        <h1>My Courses</h1>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link to="/instructor/availability" className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22' }}>
            📅 Manage Availability
          </Link>
          <LiveClock />
          <AccountMenu />
        </div>
      </div>

      <p style={{ color: '#6B7680', marginBottom: '20px' }}>
        Welcome, {user?.name}.
      </p>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {workplace && (
            <div className="form-card" style={{ marginBottom: '28px', maxWidth: '750px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '4px' }}>{workplace.schoolName}</h3>
              <p style={{ color: '#8B929A', fontSize: '13px', marginBottom: '12px' }}>
                {workplace.address}, {workplace.city}, {workplace.state}
              </p>
              {workplace.description && (
                <p style={{ fontSize: '14px', color: '#6B7680', marginBottom: '12px' }}>{workplace.description}</p>
              )}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {workplace.specialization && (
                  <span className="dash-price-tag" style={{ background: '#F0EEE7', color: '#1C1F22' }}>
                    {workplace.specialization}
                  </span>
                )}
                {workplace.experienceYears != null && (
                  <span className="dash-price-tag" style={{ background: '#F0EEE7', color: '#1C1F22' }}>
                    {workplace.experienceYears} yrs experience
                  </span>
                )}
              </div>
            </div>
          )}

          {courses.length === 0 ? (
            <div className="empty-state">
              You don't have any students assigned yet. Once a learner books a course you're
              assigned to, it'll show up here.
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

          {unassignedCourses.length > 0 && (
            <>
              <div className="dash-header">
                <h1 style={{ fontSize: '18px' }}>Other Courses at This School</h1>
              </div>
              <p style={{ color: '#8B929A', fontSize: '13px', marginBottom: '16px' }}>
                Offered by your school, but you don't have any students in these yet.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {unassignedCourses.map((c) => (
                  <div key={c.id} className="dash-price-tag" style={{ background: '#F0EEE7', color: '#6B7680' }}>
                    {c.title} ({c.durationDays}d)
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default InstructorDashboard;