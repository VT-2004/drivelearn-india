import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSchoolProfile } from '../../services/api';
import '../../styles/search.css';

const SchoolProfile = () => {
  const { id } = useParams();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
    load();
  }, [id]);

  if (loading) return <div style={{ padding: '60px' }}>Loading...</div>;
  if (error) return <div style={{ padding: '60px' }}>{error} — <Link to="/learner">Go back to search</Link></div>;
  if (!school) return null;

  return (
    <div>
      <div className="profile-hero">
        <Link to="/learner" style={{ color: '#F2B705', fontSize: '13px', textDecoration: 'none' }}>← Back to search</Link>
        <span className="verified-tag" style={{ marginTop: '16px' }}>Verified School</span>
        <h1>{school.name}</h1>
        <p style={{ color: '#C8CDD2' }}>{school.address}, {school.city}, {school.state}</p>
      </div>

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
                <div className="course-card" key={c.id}>
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
                    <button className="btn btn-primary" style={{ marginTop: '10px', fontSize: '13px', padding: '8px 16px' }} disabled>
                      Book (coming soon)
                    </button>
                  </div>
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
          <div className="sidebar-card">
            <h4>Contact</h4>
            <p style={{ fontSize: '14px', color: '#6B7680' }}>
              Booking and direct contact will be available soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolProfile;